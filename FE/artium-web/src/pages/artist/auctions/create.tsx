import dynamic from 'next/dynamic'
import { Metadata } from '@/components/SEO/Metadata'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

const SellerAuctionArtworkPickerPage = dynamic(
  () =>
    import('@domains/auction/views/SellerAuctionArtworkPickerPage').then(
      (module) => module.SellerAuctionArtworkPickerPage,
    ),
  { ssr: false },
)

const CreateSellerAuctionRoute: NextPageWithLayout = () => {
  const { canRenderProtected } = useRequireAuth()

  if (!canRenderProtected) {
    return null
  }

  return (
    <>
      <Metadata title="Choose Artwork for Auction | Artium" />
      <SellerAuctionArtworkPickerPage />
    </>
  )
}

CreateSellerAuctionRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default CreateSellerAuctionRoute
