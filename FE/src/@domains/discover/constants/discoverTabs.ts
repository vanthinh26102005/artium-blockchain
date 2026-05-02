export const DISCOVER_TABS = [
  { key: 'top-picks', label: 'TOP PICKS' },
  { key: 'artworks', label: 'ARTWORKS' },
  { key: 'profiles', label: 'PROFILES' },
  { key: 'moments', label: 'MOMENTS' },
  { key: 'events', label: 'EVENTS' },
  { key: 'get-inspired', label: 'GET INSPIRED' },
] as const

export type DiscoverTab = (typeof DISCOVER_TABS)[number]
export type DiscoverTabKey = DiscoverTab['key']
