// next
import dynamic from 'next/dynamic'

// @shared - layout
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

// @domains - inventory
const InventoryPage = dynamic(
  () => import('@domains/inventory/views/InventoryPage').then((module) => module.InventoryPage),
  { ssr: false },
)

const InventoryRoute: NextPageWithLayout = () => {
  // -- state --
  useRequireAuth()

  // -- derived --

  // -- handlers --

  // -- render --
  return <InventoryPage />
}

InventoryRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default InventoryRoute
