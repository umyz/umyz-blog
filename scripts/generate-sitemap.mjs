import { writeFileSync } from 'fs'
import { join } from 'path'
import { articles } from '../src/data/articles.js'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://umyz.tr'

function generateSitemap() {
  // Static pages
  const staticPages = [
    { path: '', priority: '1.0' },
    { path: 'content', priority: '0.9' },
    { path: 'team', priority: '0.8' },
    { path: 'partner', priority: '0.8' },
  ]

  const categories = [...new Set(articles.flatMap(article => article.categories || []))]
    .filter(Boolean)
    .map(category => category.toLowerCase())
  const tags = [...new Set(articles.flatMap(article => article.tags || []))]
    .filter(Boolean)
    .map(tag => tag.toLowerCase())

  const today = new Date().toISOString().split('T')[0]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${SITE_URL}/${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${categories.map(category => `  <url>
    <loc>${SITE_URL}/categories/${category}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${tags.map(tag => `  <url>
    <loc>${SITE_URL}/tags/${tag}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
${articles.map(article => `  <url>
    <loc>${SITE_URL}${article.href}</loc>
    <lastmod>${article.dateModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`

  const totalUrls = staticPages.length + categories.length + tags.length + articles.length
  writeFileSync(join(process.cwd(), 'public/sitemap.xml'), sitemap)
  console.log(`✓ Generated sitemap with ${totalUrls} URLs (${staticPages.length} static, ${categories.length} categories, ${tags.length} tags, ${articles.length} articles)`)
}

generateSitemap()
