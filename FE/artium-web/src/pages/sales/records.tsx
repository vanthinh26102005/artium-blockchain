import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

const SalesRecordsPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Sales Records | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Sales Records</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Track sales history, payouts, and performance over time.
        </p>
      </div>
    </>
  )
}

SalesRecordsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default SalesRecordsPage
