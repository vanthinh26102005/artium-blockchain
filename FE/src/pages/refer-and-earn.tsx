import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { Metadata } from '@/components/SEO/Metadata'

/**
 * ReferAndEarnPage - React component
 * @returns React element
 */
const ReferAndEarnPage: NextPageWithLayout = () => {
  return (
    <>
      <Metadata title="Refer & Earn | Artium" />
      <div className="py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Refer & Earn</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Invite collectors and earn rewards for successful referrals.
        </p>
      </div>
    </>
  )
}

ReferAndEarnPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ReferAndEarnPage
