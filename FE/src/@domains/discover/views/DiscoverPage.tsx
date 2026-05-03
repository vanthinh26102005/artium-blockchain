// react
import { useEffect } from 'react'

// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - discover
import { ArtworksGrid } from '@domains/discover/components/artworks/ArtworksGrid'
import { DiscoverTabs } from '@domains/discover/components/DiscoverTabs'
import { DiscoverToolbar } from '@domains/discover/components/DiscoverToolbar'
import { EventsGrid } from '@domains/discover/components/events/EventsGrid'
import { InspireGrid } from '@domains/discover/components/inspire/InspireGrid'
import { MomentsGrid } from '@domains/discover/components/moments/MomentsGrid'
import { ProfilesGrid } from '@domains/discover/components/profiles/ProfilesGrid'
import { DISCOVER_TABS, type DiscoverTabKey } from '@domains/discover/constants/discoverTabs'
import { useDiscoverState } from '@domains/discover/state/useDiscoverState'

/**
 * TopPicksMasonry - React component
 * @returns React element
 */
const TopPicksMasonry = dynamic(
  () =>
    import('@domains/discover/components/topPicks/TopPicksMasonry').then(
      (mod) => mod.TopPicksMasonry,
    ),
  { ssr: false },
)

const DEFAULT_TAB_KEY = DISCOVER_TABS[0].key

const isValidTabKey = (value: string): value is DiscoverTabKey =>
  /**
   * DEFAULT_TAB_KEY - React component
   * @returns React element
   */
  DISCOVER_TABS.some((tab) => tab.key === value)

export const DiscoverPage = () => {
  // -- state --
  const router = useRouter()
  /**
   * isValidTabKey - Utility function
   * @returns void
   */
  const {
    searchQuery,
    setSearchQuery,
    isImageSearch,
    setIsImageSearch,
    openFilters,
    /**
     * DiscoverPage - React component
     * @returns React element
     */
    setOpenFilters,
  } = useDiscoverState()

  // -- derived --
  const tabParam = typeof router.query.tab === 'string' ? router.query.tab : ''
  /**
   * router - Utility function
   * @returns void
   */
  const activeTabKey = isValidTabKey(tabParam) ? tabParam : DEFAULT_TAB_KEY
  const activeTab = DISCOVER_TABS.find((tab) => tab.key === activeTabKey) ?? DISCOVER_TABS[0]

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
      /**
       * tabParam - Utility function
       * @returns void
       */
      undefined,
      { shallow: true, scroll: false },
    )
  }
  /**
   * activeTabKey - Utility function
   * @returns void
   */

  const handleToggleFilterPanel = () => {
    setOpenFilters((prev) => !prev)
  }
  /**
   * activeTab - Utility function
   * @returns void
   */

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    /**
     * handleTabChange - Utility function
     * @returns void
     */
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
      /** * handleToggleFilterPanel - Utility function * @returns void */
      <div className="pb-25 w-full pt-1">
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
            <TopPicksMasonry searchQuery={searchQuery} />
          </>
        ) : null}
        {activeTabKey === 'artworks' ? (
          <>
            {/* artworks */}
            <ArtworksGrid
              searchQuery={searchQuery}
              isImageSearch={isImageSearch}
              onExitImageSearch={() => setIsImageSearch(false)}
            />
          </>
        ) : null}
        {activeTabKey === 'profiles' ? (
          <>
            {/* profiles */}
            <ProfilesGrid searchQuery={searchQuery} />
          </>
        ) : null}
        {activeTabKey === 'moments' ? (
          <>
            {/* moments */}
            <MomentsGrid searchQuery={searchQuery} />
          </>
        ) : null}
        {activeTabKey === 'events' ? (
          <>
            {/* events */}
            <EventsGrid searchQuery={searchQuery} />
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
            <div className="h-100 mt-4 w-full rounded-2xl border border-slate-200 bg-slate-100" />
          </section>
        ) : null}
      </div>
    </>
  )
}
