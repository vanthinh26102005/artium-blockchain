// next
import dynamic from 'next/dynamic'

// @shared - types
import { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

// @domains - inventory upload
const UploadPage = dynamic(
  () => import('@domains/inventory-upload/views/UploadPage').then((module) => module.UploadPage),
  { ssr: false },
)

const UploadRoute: NextPageWithLayout = () => {
  // -- state --
  useRequireAuth()

  // -- render --
  return <UploadPage />
}

UploadRoute.getLayout = (page) => page

export default UploadRoute
