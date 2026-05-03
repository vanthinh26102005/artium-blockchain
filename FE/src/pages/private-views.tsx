import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

/**
 * PrivateViewsPage - React component
 * @returns React element
 */
const PrivateViewsPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Private Views | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Private Views</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Share exclusive previews with your top collectors.
        </p>
      </div>
    </>
  )
}

PrivateViewsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default PrivateViewsPage
