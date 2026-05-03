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
/**
 * QuickSellCreateInvoicePageView - React component
 * @returns React element
 */
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
  /**
   * EditInvoiceRoute - React component
   * @returns React element
   */

  // -- router --
  const router = useRouter()
  const { id } = router.query
  const invoiceCode = typeof id === 'string' ? id : undefined

  // -- render --
  if (!canRenderProtected) return null
  /**
   * router - Utility function
   * @returns void
   */
  if (!invoiceCode) return null

  return (
    <>
      <Metadata title="Edit Invoice | Artium" />
      /** * invoiceCode - Utility function * @returns void */
      <QuickSellCreateInvoicePageView invoiceCode={invoiceCode} />
    </>
  )
}

// No layout wrapper - full screen page
EditInvoiceRoute.getLayout = (page) => page

export default EditInvoiceRoute
