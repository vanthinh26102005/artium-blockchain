import type { ArtworkApiItem } from '@shared/apis/artworkApis'
import type {
  CommentApiItem,
  MomentApiItem,
  MoodboardApiItem,
  SellerProfilePayload,
} from '@shared/apis/profileApis'
import type { UserPayload } from '@shared/types/auth'
import type {
  ProfileAbout,
  ProfileArtwork,
  ProfileMoodboard,
  ProfileMoment,
  ProfileOverviewData,
  ProfileSalesStats,
  ProfileStats,
  ProfileUser,
  ProfileMoodboardMedia,
  ProfileMoodboardArtwork,
  MomentDetail,
  MomentComment,
  MomentCommentAuthor,
} from '@domains/profile/types'
import type { Moment as MomentCard } from '@domains/profile/constants/moments'
import {
  DEFAULT_MOODBOARD_COVER,
  resolveMoodboardCoverUrl,
  resolveMoodboardMediaDisplayUrl,
} from '@domains/profile/utils/moodboardPresentation'

/**
 * DEFAULT_AVATAR - React component
 * @returns React element
 */
const DEFAULT_AVATAR = '/images/logo-dark-mode.png'
const DEFAULT_ARTWORK = '/images/placeholder-artwork.jpg'

const ensureText = (value?: string | null) => (value ?? '').toString()
/**
 * DEFAULT_ARTWORK - React component
 * @returns React element
 */

