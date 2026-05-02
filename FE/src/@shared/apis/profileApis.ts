import { apiFetch, encodePathSegment, withQuery } from '@shared/services/apiClient'

type SellerProfilePayload = {
  profileId?: string // DTO field name
  id?: string // Entity field name (backend returns this)
  userId: string
  profileType?: string
  displayName: string
  bio?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: null | string
  websiteUrl?: string | null
  location?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  businessPhone?: string | null
  businessAddress?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  } | null
  stripeOnboardingComplete?: boolean
  paypalOnboardingComplete?: boolean
  isActive?: boolean
  isVerified?: boolean
  soldArtworkCount?: number
  totalSales?: string
  averageRating?: string | null
  isFeatured?: boolean
  metaDescription?: string | null
  tagIds?: string[] | null
  createdAt?: string
  updatedAt?: string
}

type UpdateSellerProfileInput = {
  profileType?: string
  displayName?: string
  bio?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: null | string
  websiteUrl?: string | null
  location?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  businessRegistration?: string | null
  taxId?: string | null
  businessPhone?: string | null
  businessAddress?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  } | null
  isActive?: boolean
  metaDescription?: string | null
  tagIds?: string[] | null
}

type UpdateSellerProfileResponse = {
  success: boolean
  message: string
  sellerProfile: SellerProfilePayload
}

type MomentApiItem = {
  id: string
  userId: string
  mediaUrl: (string & {})
  mediaType: 'image' | 'video'
  thumbnailUrl?: null | string
  caption?: string | null
  isPinned: boolean
  isArchived: boolean
  expiresAt?: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  location?: string | null
  hashtags?: string[] | null
  durationSeconds?: number | null
  createdAt: string
  updatedAt?: string | null
}

type MoodboardApiItem = {
  id: string
  userId: string
  title: string
  description?: string | null
  coverImageUrl?: null | string
  isPrivate: boolean
  artworkCount: number
  likeCount: number
  viewCount: number
  shareCount: number
  isCollaborative: boolean
  collaboratorIds?: string[] | null
  tags?: string[] | null
  displayOrder: number
  createdAt: string
  updatedAt?: string | null
  media?: MoodboardApiMediaItem[]
}

type MoodboardApiMediaItem = {
  id: string
  communityMediaId: string
  mediaType: 'image' | 'video'
  url: string
  secureUrl?: string | null
  thumbnailUrl?: string | null
  durationSeconds?: number | null
  displayOrder: number
  isCover: boolean
}

