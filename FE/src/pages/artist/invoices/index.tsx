// next
import dynamic from 'next/dynamic'

// @shared - layout
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import { Metadata } from '@/components/SEO/Metadata'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

// @domains - quick-sell (dynamic import)
/**
 * QuickSellInvoicesListView - React component
 * @returns React element
 */
const QuickSellInvoicesListView = dynamic(
    () =>
        import('@domains/quick-sell/views/QuickSellInvoicesListView').then(
            (module) => module.QuickSellInvoicesListView,
        ),
    { ssr: false },
)

const InvoicesIndexPage: NextPageWithLayout = () => {
    // -- auth --
    const { canRenderProtected } = useRequireAuth()
/**
 * InvoicesIndexPage - React component
 * @returns React element
 */

    // -- render --
    if (!canRenderProtected) {
        return null
    }

    return (
        <>
            <Metadata title="Invoices | Artium" description="Manage your art sales invoices." />
            <QuickSellInvoicesListView />
        </>
    )
}

InvoicesIndexPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default InvoicesIndexPage
