// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// stripe
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// @shared - SEO
import { Metadata } from '@/components/SEO/Metadata'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// Load stripe once at module level (outside component to avoid re-creating)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// @domains - checkout (dynamic import, SSR disabled — Elements requires browser)
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
        <Elements stripe={stripePromise}>
            <Metadata title="Checkout | Artium" />
            <BuyerCheckoutPageView artworkId={artworkIdStr} />
        </Elements>
    )
}

// No layout wrapper - full screen page
CheckoutArtworkRoute.getLayout = (page) => page

export default CheckoutArtworkRoute
