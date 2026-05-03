// third-party
import { Camera, Search, SlidersHorizontal } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

// @domains - discover
import { type DiscoverTabKey } from '@domains/discover/constants/discoverTabs'
import {
  DISCOVER_TOOLBAR_CONFIG,
  IMAGE_SEARCH_PLACEHOLDER,
} from '@domains/discover/constants/discoverToolbarConfig'
import { SearchDropdown } from '@domains/discover/components/search/SearchDropdown'
import { useSearchHistory } from '@domains/discover/state/useSearchHistory'

type DiscoverToolbarProps = {
  activeTabKey: DiscoverTabKey
  searchQuery: string
  onSearchChange: (value: string) => void
  isImageSearch: boolean
  onToggleImageSearch: () => void
  openFilters: boolean
  onToggleFilters: () => void
}

/**
 * DiscoverToolbar - React component
 * @returns React element
 */
export const DiscoverToolbar = ({
  activeTabKey,
  searchQuery,
  onSearchChange,
  isImageSearch,
  onToggleImageSearch,
  openFilters,
  onToggleFilters,
}: DiscoverToolbarProps) => {
  // -- state --
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const {
    recentSearches,
    /**
     * searchContainerRef - Utility function
     * @returns void
     */
    recentlyViewed,
    addRecentSearch,
    removeRecentSearch,
    removeRecentlyViewed,
  } = useSearchHistory()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false)
        /**
         * handleClickOutside - Utility function
         * @returns void
         */
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // -- derived --
  const config = DISCOVER_TOOLBAR_CONFIG[activeTabKey]
  const isArtworksTab = activeTabKey === 'artworks'
  const isImageSearchActive = isArtworksTab && isImageSearch
  const shouldShowSearch = !config.hideSearch
  const shouldShowFilters = Boolean(config.filtersEnabled) && !isImageSearchActive
  const showCamera = isArtworksTab
  const placeholder = isImageSearchActive ? IMAGE_SEARCH_PLACEHOLDER : config.placeholder

  // -- handlers --
  /**
   * config - Utility function
   * @returns void
   */
  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  /**
   * isArtworksTab - Utility function
   * @returns void
   */
  const handleSuggestionClick = (text: string) => {
    onSearchChange(text)
    addRecentSearch(text)
    setIsSearchFocused(false)
    /**
     * isImageSearchActive - Utility function
     * @returns void
     */
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /**
     * shouldShowSearch - Utility function
     * @returns void
     */
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery)
      setIsSearchFocused(false)
    }
    /**
     * shouldShowFilters - Utility function
     * @returns void
     */
  }

  // -- render --
  if (!shouldShowSearch && !shouldShowFilters) {
    /**
     * showCamera - Utility function
     * @returns void
     */
    return null
  }

  return (
    /**
     * placeholder - Utility function
     * @returns void
     */
    <div className="sticky top-20 z-20 w-full bg-white xl:w-auto">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-3 lg:justify-end">
        {shouldShowSearch ? (
          <div
            ref={searchContainerRef}
            className="md:w-105 lg:w-115 xl:w-125 relative w-full sm:w-80"
            /**
             * handleSearchFocus - Utility function
             * @returns void
             */
          >
            <form onSubmit={handleSearchSubmit}>
              <label className="h-10.75 flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200">
                {/* search */}
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  /**
                   * handleSuggestionClick - Utility function
                   * @returns void
                   */
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  onFocus={handleSearchFocus}
                  placeholder={placeholder}
                  aria-label="Search"
                  inputMode="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  /**
                   * handleSearchSubmit - Utility function
                   * @returns void
                   */
                  className="h-full flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {showCamera ? (
                  <button
                    type="button"
                    aria-label="Search by image"
                    aria-pressed={isImageSearch}
                    onClick={onToggleImageSearch}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      isImageSearch
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-black text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {/* image search */}
                    <Camera className="h-4 w-4" />
                  </button>
                ) : null}
              </label>
            </form>

            <SearchDropdown
              isOpen={isSearchFocused}
              searchQuery={searchQuery}
              suggestions={[
                { id: '1', text: 'Dreamy artworks', type: 'suggestion' },
                { id: '2', text: 'dreamy pastel paintings', type: 'suggestion' },
              ]}
              recentSearches={recentSearches}
              recentlyViewed={recentlyViewed}
              onSuggestionClick={handleSuggestionClick}
              onRemoveRecentSearch={removeRecentSearch}
              onRemoveRecentlyViewed={removeRecentlyViewed}
              onClose={() => setIsSearchFocused(false)}
            />
          </div>
        ) : null}
        {shouldShowFilters ? (
          <div className="relative flex justify-end sm:justify-start">
            {/* filters */}
            <button
              type="button"
              onClick={onToggleFilters}
              className="h-10.75 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            {openFilters ? (
              <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-lg">
                {/* filters panel */}
                Filters (coming soon)
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
