// next
import { Metadata } from '@/components/SEO/Metadata'

// @domains - editorial
import { EditorialAllList } from '@domains/editorial/components/EditorialAllList'
import { EditorialDiscoverBanner } from '@domains/editorial/components/EditorialDiscoverBanner'
import { EditorialHero } from '@domains/editorial/components/EditorialHero'
import { EditorialLatestRail } from '@domains/editorial/components/EditorialLatestRail'
import { useGetEditorials } from '@domains/editorial/hooks/useGetEditorials'

/**
 * Editorial landing page view.
 *
 * Responsibilities:
 * - Render the main editorial layout.
 * - Consume data from useGetEditorials hook.
 */
export const EditorialPage = () => {
  // -- data --
  const { heroItems, latestItems, popularItems, visibleAllItems } = useGetEditorials()

  // -- render --
  return (
    <>
      <Metadata
        title="Editorial | Artium"
        description="Artium editorials on market moves, galleries, and studio visits."
      />

      <div className="pb-12 lg:pb-16">
        <div className="relative right-1/2 left-1/2 -mt-20 w-screen -translate-x-1/2">
          <EditorialHero items={heroItems} />
        </div>

        <div className="mt-10 space-y-10">
          <EditorialLatestRail items={latestItems} title="Latest" />
          <EditorialLatestRail items={popularItems} title="Popular" />
          <EditorialAllList items={visibleAllItems} title="All Articles" />

          {/* discover banner */}
          <EditorialDiscoverBanner />
        </div>
      </div>
    </>
  )
}
