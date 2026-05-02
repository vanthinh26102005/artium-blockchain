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

// Load Stripe once at module level. In production this key is baked into the Next.js build.
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

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

  if (!stripePromise) {
    return (
      <>
        <Metadata title="Checkout | Artium" />
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">
              Stripe checkout is not configured
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              The production build is missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Rebuild and
              redeploy the frontend with the Stripe publishable key.
            </p>
          </div>
        </div>
      </>
    )
  }

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
