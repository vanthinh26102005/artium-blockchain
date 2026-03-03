// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// @shared - SEO
import { Metadata } from '@/components/SEO/Metadata'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - checkout (dynamic import)
const BuyerCheckoutPageView = dynamic(
    () =>
        import('@domains/checkout/views/BuyerCheckoutPageView').then(
            (module) => module.BuyerCheckoutPageView,
        ),
    { ssr: false },
)

const CheckoutArtworkRoute: NextPageWithLayout = () => {
    // -- router --
    const router = useRouter()
    const { artworkId } = router.query
    const artworkIdStr = typeof artworkId === 'string' ? artworkId : undefined

    // -- render --
    if (!artworkIdStr) return null

    return (
        <>
            <Metadata title="Checkout | Artium" />
            <BuyerCheckoutPageView artworkId={artworkIdStr} />
        </>
    )
}

// No layout wrapper - full screen page
CheckoutArtworkRoute.getLayout = (page) => page

export default CheckoutArtworkRoute
