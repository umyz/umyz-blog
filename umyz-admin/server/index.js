import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sharp from 'sharp'
import { mkdir, readdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { readMdx, writeMdx } from './mdx.js'

const app = express()
const exec = promisify(execFile)
const contentDir = path.resolve(process.env.CONTENT_DIR || '../src/content')
const mediaDir = path.resolve(process.env.MEDIA_DIR || '../public/docs-static')
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const repository = path.resolve(process.env.GIT_REPOSITORY || projectRoot)
const gitBinary = process.env.GIT_BIN || (process.platform === 'win32' && existsSync('C:\\Program Files\\Git\\cmd\\git.exe') ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git')
const siteConfigFile = path.resolve(process.env.SITE_CONFIG_FILE || '../src/data/site-config.json')
const authorsFile = path.resolve(process.env.AUTHORS_FILE || '../src/data/authors.json')
const mediaMetadataFile = path.resolve(process.env.MEDIA_METADATA_FILE || '../src/data/media.json')
const trashDir = path.join(contentDir, '.trash')
const revisionsDir = path.join(contentDir, '.revisions')
const publishLogFile = path.join(repository, '.admin', 'publish-history.json')
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

app.use(cors())
app.use(express.json({ limit: '2mb' }))

async function readPublishHistory() {
  if (!existsSync(publishLogFile)) return []
  try { return JSON.parse(await readFile(publishLogFile, 'utf8')) } catch { return [] }
}

async function appendPublishHistory(entry) {
  const history = await readPublishHistory()
  history.unshift(entry)
  await mkdir(path.dirname(publishLogFile), { recursive: true })
  await writeFile(publishLogFile, `${JSON.stringify(history.slice(0, 30), null, 2)}\n`, 'utf8')
}

async function readMediaMetadata() {
  if (!existsSync(mediaMetadataFile)) return {}
  try {
    const metadata = JSON.parse(await readFile(mediaMetadataFile, 'utf8'))
    return metadata && !Array.isArray(metadata) ? metadata : {}
  } catch { return {} }
}

const mediaDefaults = name => {
  const title = path.parse(name).name.replace(/[-_]+/g, ' ').trim()
  return { title, alt: title }
}

const toMediaItem = (file, metadata) => {
  const publicPath = `/${path.relative(path.dirname(mediaDir), file).replaceAll('\\', '/')}`
  return { name: path.basename(file), path: publicPath, folder: path.relative(mediaDir, path.dirname(file)).replaceAll('\\', '/'), ...mediaDefaults(path.basename(file)), ...(metadata[publicPath] || {}) }
}

app.get('/api/site-config', async (_req, res, next) => {
  try { res.json(JSON.parse(await readFile(siteConfigFile, 'utf8'))) } catch (error) { next(error) }
})

app.put('/api/site-config', async (req, res, next) => {
  try {
    const config = req.body
    if (!config?.home || !Array.isArray(config.categories) || !Array.isArray(config.tags) || !config.footer || !config.social || !Array.isArray(config.pages)) {
      return res.status(400).json({ error: 'Geçersiz site ayarı verisi.' })
    }
    await writeFile(siteConfigFile, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
    res.json({ ok: true })
  } catch (error) { next(error) }
})

app.get('/api/authors', async (_req, res, next) => {
  try { res.json(JSON.parse(await readFile(authorsFile, 'utf8'))) } catch (error) { next(error) }
})

app.put('/api/authors', async (req, res, next) => {
  try {
    if (!req.body || Array.isArray(req.body)) return res.status(400).json({ error: 'Geçersiz yazar verisi.' })
    await writeFile(authorsFile, `${JSON.stringify(req.body, null, 2)}\n`, 'utf8')
    res.json({ ok: true })
  } catch (error) { next(error) }
})

const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9ğüşıöç]+/gi, '-').replace(/^-|-$/g, '')
const safeSegment = value => /^[a-z0-9ğüşıöç-]+$/i.test(value) ? value : null
const relativeArticlePath = slug => path.join(new Date().getFullYear().toString(), String(new Date().getMonth() + 1).padStart(2, '0'), `${slug}.mdx`)

async function walk(dir, includeTrash = false) {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.filter(entry => includeTrash || !['.trash', '.revisions'].includes(entry.name)).map(async entry => entry.isDirectory() ? walk(path.join(dir, entry.name), includeTrash) : [path.join(dir, entry.name)]))
  return nested.flat()
}

