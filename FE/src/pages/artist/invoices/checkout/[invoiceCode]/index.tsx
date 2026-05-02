// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// @shared - SEO
import { Metadata } from '@/components/SEO/Metadata'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - quick-sell (dynamic import)
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

    // -- derived --
    const invoiceCode = router.query.invoiceCode as string
    const isBuyerMode = router.query.buyer === 'true'
    const isPending = router.query.pending === 'true'
    const quickSellInvoiceJustCreated = router.query.quickSellInvoiceJustCreated === 'true'

    // -- render --
    if (!invoiceCode) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-600">Loading invoice...</p>
            </div>
        )
    }

    return (
        <>
            <Metadata title={`Invoice ${invoiceCode} | Artium`} />
            <QuickSellCheckoutPageView
                invoiceCode={invoiceCode}
                isBuyerMode={isBuyerMode}
                isPending={isPending}
                quickSellInvoiceJustCreated={quickSellInvoiceJustCreated}
            />
        </>
    )
}

// No layout wrapper - full screen page
CheckoutInvoiceRoute.getLayout = (page) => page

export default CheckoutInvoiceRoute

