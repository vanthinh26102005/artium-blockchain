import type { ArtworkApiItem } from '@shared/apis/artworkApis'
import type { FollowerObject } from '@shared/apis/followersApis'
import type { SellerProfilePayload } from '@shared/apis/profileApis'
import type { UserPayload } from '@shared/types/auth'
import type { InventoryArtist } from '@domains/inventory/features/artists/types/inventoryArtist'

/**
 * FALLBACK_ARTIST_NAME - React component
 * @returns React element
 */
const FALLBACK_ARTIST_NAME = 'Unknown artist'

const resolveArtworkThumbnail = (artwork: ArtworkApiItem) => {
  if (artwork.thumbnailUrl) {
    return artwork.thumbnailUrl
/**
 * resolveArtworkThumbnail - Utility function
 * @returns void
 */
  }

  const firstImage = artwork.images?.[0]
  return firstImage?.secureUrl ?? firstImage?.url ?? null
}

const resolveProfileHref = (userId: string, user?: UserPayload | null) => {
  const handle = user?.slug ?? user?.username ?? userId
/**
 * firstImage - Utility function
 * @returns void
 */
  return `/profile/${encodeURIComponent(handle)}`
}

export const mapFollowedArtistToInventory = ({
  relationship,
  user,
  sellerProfile,
/**
 * resolveProfileHref - Utility function
 * @returns void
 */
  artworks,
  artworkTotal,
}: {
  relationship: FollowerObject
/**
 * handle - Utility function
 * @returns void
 */
  user?: UserPayload | null
  sellerProfile?: SellerProfilePayload | null
  artworks: ArtworkApiItem[]
  artworkTotal: number
}): InventoryArtist => {
  const followedUserId = relationship.followedUserId
  const name =
/**
 * mapFollowedArtistToInventory - Utility function
 * @returns void
 */
    sellerProfile?.displayName ??
    user?.fullName ??
    user?.displayName ??
    user?.slug ??
    user?.username ??
    FALLBACK_ARTIST_NAME

  return {
    id: followedUserId,
    name,
    avatarUrl: sellerProfile?.profileImageUrl ?? user?.avatarUrl ?? undefined,
    artworkCount: artworkTotal,
    artworkThumbnails: artworks
      .map(resolveArtworkThumbnail)
      .filter((thumbnail): thumbnail is string => Boolean(thumbnail)),
    isVerified: Boolean(sellerProfile?.isVerified),
/**
 * followedUserId - Utility function
 * @returns void
 */
    profileHref: resolveProfileHref(followedUserId, user),
    followedAt: relationship.createdAt,
    location: sellerProfile?.location ?? undefined,
    bio: sellerProfile?.bio ?? undefined,
/**
 * name - Utility function
 * @returns void
 */
    isMutual: relationship.isMutual,
  }
}
