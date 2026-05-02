import { useMemo } from 'react'

// @domains - editorial
import { EDITORIAL_ITEMS } from '@domains/editorial/data/editorials'
import type { EditorialItem } from '@domains/editorial/types'

type UseGetEditorialsReturn = {
  featured: EditorialItem
  heroItems: EditorialItem[]
  latestItems: EditorialItem[]
  popularItems: EditorialItem[]
  visibleAllItems: EditorialItem[]
}

export const useGetEditorials = (): UseGetEditorialsReturn => {
  // -- derived data --
  const featured = useMemo(
    () => EDITORIAL_ITEMS.find((item) => item.featured) ?? EDITORIAL_ITEMS[0],
    [],
  )

  const heroItems = useMemo(() => {
    const rest = EDITORIAL_ITEMS.filter((item) => item.id !== featured.id)
    return [featured, ...rest].slice(0, 5)
  }, [featured])

  const latestItems = useMemo(() => {
    return [...EDITORIAL_ITEMS]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)
  }, [])

  const popularItems = useMemo(() => {
    return EDITORIAL_ITEMS.filter((item) => item.id !== featured.id).slice(0, 8)
  }, [featured.id])

  const allItems = useMemo(() => {
    return EDITORIAL_ITEMS.filter((item) => item.id !== featured.id)
  }, [featured.id])

  const visibleAllItems = useMemo(() => allItems.slice(0, 20), [allItems])

  return {
    featured,
    heroItems,
    latestItems,
    popularItems,
    visibleAllItems,
  }
}
