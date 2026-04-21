// next
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// @shared - SEO
import { Metadata } from '@/components/SEO/Metadata'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

// @domains - quick-sell (dynamic import)
const QuickSellCreateInvoicePageView = dynamic(
    () =>
        import('@domains/quick-sell/views/QuickSellCreateInvoicePageView').then(
            (module) => module.QuickSellCreateInvoicePageView,
        ),
    { ssr: false },
)

const EditInvoiceRoute: NextPageWithLayout = () => {
    // -- auth --
    const { canRenderProtected } = useRequireAuth()

    // -- router --
    const router = useRouter()
    const { id } = router.query
    const invoiceCode = typeof id === 'string' ? id : undefined

    // -- render --
    if (!canRenderProtected) return null
    if (!invoiceCode) return null

    return (
        <>
            <Metadata title="Edit Invoice | Artium" />
            <QuickSellCreateInvoicePageView invoiceCode={invoiceCode} />
        </>
    )
}

// No layout wrapper - full screen page
EditInvoiceRoute.getLayout = (page) => page

export default EditInvoiceRoute
