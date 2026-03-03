import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Metadata } from '@/components/SEO/Metadata'
import { ArtworkDetailPage } from '@domains/artwork-detail/views/ArtworkDetailPage'
import { getArtworkDetailById, MOCK_ARTWORK_DETAIL } from '@domains/artwork-detail/mock/mockArtworkDetail'
import { ArtworkDetail } from '@domains/artwork-detail/types'

export default function ArtworkDetailPageRoute() {
  const router = useRouter()
  const { id } = router.query
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // On server, we render a stable loading state
  if (!hasMounted || !router.isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    )
  }

  // On client, we have the ID and can fetch the correct artwork
  const artworkId = typeof id === 'string' ? id : ''
  const artwork = getArtworkDetailById(artworkId) || MOCK_ARTWORK_DETAIL

  return (
    <>
      <Metadata title={`${artwork.title} | Artium`} />
      <ArtworkDetailPage artwork={artwork} />
    </>
  )
}
