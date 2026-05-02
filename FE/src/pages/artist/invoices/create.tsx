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

const CreateInvoiceRoute: NextPageWithLayout = () => {
    // -- auth --
    const { canRenderProtected } = useRequireAuth()

    // -- router --
    const router = useRouter()

    // -- derived --
    const artworkId = router.query.artworkId as string | undefined

    // -- handlers --

    // -- render --
    if (!canRenderProtected) {
        return null
    }

    return (
        <>
            <Metadata title="Create Invoice | Artium" />
            <QuickSellCreateInvoicePageView artworkId={artworkId} />
        </>
    )
}

// No layout wrapper - full screen page
CreateInvoiceRoute.getLayout = (page) => page

export default CreateInvoiceRoute
