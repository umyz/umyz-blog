import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import siteConfig from '@/data/site-config.json'
import * as mdxComponents from '@/components/mdx'

export default function CustomPage({ source }) {
  return <MDXRemote {...source} components={mdxComponents} />
}

export function getStaticPaths() {
  return { paths: siteConfig.pages.filter(page => page.slug).map(page => ({ params: { slug: page.slug } })), fallback: false }
}

export async function getStaticProps({ params }) {
  const page = siteConfig.pages.find(item => item.slug === params.slug)
  if (!page) return { notFound: true }
  return { props: { title: page.title, description: page.description, source: await serialize(page.body || '') } }
}
