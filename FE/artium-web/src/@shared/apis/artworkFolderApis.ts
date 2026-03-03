import { apiFetch } from '@shared/services/apiClient'
import type { ArtworkApiItem } from '@shared/apis/artworkApis'

export type ArtworkFolderApiItem = {
  id: string
  sellerId?: string
  name: string
  position?: number
  isHidden?: boolean
  parentId?: string | null
  children?: ArtworkFolderApiItem[]
  itemCount?: number
}

export type ListFoldersParams = {
  sellerId?: string
  parentId?: string
  includeCounts?: boolean
}

export type CreateFolderInput = {
  sellerId: string
  name: string
  parentId?: string
}

export type UpdateFolderInput = {
  name?: string
  parentId?: string
}

export type ToggleVisibilityInput = {
  sellerId: string
  isHidden: boolean
}

export type MoveFolderInput = {
  folderId: string
  newParentId?: string | null
}

export type ReorderFoldersInput = {
  sellerId: string
  folderIds: string[]
}

const ARTWORK_BASE_URL = (
  process.env.NEXT_PUBLIC_ARTWORK_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/$/, '')

const normalizeBaseForFolders = () => {
  if (ARTWORK_BASE_URL === '') {
    return ''
  }
  if (ARTWORK_BASE_URL.toLowerCase().endsWith('/artworks')) {
    return ARTWORK_BASE_URL.slice(0, -'/artworks'.length)
  }
  if (ARTWORK_BASE_URL.toLowerCase().endsWith('/artwork')) {
    return ARTWORK_BASE_URL.slice(0, -'/artwork'.length)
  }
  return ARTWORK_BASE_URL
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
  return apiFetch<T>(path, { ...options, baseUrl: normalizeBaseForFolders() })
}

type ArtworkFolderListResponse = {
  data?: ArtworkFolderApiItem[]
}

const normalizeFolderList = (
  response: ArtworkFolderApiItem[] | ArtworkFolderListResponse,
): ArtworkFolderApiItem[] => {
  if (Array.isArray(response)) {
    return response
  }

  if (response?.data && Array.isArray(response.data)) {
    return response.data
  }

  return []
}

type ArtworkFolderArtworksResponse = {
  data?: ArtworkApiItem[]
}

const normalizeFolderArtworks = (
  response: ArtworkApiItem[] | ArtworkFolderArtworksResponse,
): ArtworkApiItem[] => {
  if (Array.isArray(response)) {
    return response
  }

  if (response?.data && Array.isArray(response.data)) {
    return response.data
  }

  return []
}

const artworkFolderApis = {
  listFolders: async (params?: ListFoldersParams) => {
    const response = await apiWithBase<ArtworkFolderApiItem[] | ArtworkFolderListResponse>(
      `artwork/artwork-folders${buildQuery(params)}`,
      {
        cache: 'no-store',
      },
    )
    return normalizeFolderList(response)
  },
  getFolderById: (id: string) => apiWithBase<ArtworkFolderApiItem | null>(`artwork/artwork-folders/${id}`),
  createFolder: (input: CreateFolderInput) =>
    apiWithBase<ArtworkFolderApiItem>('artwork/artwork-folders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateFolder: (id: string, input: UpdateFolderInput) =>
    apiWithBase<ArtworkFolderApiItem>(`artwork/artwork-folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  deleteFolder: (id: string) =>
    apiWithBase<{ success: boolean }>(`artwork/artwork-folders/${id}`, {
      method: 'DELETE',
    }),
  getFolderTree: (sellerId: string) =>
    apiWithBase<ArtworkFolderApiItem[]>(`artwork/artwork-folders/tree/${sellerId}`),
  getArtworksInFolder: async (folderId: string) => {
    const response = await apiWithBase<ArtworkApiItem[] | ArtworkFolderArtworksResponse>(
      `artwork/artwork-folders/${folderId}/artworks`,
      {
        cache: 'no-store',
      },
    )
    return normalizeFolderArtworks(response)
  },
  getArtworksCountInFolder: (folderId: string) =>
    apiWithBase<number>(`artwork/artwork-folders/${folderId}/artworks/count`),
  moveFolder: (id: string, input: MoveFolderInput) =>
    apiWithBase<{ folder: ArtworkFolderApiItem }>(`artwork/artwork-folders/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  createDefaultRootFolder: (sellerId: string) =>
    apiWithBase<ArtworkFolderApiItem>(`artwork/artwork-folders/default-root/${sellerId}`, {
      method: 'POST',
    }),
  reorderFolders: (input: ReorderFoldersInput) =>
    apiWithBase<{ folders: ArtworkFolderApiItem[] }>(`artwork/artwork-folders/reorder`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  toggleVisibility: (id: string, input: ToggleVisibilityInput) =>
    apiWithBase<{ folder: ArtworkFolderApiItem }>(`artwork/artwork-folders/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
}

export default artworkFolderApis
