import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { NextPageWithLayout } from '@shared/types/next'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

const UploadPage = dynamic(
  () => import('@domains/inventory-upload/views/UploadPage').then((module) => module.UploadPage),
  { ssr: false },
)

const EditArtworkRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { canRenderProtected } = useRequireAuth()
  const artworkId = typeof router.query.artworkId === 'string' ? router.query.artworkId : undefined

  if (!canRenderProtected || !artworkId) {
    return null
  }

  return <UploadPage mode="edit" artworkId={artworkId} />
}

EditArtworkRoute.getLayout = (page) => page

export default EditArtworkRoute
