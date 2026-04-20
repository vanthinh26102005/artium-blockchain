/**
 * Mappers to convert BE API responses into discover component types.
 * Keeps grid components decoupled from raw API shapes.
 */
import type { ArtworkApiItem } from '@shared/apis/artworkApis'
import type { EventApiResponse } from '@shared/apis/eventsApis'
import type { DiscoverArtwork } from '@domains/discover/mock/mockArtworks'
import type { DiscoverProfile } from '@domains/discover/mock/mockProfiles'
import type { DiscoverEvent, EventStatus } from '@domains/discover/mock/mockEvents'
import type { DiscoverMoment } from '@domains/discover/mock/mockMoments'
import type { TopPicksArtwork } from '@domains/discover/mock/mockTopPicksArtworks'

// ---------------------------------------------------------------------------
// Artwork → DiscoverArtwork
// ---------------------------------------------------------------------------

const resolveArtworkImage = (artwork: ArtworkApiItem): string => {
  if (artwork.thumbnailUrl) return artwork.thumbnailUrl
  const firstImage = artwork.images?.[0]
  return firstImage?.secureUrl || firstImage?.url || '/images/placeholder-artwork.jpg'
}

export const mapArtworkToDiscover = (artwork: ArtworkApiItem): DiscoverArtwork => ({
  id: artwork.id,
  title: artwork.title,
  price: typeof artwork.price === 'string' ? parseFloat(artwork.price) || 0 : artwork.price ?? 0,
  isSold: artwork.status === 'SOLD',
  statusLabel: undefined,
  imageMedium: resolveArtworkImage(artwork),
  imageSmall: resolveArtworkImage(artwork),
  imageMediumWidth: artwork.dimensions?.width ?? 640,
  imageMediumHeight: artwork.dimensions?.height ?? 480,
  creator: {
    id: artwork.sellerId,
    username: artwork.creatorName ?? 'Artist',
    fullName: artwork.creatorName ?? 'Artist',
    coverImage: undefined,
  },
})

// ---------------------------------------------------------------------------
// Artwork → TopPicksArtwork
// ---------------------------------------------------------------------------

export const mapArtworkToTopPick = (artwork: ArtworkApiItem): TopPicksArtwork => {
  const price =
    typeof artwork.price === 'string' ? parseFloat(artwork.price) || 0 : artwork.price ?? 0
  return {
    id: artwork.id,
    title: artwork.title,
    username: artwork.creatorName ?? 'Artist',
    avatarUrl: '/images/default-avatar.png',
    imageUrl: resolveArtworkImage(artwork),
    height: 200 + Math.floor(Math.random() * 80),
    badges: {
      price: price > 0 ? `$${price.toLocaleString()}` : undefined,
    },
  }
}

// ---------------------------------------------------------------------------
// SellerProfile → DiscoverProfile
// ---------------------------------------------------------------------------

type SellerProfileApi = {
  profileId?: string
  id?: string
  userId: string
  displayName: string
  profileType?: string
  profileImageUrl?: string | null
  coverImageUrl?: string | null
  location?: string | null
  isVerified?: boolean
  soldArtworkCount?: number
  totalSales?: string
}

export const mapSellerProfileToDiscover = (profile: SellerProfileApi): DiscoverProfile => ({
  id: profile.profileId || profile.id || profile.userId,
  username: profile.displayName.toLowerCase().replace(/\s+/g, ''),
  fullName: profile.displayName,
  role: profile.profileType || 'Artist',
  location: profile.location || '',
  statsLabel: profile.soldArtworkCount
    ? `${profile.soldArtworkCount} works sold`
    : profile.totalSales
      ? `$${profile.totalSales} in sales`
      : '',
  avatarUrl: profile.profileImageUrl || '/images/default-avatar.png',
  coverImageSmall: profile.coverImageUrl || undefined,
  isVerified: profile.isVerified ?? false,
  isFollowing: false,
  collage: [],
})

// ---------------------------------------------------------------------------
// EventApiResponse → DiscoverEvent
// ---------------------------------------------------------------------------

const formatEventDate = (iso?: string | null) => {
  if (!iso) return { month: '', day: '', startTime: '' }
  const d = new Date(iso)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return {
    month: months[d.getMonth()],
    day: String(d.getDate()),
    startTime: `${days[d.getDay()]}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
  }
}

const resolveEventLocation = (event: EventApiResponse): string => {
  const loc = event.location
  if (!loc) return ''
  if (loc.venueName && loc.address?.city) return `${loc.venueName}, ${loc.address.city}`
  if (loc.venueName) return loc.venueName
  if (loc.address) {
    const parts = [loc.address.line1, loc.address.city, loc.address.country].filter(Boolean)
    return parts.join(', ')
  }
  return ''
}

export const mapEventToDiscover = (event: EventApiResponse): DiscoverEvent => {
  const { month, day, startTime } = formatEventDate(event.startTime)
  return {
    id: event.id,
    title: event.title,
    location: resolveEventLocation(event),
    startTime,
    month,
    day,
    status: 'rsvp' as EventStatus,
    attendees: event.attendeeCount ?? 0,
    imageUrl: event.coverImageUrl || undefined,
  }
}

// ---------------------------------------------------------------------------
// MomentApiItem → DiscoverMoment
// ---------------------------------------------------------------------------

type MomentApi = {
  id: string
  userId: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  thumbnailUrl?: string | null
  caption?: string | null
  likeCount?: number
  commentCount?: number
}

export const mapMomentToDiscover = (
  moment: MomentApi,
  userInfo?: {
    username: string
    fullName: string
    avatarUrl: string
    isVerified?: boolean
  },
): DiscoverMoment => ({
  id: moment.id,
  caption: moment.caption || '',
  user: {
    id: moment.userId,
    username: userInfo?.username ?? 'user',
    fullName: userInfo?.fullName ?? 'User',
    avatarUrl: userInfo?.avatarUrl ?? '/images/default-avatar.png',
    isVerified: userInfo?.isVerified ?? false,
  },
  contents:
    moment.mediaType === 'video'
      ? [
          {
            video: {
              title: moment.caption || 'Moment',
              processedThumb: moment.thumbnailUrl || moment.mediaUrl,
              videoUrl: moment.mediaUrl,
            },
          },
        ]
      : [{ image: { imageMedium: moment.mediaUrl } }],
  stats: {
    likes: moment.likeCount ?? 0,
    comments: moment.commentCount ?? 0,
  },
})