type CommentAuthorApi = {
  id: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

type CommentApiItem = {
  id: string
  userId: string
  commentableType: string
  commentableId: string
  parentCommentId?: string | null
  content: string
  mediaUrl?: string | null
  mentionedUserIds?: string[] | null
  likeCount: number
  replyCount: number
  isEdited: boolean
  editedAt?: string | null
  isDeleted: boolean
  deletedAt?: string | null
  isFlagged: boolean
  contentOwnerId?: string | null
  createdAt: string
  updatedAt?: string | null
  author?: CommentAuthorApi | null
}

type CreateMomentCommentInput = {
  content: string
  parentCommentId?: string
  mentionedUserIds?: string[]
  contentOwnerId?: string
}

type LikeStatusResponse = {
  liked: boolean
  changed: boolean
}

type CreateMomentInput = {
  mediaId: string
  caption?: string
  isPinned?: boolean
  location?: string
  hashtags?: string[]
  durationSeconds?: number
  taggedArtworkIds?: string[]
}

type CreateMoodboardInput = {
  title: string
  description?: string
  mediaIds?: string[]
  coverMediaId?: string
  isPrivate?: boolean
  isCollaborative?: boolean
  tags?: string[]
}

type CreateSellerProfileInput = {
  profileType: string
  displayName: string
  bio?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: null | string
  websiteUrl?: string | null
  location?: string | null
}

type CreateSellerProfileResponse = {
  success: boolean
  message: string
  sellerProfile: SellerProfilePayload
}

type SearchSellerProfilesResponse = {
  items: SellerProfilePayload[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}

export const profileApis = {
  getSellerProfileByUserId: (userId: string) =>
    apiFetch<SellerProfilePayload>(`/identity/seller-profiles/user/${encodePathSegment(userId)}`, {
      auth: true,
      cache: 'no-store',
    }),
  updateSellerProfile: (profileId: string, input: UpdateSellerProfileInput) =>
    apiFetch<UpdateSellerProfileResponse>(
      `/identity/seller-profiles/${encodePathSegment(profileId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      },
    ),
  listUserMoments: (
    userId: string,
    options?: { skip?: number; take?: number; includeArchived?: boolean },
  ) =>
    apiFetch<MomentApiItem[]>(
      withQuery(`/community/moments/user/${encodePathSegment(userId)}`, options),
      {
        auth: false,
        cache: 'no-store',
      },
    ),
  getMoment: (momentId: string) =>
    apiFetch<MomentApiItem | null>(`/community/moments/${encodePathSegment(momentId)}`, {
      auth: false,
      cache: 'no-store',
    }),
  listUserMoodboards: (
    userId: string,
    options?: { skip?: number; take?: number; includePrivate?: boolean },
  ) =>
    apiFetch<MoodboardApiItem[]>(
      withQuery(`/community/moodboards/user/${encodePathSegment(userId)}`, options),
      {
        auth: false,
        cache: 'no-store',
      },
    ),
  getMoodboard: (moodboardId: string) =>
    apiFetch<MoodboardApiItem | null>(
      `/community/moodboards/${encodePathSegment(moodboardId)}`,
      {
        auth: false,
        cache: 'no-store',
      },
    ),
  listMomentComments: (
    momentId: string,
    options?: { skip?: number; take?: number; includeDeleted?: boolean },
  ) =>
    apiFetch<CommentApiItem[]>(
      withQuery(`/community/moments/${encodePathSegment(momentId)}/comments`, options),
      {
        auth: false,
        cache: 'no-store',
      },
    ),
  createMomentComment: (momentId: string, input: CreateMomentCommentInput) =>
    apiFetch<CommentApiItem>(`/community/moments/${encodePathSegment(momentId)}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
      auth: true,
    }),
  getMomentLikeStatus: (momentId: string) =>
    apiFetch<{ liked: boolean }>(
      `/community/moments/${encodePathSegment(momentId)}/likes/me`,
      {
        auth: true,
        cache: 'no-store',
      },
    ),
  setMomentLikeStatus: (momentId: string, liked: boolean, contentOwnerId?: string) =>
    apiFetch<LikeStatusResponse>(`/community/moments/${encodePathSegment(momentId)}/likes`, {
      method: 'PUT',
      body: JSON.stringify({ liked, contentOwnerId }),
      auth: true,
    }),
  createMoment: (input: CreateMomentInput) =>
    apiFetch<MomentApiItem>('/community/moments', {
      method: 'POST',
      body: JSON.stringify(input),
      auth: true,
    }),
  createMoodboard: (input: CreateMoodboardInput) =>
    apiFetch<MoodboardApiItem>('/community/moodboards', {
      method: 'POST',
      body: JSON.stringify(input),
      auth: true,
    }),
  searchSellerProfiles: (searchQuery: string, options?: { skip?: number; take?: number }) =>
    apiFetch<SearchSellerProfilesResponse>(
      withQuery('/identity/seller-profiles', { searchQuery, ...options }),
      {
        auth: false,
        cache: 'no-store',
      },
    ),
  createSellerProfile: (input: CreateSellerProfileInput) =>
    apiFetch<CreateSellerProfileResponse>('/identity/seller-profiles', {
      method: 'POST',
      body: JSON.stringify(input),
      auth: true,
    }),
}

export type {
  SellerProfilePayload,
  UpdateSellerProfileInput,
  UpdateSellerProfileResponse,
  CreateSellerProfileInput,
  CreateSellerProfileResponse,
  MomentApiItem,
  MoodboardApiMediaItem,
  MoodboardApiItem,
  CommentApiItem,
  CreateMomentCommentInput,
  LikeStatusResponse,
  CreateMomentInput,
  CreateMoodboardInput,
  SearchSellerProfilesResponse,
}

export default profileApis
