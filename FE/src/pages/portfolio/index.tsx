import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'
import { PortfolioLayout } from '@domains/portfolio'

/**
 * PortfolioPage - React component
 * @returns React element
 */
const PortfolioPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Portfolio | Artium" />
      <PortfolioLayout />
    </>
  )
}

PortfolioPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default PortfolioPage
