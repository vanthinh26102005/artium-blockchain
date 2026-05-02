import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'
import { ManagePlanView } from '@domains/manage-plan/components/ManagePlanView'

const ManagePlanPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Manage Plan | Artium" />
      <ManagePlanView />
    </>
  )
}

ManagePlanPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ManagePlanPage
