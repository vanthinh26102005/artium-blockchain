// next
import dynamic from 'next/dynamic'

// @shared - layout
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

// @domains - inventory
/**
 * InventoryFolderPage - React component
 * @returns React element
 */
const InventoryFolderPage = dynamic(
  () =>
    import('@domains/inventory/views/InventoryFolderPage').then(
      (module) => module.InventoryFolderPage,
    ),
  { ssr: false },
)

const InventoryFolderRoute: NextPageWithLayout = () => {
  // -- state --
  const { canRenderProtected } = useRequireAuth()
/**
 * InventoryFolderRoute - React component
 * @returns React element
 */

  // -- derived --

  // -- handlers --

  // -- render --
  if (!canRenderProtected) {
    return null
  }

  return <InventoryFolderPage />
}

InventoryFolderRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default InventoryFolderRoute
