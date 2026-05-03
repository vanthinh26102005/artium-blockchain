import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'
import { CustomWebsiteLayout } from '@domains/custom-website'

/**
 * CustomWebsitePage - React component
 * @returns React element
 */
const CustomWebsitePage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Custom Website | Artium" />
      <CustomWebsiteLayout />
    </>
  )
}

CustomWebsitePage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default CustomWebsitePage
