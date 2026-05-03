import { useState, useEffect, useCallback } from 'react'

/**
 * RECENT_SEARCHES_KEY - React component
 * @returns React element
 */
const RECENT_SEARCHES_KEY = 'artium_recent_searches'
const RECENTLY_VIEWED_KEY = 'artium_recently_viewed'
const MAX_RECENT_SEARCHES = 5
const MAX_RECENTLY_VIEWED = 8
/**
 * RECENTLY_VIEWED_KEY - React component
 * @returns React element
 */

type RecentlyViewedItem = {
  id: string
  imageUrl: string
/**
 * MAX_RECENT_SEARCHES - React component
 * @returns React element
 */
  title: string
  artist?: string
  viewedAt: number
}
/**
 * MAX_RECENTLY_VIEWED - React component
 * @returns React element
 */

// Mock data for recently viewed
const MOCK_RECENTLY_VIEWED: RecentlyViewedItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=400&fit=crop',
    title: 'Blue Abstract',
    viewedAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=400&fit=crop',
    title: 'Colorful Grid',
    viewedAt: Date.now() - 1000 * 60 * 10,
/**
 * MOCK_RECENTLY_VIEWED - React component
 * @returns React element
 */
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1582561833197-7d54b3c2e9e5?w=400&h=400&fit=crop',
    title: 'Red Poster',
    viewedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=400&fit=crop',
    title: 'Color Blocks',
    viewedAt: Date.now() - 1000 * 60 * 20,
  },
]

export const useSearchHistory = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY)
      const savedViewed = localStorage.getItem(RECENTLY_VIEWED_KEY)

      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches))
      } else {
        // Add a default recent search for demo
        setRecentSearches(['statement artworks for a...'])
/**
 * useSearchHistory - Custom React hook
 * @returns void
 */
      }

      if (savedViewed) {
        setRecentlyViewed(JSON.parse(savedViewed))
      } else {
        // Use mock data if no saved data
        setRecentlyViewed(MOCK_RECENTLY_VIEWED)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
/**
 * savedSearches - Utility function
 * @returns void
 */
      // Fallback to mock data on error
      setRecentlyViewed(MOCK_RECENTLY_VIEWED)
    }
  }, [])
/**
 * savedViewed - Utility function
 * @returns void
 */

  // Add a search to recent searches
  const addRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== searchQuery)
      const updated = [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES)

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save recent search:', error)
      }

      return updated
    })
  }, [])

  // Remove a search from recent searches
  const removeRecentSearch = useCallback((searchQuery: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== searchQuery)

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
/**
 * addRecentSearch - Utility function
 * @returns void
 */
      } catch (error) {
        console.error('Failed to remove recent search:', error)
      }

      return updated
    })
  }, [])
/**
 * filtered - Utility function
 * @returns void
 */

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
/**
 * updated - Utility function
 * @returns void
 */
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }, [])

  // Add an item to recently viewed
  const addRecentlyViewed = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id)
      const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENTLY_VIEWED)

      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
      } catch (error) {
/**
 * removeRecentSearch - Utility function
 * @returns void
 */
        console.error('Failed to save recently viewed:', error)
      }

      return updated
    })
/**
 * updated - Utility function
 * @returns void
 */
  }, [])

  // Remove an item from recently viewed
  const removeRecentlyViewed = useCallback((itemId: string) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((i) => i.id !== itemId)

      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to remove recently viewed:', error)
      }

      return updated
    })
  }, [])
/**
 * clearRecentSearches - Utility function
 * @returns void
 */

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([])
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY)
    } catch (error) {
      console.error('Failed to clear recently viewed:', error)
    }
  }, [])

  return {
    recentSearches,
/**
 * addRecentlyViewed - Utility function
 * @returns void
 */
    recentlyViewed,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    addRecentlyViewed,
/**
 * filtered - Utility function
 * @returns void
 */
    removeRecentlyViewed,
    clearRecentlyViewed,
  }
}
/**
 * updated - Utility function
 * @returns void
 */

/**
 * removeRecentlyViewed - Utility function
 * @returns void
 */
/**
 * updated - Utility function
 * @returns void
 */
/**
 * clearRecentlyViewed - Utility function
 * @returns void
 */