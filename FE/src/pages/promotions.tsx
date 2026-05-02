import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

const PromotionsPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Promotions | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Promotions</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Plan launches, discounts, and featured collection moments.
        </p>
      </div>
    </>
  )
}

PromotionsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default PromotionsPage
