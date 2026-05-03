import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'
import { DashboardView } from '@domains/home/components/DashboardView'

/**
 * HomePage - React component
 * @returns React element
 */
const HomePage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Home | Artium" />
      <DashboardView />
    </>
  )
}

HomePage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default HomePage
