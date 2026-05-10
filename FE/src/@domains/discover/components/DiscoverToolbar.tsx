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
  const filterPanelId = `discover-${activeTabKey}-filters-coming-soon`

  // -- handlers --
  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSuggestionClick = (text: string) => {
    onSearchChange(text)
    addRecentSearch(text)
    setIsSearchFocused(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery)
      setIsSearchFocused(false)
    }
  }

  // -- render --
  if (!shouldShowSearch && !shouldShowFilters) {
    return null
  }

  return (
    <div className="sticky top-20 z-20 w-full flex-none bg-white xl:w-auto">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-3 lg:justify-end">
        {shouldShowSearch ? (
          <div
            ref={searchContainerRef}
            className="relative w-full sm:w-80 md:w-[360px] lg:w-96 xl:w-[420px] 2xl:w-[460px]"
          >
            <form onSubmit={handleSearchSubmit}>
              <label className="flex h-10.75 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200">
                {/* search */}
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  onFocus={handleSearchFocus}
                  placeholder={placeholder}
                  aria-label="Search"
                  inputMode="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-full flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {showCamera ? (
                  <button
                    type="button"
                    aria-label="Search by image"
                    aria-pressed={isImageSearch}
                    onClick={onToggleImageSearch}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${isImageSearch
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
          <div className="relative flex w-full justify-start sm:w-auto">
            {/* filters */}
            <button
              type="button"
              onClick={onToggleFilters}
              aria-expanded={openFilters}
              aria-controls={filterPanelId}
              className="inline-flex h-10.75 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            {openFilters ? (
              <div
                id={filterPanelId}
                role="dialog"
                aria-label="Filters availability"
                className="absolute top-full left-0 z-30 mt-3 w-[calc(100vw-2rem)] max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-600 shadow-xl shadow-slate-900/10 sm:right-0 sm:left-auto sm:w-[280px]"
              >
                <div className="h-1 w-full bg-slate-950" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Filters are coming soon
                      </p>
                      <p className="mt-2 leading-5 text-slate-600">
                        We&apos;re building smarter ways to refine results by category,
                        price, artist, location, and date.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                      In progress
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                    Search is available now.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