app.get('/api/articles', async (_req, res, next) => {
  try {
    const files = (await walk(contentDir)).filter(file => file.endsWith('.mdx'))
    const articles = await Promise.all(files.map(async file => {
      try {
        const parsed = readMdx(await readFile(file, 'utf8'))
        return { slug: path.basename(file, '.mdx'), path: path.relative(contentDir, file).replaceAll('\\', '/'), ...parsed.exports }
      } catch (error) {
        throw new Error(`${path.relative(contentDir, file)}: ${error.message}`)
      }
    }))
    res.json(articles.sort((a, b) => (b.date || '').localeCompare(a.date || '')))
  } catch (error) { next(error) }
})

app.get('/api/articles/:slug', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    const file = (await walk(contentDir)).find(item => path.basename(item, '.mdx') === slug)
    if (!slug || !file) return res.status(404).json({ error: 'Makale bulunamadı.' })
    res.json({ slug, path: path.relative(contentDir, file).replaceAll('\\', '/'), ...readMdx(await readFile(file, 'utf8')) })
  } catch (error) { next(error) }
})

app.get('/api/trash', async (_req, res, next) => {
  try {
    const files = (await walk(trashDir, true)).filter(file => file.endsWith('.mdx'))
    const articles = await Promise.all(files.map(async file => {
      const parsed = readMdx(await readFile(file, 'utf8'))
      return { slug: path.basename(file, '.mdx'), path: path.relative(trashDir, file).replaceAll('\\', '/'), ...parsed.exports }
    }))
    res.json(articles)
  } catch (error) { next(error) }
})

app.get('/api/media', async (_req, res, next) => {
  try {
    const files = (await walk(mediaDir, true)).filter(file => imageExtensions.has(path.extname(file).toLowerCase()))
    const metadata = await readMediaMetadata()
    res.json(files.map(file => toMediaItem(file, metadata)).sort((a, b) => a.path.localeCompare(b.path)))
  } catch (error) { next(error) }
})

app.put('/api/media/metadata', async (req, res, next) => {
  try {
    const publicPath = String(req.body?.path || '')
    const title = String(req.body?.title || '').trim().slice(0, 180)
    const alt = String(req.body?.alt || '').trim().slice(0, 250)
    if (!publicPath.startsWith('/docs-static/') || publicPath.includes('..')) return res.status(400).json({ error: 'Geçersiz görsel yolu.' })
    const file = path.resolve(path.dirname(mediaDir), `.${publicPath}`)
    if (!file.startsWith(`${mediaDir}${path.sep}`) || !existsSync(file)) return res.status(404).json({ error: 'Görsel bulunamadı.' })
    const metadata = await readMediaMetadata()
    metadata[publicPath] = { title: title || mediaDefaults(path.basename(file)).title, alt: alt || mediaDefaults(path.basename(file)).alt }
    await writeFile(mediaMetadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
    res.json({ ok: true, path: publicPath, ...metadata[publicPath] })
  } catch (error) { next(error) }
})

app.get('/api/media/unused', async (_req, res, next) => {
  try {
    const files = (await walk(mediaDir, true)).filter(file => imageExtensions.has(path.extname(file).toLowerCase()))
    const contentFiles = await walk(contentDir)
    const textSources = await Promise.all([
      ...contentFiles.map(file => readFile(file, 'utf8')),
      readFile(siteConfigFile, 'utf8'),
      readFile(authorsFile, 'utf8')
    ])
    const searchable = textSources.join('\n')
    const unused = files.map(file => ({
      name: path.basename(file),
      path: `/${path.relative(path.dirname(mediaDir), file).replaceAll('\\', '/')}`,
      folder: path.relative(mediaDir, path.dirname(file)).replaceAll('\\', '/')
    })).filter(item => !searchable.includes(item.path))
    res.json({ total: files.length, unused })
  } catch (error) { next(error) }
})

app.delete('/api/articles/:slug', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    const file = (await walk(contentDir)).find(item => path.basename(item, '.mdx') === slug)
    if (!slug || !file) return res.status(404).json({ error: 'Makale bulunamadı.' })
    const destination = path.join(trashDir, path.relative(contentDir, file))
    await mkdir(path.dirname(destination), { recursive: true })
    await rename(file, destination)
    res.json({ ok: true })
  } catch (error) { next(error) }
})

