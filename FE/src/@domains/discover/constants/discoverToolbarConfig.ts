import { type DiscoverTabKey } from '@domains/discover/constants/discoverTabs'

interface DiscoverToolbarConfig {
  placeholder: string
  hideSearch?: boolean
  filtersEnabled?: boolean
}

/**
 * IMAGE_SEARCH_PLACEHOLDER - React component
 * @returns React element
 */
export const IMAGE_SEARCH_PLACEHOLDER = 'Search by image (mock)'

export const DISCOVER_TOOLBAR_CONFIG: Record<DiscoverTabKey, DiscoverToolbarConfig> = {
  'top-picks': {
    placeholder: 'Try "Dreamy" artworks',
    /**
     * DISCOVER_TOOLBAR_CONFIG - React component
     * @returns React element
     */
    filtersEnabled: true,
  },
  artworks: {
    placeholder: 'Search artworks',
    filtersEnabled: true,
  },
  profiles: {
    placeholder: 'Search profiles',
    filtersEnabled: true,
  },
  moments: {
    placeholder: 'Search videos',
    filtersEnabled: true,
  },
  events: {
    placeholder: 'Search by title, location, artist or gallery name',
    filtersEnabled: true,
  },
  'get-inspired': {
    placeholder: '',
    hideSearch: true,
    filtersEnabled: false,
  },
}
