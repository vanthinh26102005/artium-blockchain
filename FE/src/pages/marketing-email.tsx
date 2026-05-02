import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

const MarketingEmailPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Marketing Email | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Marketing Email</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Draft campaigns and send updates to your community.
        </p>
      </div>
    </>
  )
}

MarketingEmailPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default MarketingEmailPage
