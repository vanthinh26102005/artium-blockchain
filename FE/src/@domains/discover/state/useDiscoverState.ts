// react
import { useState } from 'react'

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
