// third-party
import { X, Sparkles, Search } from 'lucide-react'

type SearchSuggestion = {
  id: string
  text: string
  type: 'suggestion' | 'recent'
}

type RecentlyViewedItem = {
  id: string
  imageUrl: string
  title: string
  artist?: string
}

type SearchDropdownProps = {
  isOpen: boolean
  searchQuery: string
  suggestions?: SearchSuggestion[]
  recentSearches: string[]
  recentlyViewed: RecentlyViewedItem[]
  onSuggestionClick: (text: string) => void
  onRemoveRecentSearch: (search: string) => void
  onRemoveRecentlyViewed: (id: string) => void
  onClose: () => void
}

/**
 * SearchDropdown - React component
 * @returns React element
 */
export const SearchDropdown = ({
  isOpen,
  searchQuery,
  suggestions = [],
  recentSearches,
  recentlyViewed,
  onSuggestionClick,
  onRemoveRecentSearch,
  onRemoveRecentlyViewed,
  onClose,
}: SearchDropdownProps) => {
  if (!isOpen) return null

  const hasContent =
    recentSearches.length > 0 || recentlyViewed.length > 0 || suggestions.length > 0

  /**
   * hasContent - Utility function
   * @returns void
   */
  // Mock images for suggestions
  const suggestionImages = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1582561833197-7d54b3c2e9e5?w=200&h=200&fit=crop',
  ]
  /**
   * suggestionImages - Utility function
   * @returns void
   */

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-3xl border border-slate-200 bg-white shadow-2xl duration-200 animate-in fade-in-0 slide-in-from-top-2">
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Search Suggestions with Overlapping Images */}
          {suggestions.length > 0 && (
            <div className="mb-6 space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  {/* Icon */}
                  {index === 0 ? (
                    <Sparkles className="h-5 w-5 shrink-0 text-slate-400" />
                  ) : (
                    <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  )}

                  {/* Text */}
                  <span className="flex-1 text-sm text-slate-700">
                    Try <span className="font-medium text-slate-900">"{suggestion.text}"</span>
                  </span>

                  {/* Overlapping Images */}
                  {index === 1 && (
                    <div className="flex -space-x-3">
                      {suggestionImages.map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105"
                          style={{
                            zIndex: suggestionImages.length - imgIndex,
                          }}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => onSuggestionClick(search)}
                    className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    <span>{search}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveRecentSearch(search)
                      }}
                      className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-slate-300"
                      aria-label="Remove search"
                    >
                      <X className="h-3 w-3 text-slate-600" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recently Viewed
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {recentlyViewed.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={() => onRemoveRecentlyViewed(item.id)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white group-hover:opacity-100"
                      aria-label="Remove from recently viewed"
                    >
                      <X className="h-3.5 w-3.5 text-slate-700" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action Banner */}
          {hasContent && (
            <div className="bg-linear-to-r mt-6 rounded-2xl from-green-100 to-emerald-100 p-6 text-center">
              <p className="text-sm text-slate-800">
                Ready to fill your blank wall? Take our{' '}
                <a href="/quiz" className="font-semibold text-blue-600 hover:underline">
                  Find Art Quiz
                </a>
                .
              </p>
            </div>
          )}

          {/* Empty State */}
          {!hasContent && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">Start searching to see suggestions</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