app.post('/api/trash/:slug/restore', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    const file = (await walk(trashDir, true)).find(item => path.basename(item, '.mdx') === slug)
    if (!slug || !file) return res.status(404).json({ error: 'Çöp kutusu kaydı bulunamadı.' })
    const destination = path.join(contentDir, path.relative(trashDir, file))
    await mkdir(path.dirname(destination), { recursive: true })
    await rename(file, destination)
    res.json({ ok: true })
  } catch (error) { next(error) }
})

app.delete('/api/trash/:slug', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    const file = (await walk(trashDir, true)).find(item => path.basename(item, '.mdx') === slug)
    if (!slug || !file) return res.status(404).json({ error: 'Çöp kutusu kaydı bulunamadı.' })
    await rm(file)
    res.json({ ok: true })
  } catch (error) { next(error) }
})

app.put('/api/articles/:slug', async (req, res, next) => {
  try {
    const slug = slugify(req.params.slug || req.body.title)
    if (!slug) return res.status(400).json({ error: 'Geçerli bir başlık veya slug gerekli.' })
    const existing = (await walk(contentDir)).find(item => path.basename(item, '.mdx') === slug)
    const file = existing || path.join(contentDir, relativeArticlePath(slug))
    await mkdir(path.dirname(file), { recursive: true })
    if (existing) {
      const revisionPath = path.join(revisionsDir, slug, `${Date.now()}.mdx`)
      await mkdir(path.dirname(revisionPath), { recursive: true })
      await writeFile(revisionPath, await readFile(existing, 'utf8'), 'utf8')
    }
    const metadata = { ...req.body, date: req.body.date || new Date().toISOString().slice(0, 10) }
    await writeFile(file, writeMdx(metadata, req.body.body || ''), 'utf8')
    res.json({ slug, path: path.relative(contentDir, file).replaceAll('\\', '/') })
  } catch (error) { next(error) }
})

app.get('/api/articles/:slug/revisions', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    if (!slug) return res.status(400).json({ error: 'Geçersiz slug.' })
    const folder = path.join(revisionsDir, slug)
    if (!existsSync(folder)) return res.json([])
    const files = (await readdir(folder)).filter(file => file.endsWith('.mdx')).sort().reverse()
    res.json(files.map(file => ({ id: file.replace('.mdx', ''), createdAt: new Date(Number(file.replace('.mdx', ''))).toISOString() })))
  } catch (error) { next(error) }
})

app.get('/api/articles/:slug/revisions/:revision', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    const revision = String(req.params.revision)
    if (!slug || !/^\d+$/.test(revision)) return res.status(400).json({ error: 'Geçersiz revizyon.' })
    const source = path.join(revisionsDir, slug, `${revision}.mdx`)
    if (!existsSync(source)) return res.status(404).json({ error: 'Revizyon bulunamadı.' })
    const parsed = readMdx(await readFile(source, 'utf8'))
    res.json({ id: revision, ...parsed })
  } catch (error) { next(error) }
})

app.post('/api/articles/:slug/revisions/:revision/restore', async (req, res, next) => {
  try {
    const slug = safeSegment(req.params.slug)
    const revision = String(req.params.revision)
    if (!slug || !/^\d+$/.test(revision)) return res.status(400).json({ error: 'Geçersiz revizyon.' })
    const source = path.join(revisionsDir, slug, `${revision}.mdx`)
    if (!existsSync(source)) return res.status(404).json({ error: 'Revizyon bulunamadı.' })
    const destination = (await walk(contentDir)).find(item => path.basename(item, '.mdx') === slug)
    if (!destination) return res.status(404).json({ error: 'Makale bulunamadı.' })
    const backup = path.join(revisionsDir, slug, `${Date.now()}.mdx`)
    await writeFile(backup, await readFile(destination, 'utf8'), 'utf8')
    await writeFile(destination, await readFile(source, 'utf8'), 'utf8')
    res.json({ ok: true })
  } catch (error) { next(error) }
})

