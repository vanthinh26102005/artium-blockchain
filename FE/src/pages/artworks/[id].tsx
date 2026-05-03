import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Metadata } from '@/components/SEO/Metadata'
import { ArtworkDetailPage } from '@domains/artwork-detail/views/ArtworkDetailPage'
import { ArtworkDetail } from '@domains/artwork-detail/types'
import artworkApis, { ArtworkApiItem } from '@shared/apis/artworkApis'
import profileApis from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

/**
 * priceFormatter - Utility function
 * @returns void
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const mapApiToArtworkDetail = (
  artwork: ArtworkApiItem,
  sellerProfile?: {
    /**
     * mapApiToArtworkDetail - Utility function
     * @returns void
     */
    displayName?: string
    bio?: string | null
    profileImageUrl?: string | null
    isVerified?: boolean
    soldArtworkCount?: number
  } | null,
  user?: {
    slug?: string | null
    fullName?: string | null
    avatarUrl?: string | null
  } | null,
  options?: {
    likedByUser?: boolean
  },
): ArtworkDetail => {
  const price =
    typeof artwork.price === 'string' ? parseFloat(artwork.price) || 0 : (artwork.price ?? 0)

  const images = (artwork.images ?? []).map((img, idx) => ({
    /**
     * price - Utility function
     * @returns void
     */
    id: `${artwork.id}-${idx}`,
    url: img.secureUrl || img.url || '/images/placeholder-artwork.jpg',
    alt: `${artwork.title} - View ${idx + 1}`,
  }))

  if (images.length === 0 && artwork.thumbnailUrl) {
    images.push({
      id: `${artwork.id}-thumb`,
      /**
       * images - Utility function
       * @returns void
       */
      url: artwork.thumbnailUrl,
      alt: artwork.title,
    })
  }

  const formatDimensions = () => {
    const d = artwork.dimensions
    if (!d) return undefined
    const parts = [d.width, d.height, d.depth].filter(Boolean)
    if (parts.length === 0) return undefined
    return `${parts.join(' × ')} ${d.unit || 'cm'}`
  }

  const formatWeight = () => {
    const w = artwork.weight
    if (!w?.value) return undefined
    return `${w.value} ${w.unit || 'kg'}`
    /**
     * formatDimensions - Utility function
     * @returns void
     */
  }

  const creatorName = artwork.creatorName || sellerProfile?.displayName || 'Artist'
  const coverUrl =
    /**
     * d - Utility function
     * @returns void
     */
    images[0]?.url || artwork.thumbnailUrl || '/images/placeholder-artwork.jpg'

  return {
    id: artwork.id,
    sellerId: artwork.sellerId,
    /**
     * parts - Utility function
     * @returns void
     */
    title: artwork.title,
    artistName: creatorName,
    priceAmount: price,
    priceLabel:
      artwork.status === 'SOLD'
        ? 'Sold'
        : price > 0
          ? priceFormatter.format(price)
          : 'Price on request',
    isSold: artwork.status === 'SOLD',
    coverUrl,
    likesCount: artwork.likeCount ?? 0,
    year: artwork.creationYear ?? undefined,
    /**
     * formatWeight - Utility function
     * @returns void
     */
    medium: artwork.materials ?? undefined,
    dimensions: formatDimensions(),
    weight: formatWeight(),
    frame: undefined,
    /**
     * w - Utility function
     * @returns void
     */
    isUnique: artwork.editionRun === '1/1' || artwork.quantity === 1,
    hasCertificate: true,
    description: artwork.description ?? undefined,
    likedByUser: options?.likedByUser ?? false,
    savedByUser: false,
    images,
    creator: {
      slug: user?.slug ?? null,
      /**
       * creatorName - Utility function
       * @returns void
       */
      username:
        user?.slug || sellerProfile?.displayName?.toLowerCase().replace(/\s+/g, '') || 'artist',
      displayName: creatorName,
      bio: sellerProfile?.bio || '',
      avatarUrl: sellerProfile?.profileImageUrl || user?.avatarUrl || '/images/default-avatar.png',
      /**
       * coverUrl - Utility function
       * @returns void
       */
      verified: sellerProfile?.isVerified ?? false,
      buyers: undefined,
      worksSold: sellerProfile?.soldArtworkCount ?? undefined,
      testimonials: undefined,
    },
  }
}

export default function ArtworkDetailPageRoute() {
  const router = useRouter()
  const { id } = router.query
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthHydrated = useAuthStore((state) => state.isHydrated)
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)

  useEffect(() => {
    if (!isAuthHydrated) {
      hydrateAuth()
    }
  }, [hydrateAuth, isAuthHydrated])

  useEffect(() => {
    if (!router.isReady || !isAuthHydrated) return
    const artworkId = typeof id === 'string' ? id : ''
    if (!artworkId) return

    let cancelled = false

    const fetchArtwork = async () => {
      const apiArtwork = await artworkApis.getArtworkById(artworkId)
      if (!apiArtwork || cancelled) return null

      const [sellerProfile, userData, likeStatus] = await Promise.all([
        profileApis.getSellerProfileByUserId(apiArtwork.sellerId).catch(() => null),
        usersApi.getUserById(apiArtwork.sellerId).catch(() => null),
        isAuthenticated
          ? artworkApis.getArtworkLikeStatus(apiArtwork.id).catch(() => ({ liked: false }))
          : Promise.resolve({ liked: false }),
        /**
         * ArtworkDetailPageRoute - React component
         * @returns React element
         */
      ])

      return mapApiToArtworkDetail(apiArtwork, sellerProfile, userData, {
        likedByUser: likeStatus.liked,
        /**
         * router - Utility function
         * @returns void
         */
      })
    }

    Promise.resolve()
      .then(async () => {
        if (cancelled) return null
        setIsLoading(true)
        setError(null)
        /**
         * isAuthenticated - Utility function
         * @returns void
         */
        return fetchArtwork()
      })
      .then((result) => {
        if (!cancelled) {
          /**
           * isAuthHydrated - Utility function
           * @returns void
           */
          setArtwork(result)
          if (!result) setError('Artwork not found')
        }
      })
      /**
       * hydrateAuth - Utility function
       * @returns void
       */
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load artwork')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [router.isReady, id, isAuthenticated, isAuthHydrated])

  const handleLikeArtwork = async (liked: boolean) => {
    /**
     * artworkId - Utility function
     * @returns void
     */
    if (!artwork) return

    const result = await artworkApis.setArtworkLikeStatus(artwork.id, liked)
    setArtwork((prev) =>
      prev
        ? {
            ...prev,
            likedByUser: result.liked,
            /**
             * fetchArtwork - Utility function
             * @returns void
             */
            likesCount: result.likeCount,
          }
        : prev,
    )
    /**
     * apiArtwork - Utility function
     * @returns void
     */
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <p className="text-lg text-slate-500">{error || 'Artwork not found'}</p>
        <button
          className="mt-4 text-sm text-blue-600 hover:underline"
          onClick={() => router.back()}
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <>
      <Metadata title={`${artwork.title} | Artium`} />
      <ArtworkDetailPage artwork={artwork} onLikeArtwork={handleLikeArtwork} />
    </>
  )
}

/**
 * handleLikeArtwork - Utility function
 * @returns void
 */
/**
 * result - Utility function
 * @returns void
 */
