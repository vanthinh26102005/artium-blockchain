import dynamic from 'next/dynamic'

import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

const SellerRegistrationPage = dynamic(
  () =>
    import('@domains/seller/views/SellerRegistrationPage').then(
      (module) => module.SellerRegistrationPage,
    ),
  { ssr: false },
)

const SellerRegisterRoute: NextPageWithLayout = () => {
  const { canRenderProtected } = useRequireAuth()

  if (!canRenderProtected) {
    return null
  }

  return <SellerRegistrationPage />
}

SellerRegisterRoute.getLayout = (page) => <SidebarLayout hideFooter>{page}</SidebarLayout>

export default SellerRegisterRoute
