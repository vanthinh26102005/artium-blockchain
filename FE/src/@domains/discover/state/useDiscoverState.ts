// react
import { useState } from 'react'

/**
 * useDiscoverState - Custom React hook
 * @returns void
 */
export const useDiscoverState = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isImageSearch, setIsImageSearch] = useState(false)
  const [openFilters, setOpenFilters] = useState(false)

  return {
    searchQuery,
    setSearchQuery,
    isImageSearch,
    setIsImageSearch,
    openFilters,
    setOpenFilters,
  }
}
