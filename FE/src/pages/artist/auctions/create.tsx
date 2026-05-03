import dynamic from 'next/dynamic'
import { Metadata } from '@/components/SEO/Metadata'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * SellerAuctionArtworkPickerPage - React component
 * @returns React element
 */
const SellerAuctionArtworkPickerPage = dynamic(
  () =>
    import('@domains/auction/views/SellerAuctionArtworkPickerPage').then(
      (module) => module.SellerAuctionArtworkPickerPage,
    ),
  { ssr: false },
)

const CreateSellerAuctionRoute: NextPageWithLayout = () => {
  const { canRenderProtected } = useRequireAuth()

/**
 * CreateSellerAuctionRoute - React component
 * @returns React element
 */
  if (!canRenderProtected) {
    return null
  }

  return (
    <>
      <Metadata title="Create Seller Auction | Artium" />
      <SellerAuctionArtworkPickerPage />
    </>
  )
}

CreateSellerAuctionRoute.getLayout = (page) => <SidebarLayout hideFooter>{page}</SidebarLayout>

export default CreateSellerAuctionRoute
