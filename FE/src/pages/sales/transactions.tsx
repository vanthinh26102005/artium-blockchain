import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

const SalesTransactionsPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Transactions | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Transactions</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Review individual transactions and settlement status.
        </p>
      </div>
    </>
  )
}

SalesTransactionsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default SalesTransactionsPage
