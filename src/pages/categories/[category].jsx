import siteConfig from '@/data/site-config.json'
import { AllContent } from '@/components/AllContent'

export default function CategoryPage({ category }) {
  return <AllContent category={category} />
}

export function getStaticPaths() {
  return { paths: siteConfig.categories.map(category => ({ params: { category: category.toLowerCase() } })), fallback: false }
}

export function getStaticProps({ params }) {
  const category = siteConfig.categories.find(item => item.toLowerCase() === params.category)
  if (!category) return { notFound: true }
  return { props: { category, title: category, description: `${category} kategorisindeki yazılar.` } }
}
