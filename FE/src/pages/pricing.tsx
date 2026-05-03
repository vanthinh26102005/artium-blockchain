import { Metadata } from '@/components/SEO/Metadata'
import { MarketingLayout } from '@shared/components/layout/MarketingLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { PricingMain } from '@domains/pricing/components/PricingMain'
import { PricingFooter } from '@domains/pricing/components/PricingFooter'

/**
 * PricingPage - React component
 * @returns React element
 */
const PricingPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Pricing | Artium" />
      <PricingMain />
    </>
  )
}

PricingPage.getLayout = (page) => (
  <MarketingLayout preFooter={<PricingFooter />}>{page}</MarketingLayout>
)

export default PricingPage
