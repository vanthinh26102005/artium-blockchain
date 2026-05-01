import { apiFetch } from '@shared/services/apiClient'

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
  ipfsMetadataHash?: string | null
  reservePrice?: string | null
  minBidIncrement?: string | null
  auctionDuration?: number | null
  onChainAuctionId?: string | null
}

export type ListArtworksParams = {
  sellerId?: string
  folderId?: string | null
  status?: string
  onChainAuctionId?: string
  hasOnChainAuctionId?: boolean
  q?: string
  skip?: number
  take?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
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

const ARTWORK_BASE_URL = (
  process.env.NEXT_PUBLIC_ARTWORK_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/$/, '')

const normalizeArtworkPath = (path: string) => {
  const base = ARTWORK_BASE_URL.toLowerCase()
  if (base.endsWith('/artworks') || base.endsWith('/artwork')) {
    return path.replace(/^\/artworks?/, '')
  }
  return path
}

const buildQuery = (params?: Record<string, string | number | boolean | null | undefined>) => {
  if (!params) {
    return ''
  }

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  )

  if (entries.length === 0) {
    return ''
  }

  const query = new URLSearchParams(entries.map(([key, value]) => [key, String(value)]))
  return `?${query.toString()}`
}

const apiWithBase = async <T>(path: string, options?: Parameters<typeof apiFetch<T>>[1]) => {
  return apiFetch<T>(normalizeArtworkPath(path), { ...options, baseUrl: ARTWORK_BASE_URL })
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
    const response = await apiWithBase<ArtworkApiItem[] | ArtworkListResponse>(
      `/artworks${buildQuery(params)}`,
      {
        cache: 'no-store',
      },
    )
    return normalizeArtworkList(response)
  },
  listArtworksPaginated: async (params?: ListArtworksParams) => {
    const response = await apiWithBase<ArtworkApiItem[] | ArtworkListResponse>(
      `/artworks${buildQuery(params)}`,
      {
        cache: 'no-store',
      },
    )
    return normalizeArtworkPage(response)
  },
  getArtworkById: (id: string) => apiWithBase<ArtworkApiItem | null>(`/artworks/${id}`),
  getArtworkByOnChainAuctionId: async (onChainAuctionId: string) => {
    const artworks = await artworkApis.listArtworks({
      onChainAuctionId,
      take: 1,
    })
    return artworks[0] ?? null
  },
  createArtwork: (input: CreateArtworkInput) =>
    apiWithBase<ArtworkApiItem>('/artworks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateArtwork: (id: string, input: UpdateArtworkInput) =>
    apiWithBase<ArtworkApiItem>(`/artworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  deleteArtwork: (id: string) =>
    apiWithBase<{ success: boolean }>(`/artworks/${id}`, {
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
    apiWithBase<ArtworkApiItem>(`/artworks/${id}/images`, {
      method: 'POST',
      body: JSON.stringify({ images }),
    }),
  bulkMoveArtworks: (input: BulkMoveInput) =>
    apiWithBase<{ movedCount: number }>(`/artworks/bulk/move`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}

export default artworkApis
