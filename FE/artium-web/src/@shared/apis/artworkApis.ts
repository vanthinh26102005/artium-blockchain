import {
  apiFetch,
  encodePathSegment,
  withQuery,
} from '@shared/services/apiClient'
import type { SellerAuctionStartStatusResponse } from '@shared/apis/auctionApis'

type ArtworkImage = {
  url?: string
  secureUrl?: string
}

type ArtworkFolderRef = {
  id: string
}

export type ArtworkApiItem = {
  id: string
  sellerId: string
  title: string
  description?: string | null
  creatorName?: string | null
  displayStatus?: 'Draft' | 'Hidden'
  status?: string
  creationYear?: number | null
  editionRun?: string | null
  materials?: string | null
  location?: string | null
  price?: number | string | null
  currency?: string | null
  quantity?: number
  isPublished?: boolean
  createdAt?: string
  updatedAt?: string
  dimensions?: {
    width?: number
    height?: number
    depth?: number
    unit?: string
  } | null
  weight?: {
    value?: number
    unit?: string
  } | null
  thumbnailUrl?: string | null
  images?: ArtworkImage[]
  folder?: ArtworkFolderRef | null
  folderId?: string | null
  viewCount?: number
  likeCount?: number
  commentCount?: number
  moodboardCount?: number
  auctionLifecycle?: SellerAuctionStartStatusResponse | null
}

export type ListArtworksParams = {
  sellerId?: string
  folderId?: string | null
  status?: string
  q?: string
  skip?: number
  take?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
  includeSellerAuctionLifecycle?: boolean
}

export type CreateArtworkInput = {
  sellerId: string
  title: string
  creatorName?: string | null
  description?: string
  creationYear?: number
  editionRun?: string
  materials?: string
  location?: string
  price?: string
  currency?: string
  quantity?: number
  status?: string
  isPublished?: boolean
  folderId?: string | null
  tagIds?: string[]
}

export type UpdateArtworkInput = Partial<CreateArtworkInput>

type BulkMoveInput = {
  artworkIds: string[]
  folderId?: string | null
  sellerId: string
}

type ArtworkPagination = {
  total: number
  skip: number
  take: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

type ArtworkListResponse = {
  data?: ArtworkApiItem[]
  pagination?: ArtworkPagination
}

const normalizeArtworkList = (
  response: ArtworkApiItem[] | ArtworkListResponse,
): ArtworkApiItem[] => {
  if (Array.isArray(response)) {
    return response
  }

  if (response?.data && Array.isArray(response.data)) {
    return response.data
  }

  return []
}

const normalizeArtworkPage = (
  response: ArtworkApiItem[] | ArtworkListResponse,
): { data: ArtworkApiItem[]; pagination: ArtworkPagination } => {
  if (!Array.isArray(response) && response?.data && response.pagination) {
    return {
      data: response.data,
      pagination: response.pagination,
    }
  }

  const data = normalizeArtworkList(response)
  const take = data.length
  return {
    data,
    pagination: {
      total: take,
      skip: 0,
      take,
      totalPages: take > 0 ? 1 : 0,
      currentPage: take > 0 ? 1 : 0,
      hasNext: false,
      hasPrev: false,
    },
  }
}

const artworkApis = {
  listArtworks: async (params?: ListArtworksParams) => {
    const response = await apiFetch<ArtworkApiItem[] | ArtworkListResponse>(
      withQuery('/artwork', params),
      {
        cache: 'no-store',
      },
    )
    return normalizeArtworkList(response)
  },
  listArtworksPaginated: async (params?: ListArtworksParams) => {
    const response = await apiFetch<ArtworkApiItem[] | ArtworkListResponse>(
      withQuery('/artwork', params),
      {
        cache: 'no-store',
      },
    )
    return normalizeArtworkPage(response)
  },
  getArtworkById: (id: string) =>
    apiFetch<ArtworkApiItem | null>(`/artwork/${encodePathSegment(id)}`),
  createArtwork: (input: CreateArtworkInput) =>
    apiFetch<ArtworkApiItem>('/artwork', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateArtwork: (id: string, input: UpdateArtworkInput) =>
    apiFetch<ArtworkApiItem>(`/artwork/${encodePathSegment(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  deleteArtwork: (id: string) =>
    apiFetch<{ success: boolean }>(`/artwork/${encodePathSegment(id)}`, {
      method: 'DELETE',
    }),
  addImagesToArtwork: (
    id: string,
    images: Array<{
      publicId: string
      secureUrl: string
      url?: string
      format?: string
      size?: number
      width?: number
      height?: number
      isPrimary?: boolean
    }>,
  ) =>
    apiFetch<ArtworkApiItem>(`/artwork/${encodePathSegment(id)}/images`, {
      method: 'POST',
      body: JSON.stringify({ images }),
    }),
  bulkMoveArtworks: (input: BulkMoveInput) =>
    apiFetch<{ movedCount: number }>('/artwork/bulk/move', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}

export default artworkApis
