export type EditorialItem = {
  id: string
  title: string
  category: string
  excerpt: string
  imageUrl: string
  author: string
  readTime: string
  publishedAt: string
  tags: string[]
  featured?: boolean
}

export type EditorialSectionProps = {
  items: EditorialItem[]
  title?: string
  className?: string
}
