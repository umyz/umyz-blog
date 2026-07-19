import { AllContent } from '@/components/AllContent'
import { articles } from '@/data/articles'

const getCategories = () => [...new Set(articles.flatMap(article => article.categories || []))].sort((a, b) => a.localeCompare(b, 'tr'))

export default function CategoryPage({ category }) {
  return <AllContent category={category} />
}

export function getStaticPaths() {
  // Existing upstream category pages remain static. New categories created in
  // the admin panel are generated on their first visit without route clashes.
  return { paths: [], fallback: 'blocking' }
}

export function getStaticProps({ params }) {
  const category = getCategories().find(item => item.toLowerCase() === params.category)
  if (!category) return { notFound: true }
  return { props: { category, title: category, description: `${category} kategorisindeki yazılar.` } }
}
