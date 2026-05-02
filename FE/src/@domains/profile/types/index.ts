import { Artwork, User } from '@shared/types'

export type ProfileTabKey = 'overview' | 'artworks' | 'moments' | 'moodboards'

export type ProfileStats = {
  artworks: number
  followers: number
  following: number
  collectors: number
  worksSold: number
  testimonials: number
}

export type ProfileUser = User & {
  role?: string
  location?: string
  secondaryLocation?: string
  verified?: boolean
  headline?: string
}

export type ProfileArtwork = Artwork & {
  medium?: string
  dimensions?: string
  actionLabel?: string
  isSold?: boolean
}

export type ProfileMoment = {
  id: string
  title: string
  imageUrl: string
  mediaType?: 'image' | 'video'
  likes: number
  comments: number
  shares: number
}

export type MomentDetailAuthor = {
  username: string
  displayName: string
  avatarUrl: string
  verified: boolean
}

export type MomentDetailArtwork = {
  id: string
  title: string
  coverUrl: string
  priceLabel: string
  artistName: string
}

export type MomentDetailStats = {
  likes: number
  comments: number
  shares: number
}

export type MomentDetail = {
  id: string
  title: string
  caption: string
  mediaUrl: string
  posterUrl?: string
  mediaType: 'image' | 'video'
  author: MomentDetailAuthor
  stats: MomentDetailStats
  linkedArtwork?: MomentDetailArtwork
  isLiked: boolean
  isSaved: boolean
  createdAt: string
}

export type MomentCommentAuthor = {
  id?: string
  username: string
  displayName: string
  avatarUrl: string
}

export type MomentComment = {
  id: string
  author: MomentCommentAuthor
  content: string
  createdAt: string
  status?: 'pending' | 'error'
}

export type ProfileUploadedMediaStatus = 'pending' | 'consumed' | 'rejected' | 'deleted'

export type ProfileUploadedMediaType = 'image' | 'video'

export type ProfileUploadedMedia = {
  mediaId: string
  url: string
  secureUrl: string
  mediaType: ProfileUploadedMediaType
  mimeType: string
  originalFilename: string
  size: number
  status: ProfileUploadedMediaStatus
  durationSeconds?: number | null
  thumbnailUrl?: string | null
  createdAt: string | Date
}

export type ProfileMoodboard = {
  id: string
  title: string
  author: string
  authorAvatarUrl?: string
  featuredArtist?: string
  coverUrl: string
  secondaryCoverUrl?: string
  artworkCoverUrls?: string[]
  mediaItems?: ProfileMoodboardMedia[]
  isPrivate?: boolean
}

export type ProfileMoodboardMedia = {
  id: string
  communityMediaId: string
  mediaType: ProfileUploadedMediaType
  url: string
  secureUrl?: string | null
  thumbnailUrl?: string | null
  displayUrl: string
  durationSeconds?: number | null
  displayOrder: number
  isCover: boolean
}

export type ProfileSalesPoint = {
  label: string
  value: number
}

export type ProfileSalesStats = {
  averagePrice: number
  medianPrice: number
  currency: string
  recentSales: ProfileSalesPoint[]
}

export type ProfileAbout = {
  biography: string
  websiteUrl: string
  instagram: string
  twitter: string
  profileCategories: string[]
  roles: string[]
  artisticVibes: string[]
  artisticValues: string[]
  artisticMediums: string[]
  connectionAffiliations: string
  connectionSeenAt: string
  connectionCurrently: string
  inspireVibes: string[]
  inspireValues: string[]
  inspireMediums: string[]
}

export type ProfileOverviewData = {
  user: ProfileUser
  stats: ProfileStats
  salesStats: ProfileSalesStats
  about: ProfileAbout
  artworks: ProfileArtwork[]
  moments: ProfileMoment[]
  moodboards: ProfileMoodboard[]
}
