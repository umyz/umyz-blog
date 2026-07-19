import { AllContent } from '@/components/AllContent'
import { articles } from '@/data/articles'

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9ğüşiöç]+/gi, '-').replace(/^-|-$/g, '')
const getTags = () => [...new Set(articles.flatMap(article => article.tags || []))].sort((a, b) => a.localeCompare(b, 'tr'))

export default function TagPage({ tag }) {
  return <AllContent tag={tag} />
}

export function getStaticPaths() {
  // Keep existing static MDX archives while allowing new admin-created tags.
  return { paths: [], fallback: 'blocking' }
}

export function getStaticProps({ params }) {
  const tag = getTags().find(item => slugify(item) === params.tag)
  if (!tag) return { notFound: true }
  return { props: { tag, title: tag, description: `${tag} etiketindeki yazılar.` } }
}
