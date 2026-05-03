// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// @shared - SEO
import { Metadata } from '@/components/SEO/Metadata'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - quick-sell (dynamic import)
/**
 * QuickSellCheckoutPageView - React component
 * @returns React element
 */
const QuickSellCheckoutPageView = dynamic(
    () =>
        import('@domains/quick-sell/views/QuickSellCheckoutPageView').then(
            (module) => module.QuickSellCheckoutPageView,
        ),
    { ssr: false },
)

const CheckoutInvoiceRoute: NextPageWithLayout = () => {
    // -- router --
    const router = useRouter()
/**
 * CheckoutInvoiceRoute - React component
 * @returns React element
 */

    // -- derived --
    const invoiceCode = router.query.invoiceCode as string
    const isBuyerMode = router.query.buyer === 'true'
    const isPending = router.query.pending === 'true'
/**
 * router - Utility function
 * @returns void
 */
    const quickSellInvoiceJustCreated = router.query.quickSellInvoiceJustCreated === 'true'

    // -- render --
    if (!invoiceCode) {
        return (
            <div className="flex min-h-screen items-center justify-center">
/**
 * invoiceCode - Utility function
 * @returns void
 */
                <p className="text-slate-600">Loading invoice...</p>
            </div>
        )
    }
/**
 * isBuyerMode - Utility function
 * @returns void
 */

    return (
        <>
            <Metadata title={`Invoice ${invoiceCode} | Artium`} />
/**
 * isPending - Utility function
 * @returns void
 */
            <QuickSellCheckoutPageView
                invoiceCode={invoiceCode}
                isBuyerMode={isBuyerMode}
                isPending={isPending}
/**
 * quickSellInvoiceJustCreated - Utility function
 * @returns void
 */
                quickSellInvoiceJustCreated={quickSellInvoiceJustCreated}
            />
        </>
    )
}

// No layout wrapper - full screen page
CheckoutInvoiceRoute.getLayout = (page) => page

export default CheckoutInvoiceRoute