app.post('/api/media', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !imageTypes.has(req.file.mimetype)) return res.status(400).json({ error: 'JPEG, PNG, WebP veya GIF yükleyin.' })
    const slug = slugify(req.body.slug)
    if (!slug) return res.status(400).json({ error: 'Makale slug bilgisi gerekli.' })
    const now = new Date()
    const originalBase = slugify(path.parse(req.file.originalname).name)
    const extension = req.file.mimetype === 'image/gif' ? '.gif' : '.webp'
    const name = `${Date.now()}-${originalBase}${extension}`
    const output = path.join(mediaDir, 'img', String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'), slug, name)
    await mkdir(path.dirname(output), { recursive: true })
    if (req.file.mimetype === 'image/gif') {
      await writeFile(output, req.file.buffer)
    } else {
      await sharp(req.file.buffer).rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(output)
    }
    const publicPath = `/${path.relative(path.dirname(mediaDir), output).replaceAll('\\', '/')}`
    const metadata = await readMediaMetadata()
    metadata[publicPath] = { title: originalBase, alt: originalBase.replaceAll('-', ' ') }
    await writeFile(mediaMetadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
    res.status(201).json({ path: publicPath, ...metadata[publicPath] })
  } catch (error) { next(error) }
})

app.post('/api/publish', async (req, res, next) => {
  const startedAt = new Date().toISOString()
  try {
    if (process.env.GIT_PUBLISH_ENABLED !== 'true') return res.status(403).json({ error: 'Yayınlama için GIT_PUBLISH_ENABLED=true ayarlayın.' })
    const message = `Yayınla: ${String(req.body.title || 'yönetim paneli').slice(0, 100)}`
    const build = process.platform === 'win32'
      ? await exec('cmd.exe', ['/d', '/s', '/c', 'npm run build'], { cwd: repository, maxBuffer: 20 * 1024 * 1024 })
      : await exec('npm', ['run', 'build'], { cwd: repository, maxBuffer: 20 * 1024 * 1024 })
    await exec(gitBinary, ['add', 'src/content', 'src/data/site-config.json', 'src/data/authors.json', 'src/data/media.json', 'public/docs-static'], { cwd: repository })
    const { stdout: pending } = await exec(gitBinary, ['diff', '--cached', '--name-only'], { cwd: repository })
    let committed = false
    if (pending.trim()) {
      await exec(gitBinary, ['commit', '-m', message], { cwd: repository })
      await exec(gitBinary, ['push'], { cwd: repository })
      committed = true
    }
    let restarted = false
    if (process.env.LOCAL_RESTART_ENABLED === 'true' && process.platform === 'win32') {
      const restart = spawn('cmd.exe', ['/c', path.join(repository, 'scripts', 'restart-blog.cmd')], { detached: true, stdio: 'ignore' })
      restart.unref()
      restarted = true
    }
    const result = { at: startedAt, status: 'success', committed, restarted, build: build.stdout.slice(-1200) }
    await appendPublishHistory(result)
    res.json({ ok: true, ...result })
  } catch (error) {
    await appendPublishHistory({ at: startedAt, status: 'error', error: error.message || 'Beklenmeyen hata.' })
    next(error)
  }
})

app.get('/api/publish/history', async (_req, res, next) => {
  try { res.json(await readPublishHistory()) } catch (error) { next(error) }
})

app.get('/api/publish/status', async (_req, res) => {
  const result = { publishEnabled: process.env.GIT_PUBLISH_ENABLED === 'true', repository, gitAvailable: false, repositoryIsGit: false, branch: '', remote: '', changes: 0 }
  try {
    await exec(gitBinary, ['--version'], { cwd: repository })
    result.gitAvailable = true
    const [{ stdout: branch }, { stdout: remote }, { stdout: changes }] = await Promise.all([
      exec(gitBinary, ['branch', '--show-current'], { cwd: repository }),
      exec(gitBinary, ['remote', 'get-url', 'origin'], { cwd: repository }),
      exec(gitBinary, ['status', '--porcelain'], { cwd: repository })
    ])
    result.repositoryIsGit = true
    result.branch = branch.trim()
    result.remote = remote.trim()
    result.changes = changes.trim() ? changes.trim().split('\n').length : 0
  } catch (error) { result.error = error.message }
  res.json(result)
})

app.use(express.static(path.resolve('dist')))
app.get('*splat', (_req, res) => res.sendFile(path.resolve('dist/index.html')))
app.use((error, _req, res, _next) => res.status(500).json({ error: error.message || 'Beklenmeyen hata.' }))
app.listen(process.env.PORT || 3001, () => console.log('umyz-admin hazır.'))
