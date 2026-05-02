import type { ArtworkApiItem } from '@shared/apis/artworkApis'
import type { FollowerObject } from '@shared/apis/followersApis'
import type { SellerProfilePayload } from '@shared/apis/profileApis'
import type { UserPayload } from '@shared/types/auth'
import type { InventoryArtist } from '@domains/inventory/features/artists/types/inventoryArtist'

const FALLBACK_ARTIST_NAME = 'Unknown artist'

const resolveArtworkThumbnail = (artwork: ArtworkApiItem) => {
  if (artwork.thumbnailUrl) {
    return artwork.thumbnailUrl
  }

  const firstImage = artwork.images?.[0]
  return firstImage?.secureUrl ?? firstImage?.url ?? null
}

const resolveProfileHref = (userId: string, user?: UserPayload | null) => {
  const handle = user?.slug ?? user?.username ?? userId
  return `/profile/${encodeURIComponent(handle)}`
}

export const mapFollowedArtistToInventory = ({
  relationship,
  user,
  sellerProfile,
  artworks,
  artworkTotal,
}: {
  relationship: FollowerObject
  user?: UserPayload | null
  sellerProfile?: SellerProfilePayload | null
  artworks: ArtworkApiItem[]
  artworkTotal: number
}): InventoryArtist => {
  const followedUserId = relationship.followedUserId
  const name =
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
    profileHref: resolveProfileHref(followedUserId, user),
    followedAt: relationship.createdAt,
    location: sellerProfile?.location ?? undefined,
    bio: sellerProfile?.bio ?? undefined,
    isMutual: relationship.isMutual,
  }
}
