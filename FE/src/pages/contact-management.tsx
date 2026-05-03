import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

/**
 * ContactManagementPage - React component
 * @returns React element
 */
const ContactManagementPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Contact Management | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Contact Management</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Organize collectors, galleries, and collaborators in one place.
        </p>
      </div>
    </>
  )
}

ContactManagementPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ContactManagementPage
