import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

const ArtistManagementPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Artist Management | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Artist Management</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Coordinate collaborators, contracts, and artist profiles.
        </p>
      </div>
    </>
  )
}

ArtistManagementPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ArtistManagementPage
