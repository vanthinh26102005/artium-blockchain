// react
import { useEffect } from 'react'

// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - discover
import { DiscoverTabs } from '@domains/discover/components/DiscoverTabs'
import { DiscoverToolbar } from '@domains/discover/components/DiscoverToolbar'
import { DISCOVER_TABS, type DiscoverTabKey } from '@domains/discover/constants/discoverTabs'
import { useDiscoverState } from '@domains/discover/state/useDiscoverState'

// @shared
import { useDebounce } from '@shared/hooks/useDebounce'

const DiscoverTabLoading = () => (
  <section
    className="mt-6 min-h-[560px] rounded-2xl bg-slate-50"
    aria-label="Loading discover tab"
  />
)

const TopPicksMasonry = dynamic(
  () =>
    import('@domains/discover/components/topPicks/TopPicksMasonry').then(
      (mod) => mod.TopPicksMasonry,
    ),
  { ssr: false, loading: DiscoverTabLoading },
)
const ArtworksGrid = dynamic(
  () =>
    import('@domains/discover/components/artworks/ArtworksGrid').then((mod) => mod.ArtworksGrid),
  { ssr: false, loading: DiscoverTabLoading },
)
const ProfilesGrid = dynamic(
  () =>
    import('@domains/discover/components/profiles/ProfilesGrid').then((mod) => mod.ProfilesGrid),
  { ssr: false, loading: DiscoverTabLoading },
)
const MomentsGrid = dynamic(
  () =>
    import('@domains/discover/components/moments/MomentsGrid').then((mod) => mod.MomentsGrid),
  { ssr: false, loading: DiscoverTabLoading },
)
const EventsGrid = dynamic(
  () => import('@domains/discover/components/events/EventsGrid').then((mod) => mod.EventsGrid),
  { ssr: false, loading: DiscoverTabLoading },
)
const InspireGrid = dynamic(
  () => import('@domains/discover/components/inspire/InspireGrid').then((mod) => mod.InspireGrid),
  { ssr: false, loading: DiscoverTabLoading },
)

const DEFAULT_TAB_KEY = DISCOVER_TABS[0].key

const isValidTabKey = (value: string): value is DiscoverTabKey =>
  DISCOVER_TABS.some((tab) => tab.key === value)

export const DiscoverPage = () => {
  // -- state --
  const router = useRouter()
  const {
    searchQuery,
    setSearchQuery,
    isImageSearch,
    setIsImageSearch,
    openFilters,
    setOpenFilters,
  } = useDiscoverState()

  // -- derived --
  const tabParam = typeof router.query.tab === 'string' ? router.query.tab : ''
  const activeTabKey = isValidTabKey(tabParam) ? tabParam : DEFAULT_TAB_KEY
  const activeTab = DISCOVER_TABS.find((tab) => tab.key === activeTabKey) ?? DISCOVER_TABS[0]
  const debouncedSearchQuery = useDebounce(searchQuery, 350)

  // -- handlers --
  const handleTabChange = (nextTab: DiscoverTabKey) => {
    if (nextTab === activeTabKey) {
      return
    }

    void router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: nextTab },
      },
      undefined,
      { shallow: true, scroll: false },
    )
  }

  const handleToggleFilterPanel = () => {
    setOpenFilters((prev) => !prev)
  }

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (isValidTabKey(tabParam)) {
      return
    }

    void router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: DEFAULT_TAB_KEY },
      },
      undefined,
      { shallow: true, scroll: false },
    )
  }, [router.isReady, router.pathname, router.query, tabParam])

  // -- render --
  return (
    <>
      <Metadata title="Discover | Artium" />
      <div className="w-full pt-1 pb-25">
        {/* header */}
        <div className="grid grid-cols-1 gap-4 py-3 xl:grid-cols-[1fr_auto] xl:items-center">
          <DiscoverTabs activeTabKey={activeTabKey} onTabChange={handleTabChange} />
          <DiscoverToolbar
            activeTabKey={activeTabKey}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isImageSearch={isImageSearch}
            onToggleImageSearch={() => setIsImageSearch((prev) => !prev)}
            openFilters={openFilters}
            onToggleFilters={handleToggleFilterPanel}
          />
        </div>

        {/* tab content */}
        {activeTabKey === 'top-picks' ? (
          <>
            {/* top picks */}
            <TopPicksMasonry searchQuery={debouncedSearchQuery} />
          </>
        ) : null}
        {activeTabKey === 'artworks' ? (
          <>
            {/* artworks */}
            <ArtworksGrid
              searchQuery={debouncedSearchQuery}
              isImageSearch={isImageSearch}
              onExitImageSearch={() => setIsImageSearch(false)}
            />
          </>
        ) : null}
        {activeTabKey === 'profiles' ? (
          <>
            {/* profiles */}
            <ProfilesGrid searchQuery={debouncedSearchQuery} />
          </>
        ) : null}
        {activeTabKey === 'moments' ? (
          <>
            {/* moments */}
            <MomentsGrid searchQuery={debouncedSearchQuery} />
          </>
        ) : null}
        {activeTabKey === 'events' ? (
          <>
            {/* events */}
            <EventsGrid searchQuery={debouncedSearchQuery} />
          </>
        ) : null}
        {activeTabKey === 'get-inspired' ? (
          <>
            {/* get inspired */}
            <InspireGrid />
          </>
        ) : null}
        {activeTabKey !== 'top-picks' &&
        activeTabKey !== 'artworks' &&
        activeTabKey !== 'profiles' &&
        activeTabKey !== 'moments' &&
        activeTabKey !== 'events' &&
        activeTabKey !== 'get-inspired' ? (
          <section className="mt-8">
            {/* placeholder */}
            <h2 className="text-xl font-semibold text-slate-900">{activeTab.label}</h2>
            <div className="mt-4 h-100 w-full rounded-2xl border border-slate-200 bg-slate-100" />
          </section>
        ) : null}
      </div>
    </>
  )
}