const formatCurrency = (amount: number, currency?: string | null) => {
  const code = (currency ?? 'USD').toUpperCase()
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount)
/**
 * ensureText - Utility function
 * @returns void
 */
  } catch {
    return `${code} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}

/**
 * formatCurrency - Utility function
 * @returns void
 */
const formatPriceLabel = (price?: number | string | null, currency?: string | null) => {
  if (price === undefined || price === null || price === '') {
    return 'Price on request'
  }
/**
 * code - Utility function
 * @returns void
 */

  const numeric = typeof price === 'string' ? Number(price) : price
  if (!Number.isFinite(numeric)) {
    return 'Price on request'
  }

  return formatCurrency(numeric, currency)
}

const resolveArtworkCover = (artwork: ArtworkApiItem) => {
  if (artwork.thumbnailUrl) {
/**
 * formatPriceLabel - Utility function
 * @returns void
 */
    return artwork.thumbnailUrl
  }

  const firstImage = artwork.images?.[0]
  if (firstImage?.secureUrl) {
    return firstImage.secureUrl
  }

/**
 * numeric - Utility function
 * @returns void
 */
  if (firstImage?.url) {
    return firstImage.url
  }

  return DEFAULT_ARTWORK
}

const formatDimensions = (artwork: ArtworkApiItem) => {
  const dimensions = artwork.dimensions
  if (!dimensions) return undefined
  const width = dimensions.width ?? null
/**
 * resolveArtworkCover - Utility function
 * @returns void
 */
  const height = dimensions.height ?? null
  const depth = dimensions.depth ?? null
  const unit = dimensions.unit ?? ''

  const parts = [width, height, depth].filter((value) => value !== null && value !== undefined)
  if (parts.length === 0) return undefined
  return `${parts.join(' x ')}${unit ? ` ${unit}` : ''}`
}
/**
 * firstImage - Utility function
 * @returns void
 */

/**
 * Maps a UserPayload (from /identity/users/me or /identity/users/slug/:slug)
 * to the profile domain's ProfileUser type.
 * This serves as the BASE profile — seller data enriches it if available.
 */
export const mapUserPayloadToProfileUser = (user: UserPayload): ProfileUser => ({
  username: user.slug ?? user.username ?? '',
  displayName: user.fullName ?? user.displayName ?? '',
  bio: '',
  avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
  role: undefined,
  location: undefined,
  verified: false,
  headline: undefined,
/**
 * formatDimensions - Utility function
 * @returns void
 */
})

/**
 * Merges seller profile data on top of a base ProfileUser.
/**
 * dimensions - Utility function
 * @returns void
 */
 * Called only when the user has a seller profile.
 */
export const enrichProfileUserWithSeller = (
  base: ProfileUser,
  seller: SellerProfilePayload,
/**
 * width - Utility function
 * @returns void
 */
): ProfileUser => ({
  ...base,
  username: base.username,
  displayName: seller.displayName || base.displayName,
/**
 * height - Utility function
 * @returns void
 */
  bio: ensureText(seller.bio) || base.bio,
  avatarUrl: seller.profileImageUrl || base.avatarUrl,
  role: seller.profileType ?? base.role,
  location: seller.location ?? base.location,
/**
 * depth - Utility function
 * @returns void
 */
  verified: Boolean(seller.isVerified),
  headline: seller.metaDescription ?? base.headline,
})

/**
 * unit - Utility function
 * @returns void
 */
/**
 * Creates a minimal ProfileAbout from a UserPayload (non-seller users).
 */
export const mapUserPayloadToProfileAbout = (_user: UserPayload): ProfileAbout => {
  void _user
/**
 * parts - Utility function
 * @returns void
 */

  return {
    biography: '',
    websiteUrl: '',
    instagram: '',
    twitter: '',
    profileCategories: [],
    roles: [],
    artisticVibes: [],
    artisticValues: [],
    artisticMediums: [],
    connectionAffiliations: '',
    connectionSeenAt: '',
/**
 * mapUserPayloadToProfileUser - Utility function
 * @returns void
 */
    connectionCurrently: '',
    inspireVibes: [],
    inspireValues: [],
    inspireMediums: [],
  }
}

export const mapSellerProfileToProfileUser = (sellerProfile: SellerProfilePayload): ProfileUser => ({
  username: '',
  displayName: sellerProfile.displayName,
  bio: ensureText(sellerProfile.bio),
  avatarUrl: sellerProfile.profileImageUrl || DEFAULT_AVATAR,
  role: sellerProfile.profileType ?? undefined,
  location: sellerProfile.location ?? undefined,
  verified: Boolean(sellerProfile.isVerified),
  headline: sellerProfile.metaDescription ?? undefined,
})

/**
 * enrichProfileUserWithSeller - Utility function
 * @returns void
 */
export const mapSellerProfileToProfileAbout = (
  sellerProfile: SellerProfilePayload,
): ProfileAbout => ({
  biography: ensureText(sellerProfile.bio),
  websiteUrl: ensureText(sellerProfile.websiteUrl),
  instagram: ensureText(sellerProfile.instagramUrl),
  twitter: ensureText(sellerProfile.twitterUrl),
  profileCategories: sellerProfile.profileType ? [sellerProfile.profileType] : [],
  roles: [],
  artisticVibes: [],
  artisticValues: [],
  artisticMediums: [],
  connectionAffiliations: '',
  connectionSeenAt: '',
  connectionCurrently: '',
  inspireVibes: [],
  inspireValues: [],
  inspireMediums: [],
})

export const mapArtworkToProfileArtwork = (
/**
 * mapUserPayloadToProfileAbout - Utility function
 * @returns void
 */
  artwork: ArtworkApiItem,
  sellerDisplayName: string,
): ProfileArtwork => ({
  id: artwork.id,
  title: artwork.title,
  artistName: artwork.creatorName || sellerDisplayName,
  priceLabel: formatPriceLabel(artwork.price, artwork.currency),
  coverUrl: resolveArtworkCover(artwork),
  likesCount: 0,
  medium: artwork.materials ?? undefined,
  dimensions: formatDimensions(artwork),
  isSold: artwork.status?.toLowerCase() === 'sold',
})

export const mapMomentToProfileMoment = (moment: MomentApiItem): ProfileMoment => ({
  id: moment.id,
  title: moment.caption || 'Moment',
  imageUrl:
    moment.thumbnailUrl ||
    (moment.mediaType === 'video' ? DEFAULT_ARTWORK : moment.mediaUrl),
  mediaType: moment.mediaType,
  likes: moment.likeCount ?? 0,
  comments: moment.commentCount ?? 0,
  shares: 0,
})
/**
 * mapSellerProfileToProfileUser - Utility function
 * @returns void
 */

export const mapProfileMomentToMomentCard = (
  moment: ProfileMoment,
  author: ProfileUser,
): MomentCard => ({
  id: moment.id,
  type: moment.mediaType ?? 'image',
  mediaUrl: moment.imageUrl,
  posterUrl: moment.mediaType === 'video' ? moment.imageUrl : undefined,
  caption: moment.title,
  createdAt: new Date().toISOString(),
  author: {
    id: author.username,
    name: author.displayName,
/**
 * mapSellerProfileToProfileAbout - Utility function
 * @returns void
 */
    username: author.username,
    avatarUrl: author.avatarUrl,
  },
  likes: moment.likes ?? 0,
  comments: moment.comments ?? 0,
  shares: moment.shares ?? 0,
})

export const mapMoodboardToProfileMoodboard = (
  moodboard: MoodboardApiItem,
  author: ProfileUser,
): ProfileMoodboard => {
  const artworkItems = (moodboard.artworks ?? [])
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map<ProfileMoodboardArtwork>((artwork) => ({
      artworkId: artwork.artworkId,
      title: artwork.artworkTitle?.trim() || 'Untitled artwork',
      imageUrl: artwork.artworkImageUrl ?? null,
      price: artwork.artworkPrice ?? null,
      sellerId: artwork.artworkSellerId ?? null,
      displayOrder: artwork.displayOrder,
      notes: artwork.notes ?? null,
/**
 * mapArtworkToProfileArtwork - Utility function
 * @returns void
 */
      tags: artwork.tags ?? null,
      isFavorite: Boolean(artwork.isFavorite),
      availabilityStatus: artwork.availabilityStatus ?? null,
    }))

  const mediaItems = (moodboard.media ?? [])
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .reduce<ProfileMoodboardMedia[]>((items, media) => {
      const displayUrl = resolveMoodboardMediaDisplayUrl(media)

      if (!displayUrl?.trim()) {
        return items
      }

      items.push({
        id: media.id,
        communityMediaId: media.communityMediaId,
/**
 * mapMomentToProfileMoment - Utility function
 * @returns void
 */
        mediaType: media.mediaType,
        url: media.url,
        secureUrl: media.secureUrl ?? null,
        thumbnailUrl: media.thumbnailUrl ?? null,
        displayUrl,
        durationSeconds: media.durationSeconds ?? null,
        displayOrder: media.displayOrder,
        isCover: Boolean(media.isCover),
      })

      return items
    }, [])

  const coverMedia = mediaItems.find((media) => media.isCover) ?? mediaItems[0]
  const secondaryMedia = mediaItems.find((media) => media.id !== coverMedia?.id)
/**
 * mapProfileMomentToMomentCard - Utility function
 * @returns void
 */
  const uploadedCoverUrls = mediaItems.map((media) => media.displayUrl)
  const savedArtworkCoverUrls = artworkItems
    .map((artwork) => artwork.imageUrl?.trim())
    .filter((url): url is string => Boolean(url))
  const fallbackCoverUrl = resolveMoodboardCoverUrl(moodboard, DEFAULT_MOODBOARD_COVER)

  return {
    id: moodboard.id,
    title: moodboard.title,
    author: author.displayName,
    authorAvatarUrl: author.avatarUrl,
    featuredArtist: undefined,
    coverUrl: coverMedia?.displayUrl || savedArtworkCoverUrls[0] || fallbackCoverUrl,
    secondaryCoverUrl: secondaryMedia?.displayUrl || savedArtworkCoverUrls[1],
    artworkCoverUrls: [...uploadedCoverUrls, ...savedArtworkCoverUrls],
    artworkItems,
    mediaItems,
    isPrivate: moodboard.isPrivate,
  }
}

const buildStats = (sellerProfile: SellerProfilePayload, totalArtworks: number): ProfileStats => ({
  artworks: totalArtworks,
  followers: 0,
/**
 * mapMoodboardToProfileMoodboard - Utility function
 * @returns void
 */
  following: 0,
  collectors: 0,
  worksSold: sellerProfile.soldArtworkCount ?? 0,
  testimonials: 0,
})

const buildSalesStats = (
/**
 * artworkItems - Utility function
 * @returns void
 */
  sellerProfile: SellerProfilePayload,
  artworks: ArtworkApiItem[],
): ProfileSalesStats => {
  const soldCount = sellerProfile.soldArtworkCount ?? 0
  const totalSales = Number(sellerProfile.totalSales ?? 0)
  const averagePrice = soldCount > 0 ? totalSales / soldCount : 0
  const medianPrice = averagePrice
  const currency = artworks.find((artwork) => artwork.currency)?.currency ?? 'USD'

  return {
    averagePrice,
    medianPrice,
    currency,
    recentSales: [],
  }
}

export const mapProfileOverviewData = ({
  sellerProfile,
/**
 * mediaItems - Utility function
 * @returns void
 */
  artworks,
  artworksTotal,
  moments,
  moodboards,
}: {
  sellerProfile: SellerProfilePayload
  artworks: ArtworkApiItem[]
/**
 * displayUrl - Utility function
 * @returns void
 */
  artworksTotal?: number
  moments: MomentApiItem[]
  moodboards: MoodboardApiItem[]
}): ProfileOverviewData => {
  const user = mapSellerProfileToProfileUser(sellerProfile)
  const profileArtworks = artworks.map((artwork) => mapArtworkToProfileArtwork(artwork, user.displayName))
  const profileMoments = moments.map(mapMomentToProfileMoment)
  const profileMoodboards = moodboards.map((board) => mapMoodboardToProfileMoodboard(board, user))
  const totalArtworksCount =
    typeof artworksTotal === 'number' ? artworksTotal : profileArtworks.length

  return {
    user,
    stats: buildStats(sellerProfile, totalArtworksCount),
    salesStats: buildSalesStats(sellerProfile, artworks),
    about: mapSellerProfileToProfileAbout(sellerProfile),
    artworks: profileArtworks,
    moments: profileMoments,
    moodboards: profileMoodboards,
  }
}

export const mapMomentToMomentDetail = (
  moment: MomentApiItem,
  author: ProfileUser,
/**
 * coverMedia - Utility function
 * @returns void
 */
): MomentDetail => ({
  id: moment.id,
  title: moment.caption || 'Moment',
  caption: moment.caption || '',
/**
 * secondaryMedia - Utility function
 * @returns void
 */
  mediaUrl: moment.mediaUrl,
  posterUrl: moment.thumbnailUrl || undefined,
  mediaType: moment.mediaType,
  author: {
/**
 * uploadedCoverUrls - Utility function
 * @returns void
 */
    username: author.username,
    displayName: author.displayName,
    avatarUrl: author.avatarUrl,
    verified: Boolean(author.verified),
/**
 * savedArtworkCoverUrls - Utility function
 * @returns void
 */
  },
  stats: {
    likes: moment.likeCount ?? 0,
    comments: moment.commentCount ?? 0,
    shares: 0,
  },
/**
 * fallbackCoverUrl - Utility function
 * @returns void
 */
  linkedArtwork: undefined,
  isLiked: false,
  isSaved: false,
  createdAt: moment.createdAt,
})

export const mapMomentToProfileDetail = (
  moment: MomentApiItem,
  author: ProfileUser,
): MomentCard => ({
  id: moment.id,
  type: moment.mediaType,
  mediaUrl: moment.mediaUrl,
  posterUrl: moment.thumbnailUrl || undefined,
  caption: moment.caption || '',
  createdAt: moment.createdAt,
  author: {
    id: author.username,
    name: author.displayName,
    username: author.username,
/**
 * buildStats - Utility function
 * @returns void
 */
    avatarUrl: author.avatarUrl,
  },
  likes: moment.likeCount ?? 0,
  comments: moment.commentCount ?? 0,
  shares: 0,
})

/**
 * Builds the complete ProfileOverviewData from a User + optional SellerProfile.
 * This is the new primary entry point, replacing the seller-only version.
 */
export const buildProfileOverviewData = ({
/**
 * buildSalesStats - Utility function
 * @returns void
 */
  user,
  sellerProfile,
  artworks,
  artworksTotal,
  moments,
  moodboards,
}: {
/**
 * soldCount - Utility function
 * @returns void
 */
  user: UserPayload
  sellerProfile?: SellerProfilePayload | null
  artworks: ArtworkApiItem[]
  artworksTotal?: number
/**
 * totalSales - Utility function
 * @returns void
 */
  moments: MomentApiItem[]
  moodboards: MoodboardApiItem[]
}): ProfileOverviewData => {
  let profileUser = mapUserPayloadToProfileUser(user)
/**
 * averagePrice - Utility function
 * @returns void
 */
  let about = mapUserPayloadToProfileAbout(user)

  if (sellerProfile) {
    profileUser = enrichProfileUserWithSeller(profileUser, sellerProfile)
/**
 * medianPrice - Utility function
 * @returns void
 */
    about = mapSellerProfileToProfileAbout(sellerProfile)
  }

  const profileArtworks = artworks.map((artwork) =>
/**
 * currency - Utility function
 * @returns void
 */
    mapArtworkToProfileArtwork(artwork, profileUser.displayName),
  )
  const profileMoments = moments.map(mapMomentToProfileMoment)
  const profileMoodboards = moodboards.map((board) =>
    mapMoodboardToProfileMoodboard(board, profileUser),
  )
  const totalArtworksCount =
    typeof artworksTotal === 'number' ? artworksTotal : profileArtworks.length

  const stats: ProfileStats = sellerProfile
    ? buildStats(sellerProfile, totalArtworksCount)
    : { artworks: totalArtworksCount, followers: 0, following: 0, collectors: 0, worksSold: 0, testimonials: 0 }

/**
 * mapProfileOverviewData - Utility function
 * @returns void
 */
  const salesStats: ProfileSalesStats = sellerProfile
    ? buildSalesStats(sellerProfile, artworks)
    : { averagePrice: 0, medianPrice: 0, currency: 'USD', recentSales: [] }

  return {
    user: profileUser,
    stats,
    salesStats,
    about,
    artworks: profileArtworks,
    moments: profileMoments,
    moodboards: profileMoodboards,
  }
}

export const resolveProfileUsername = (_sellerProfile?: SellerProfilePayload | null, fallback?: string) =>
/**
 * user - Custom React hook
 * @returns void
 */
  fallback || ''

export const resolveUsername = (
  user?: UserPayload | null,
/**
 * profileArtworks - Utility function
 * @returns void
 */
  _sellerProfile?: SellerProfilePayload | null,
  fallback?: string,
) => user?.slug || user?.username || fallback || ''

/**
 * profileMoments - Utility function
 * @returns void
 */
const resolveCommentAuthor = (
  comment: CommentApiItem,
  fallback?: MomentCommentAuthor,
): MomentCommentAuthor => ({
/**
 * profileMoodboards - Utility function
 * @returns void
 */
  id: comment.author?.id ?? comment.userId,
  username: comment.author?.username || fallback?.username || 'user',
  displayName:
    comment.author?.displayName || fallback?.displayName || fallback?.username || 'User',
/**
 * totalArtworksCount - Utility function
 * @returns void
 */
  avatarUrl: comment.author?.avatarUrl || fallback?.avatarUrl || DEFAULT_AVATAR,
})

export const mapCommentToMomentComment = (
  comment: CommentApiItem,
  fallbackAuthor?: MomentCommentAuthor,
): MomentComment => ({
  id: comment.id,
  author: resolveCommentAuthor(comment, fallbackAuthor),
  content: comment.content,
  createdAt: comment.createdAt,
})

/**
 * mapMomentToMomentDetail - Utility function
 * @returns void
 */
/**
 * mapMomentToProfileDetail - Utility function
 * @returns void
 */
/**
 * buildProfileOverviewData - Utility function
 * @returns void
 */
/**
 * profileArtworks - Utility function
 * @returns void
 */
/**
 * profileMoments - Utility function
 * @returns void
 */
/**
 * profileMoodboards - Utility function
 * @returns void
 */
/**
 * totalArtworksCount - Utility function
 * @returns void
 */
/**
 * stats - Utility function
 * @returns void
 */
/**
 * salesStats - Utility function
 * @returns void
 */
/**
 * resolveProfileUsername - Utility function
 * @returns void
 */
/**
 * resolveUsername - Utility function
 * @returns void
 */
/**
 * resolveCommentAuthor - Utility function
 * @returns void
 */
/**
 * mapCommentToMomentComment - Utility function
 * @returns void
 */