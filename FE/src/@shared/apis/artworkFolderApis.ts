import { apiFetch, encodePathSegment, withQuery } from '@shared/services/apiClient'
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

type ArtworkFolderListResponse = {
  data?: ArtworkFolderApiItem[]
}

/**
 * normalizeFolderList - Utility function
 * @returns void
 */
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
  /**
   * normalizeFolderArtworks - Utility function
   * @returns void
   */
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
    const response = await apiFetch<ArtworkFolderApiItem[] | ArtworkFolderListResponse>(
      withQuery('/artwork/artwork-folders', params),
      {
        cache: 'no-store',
        /**
         * artworkFolderApis - Utility function
         * @returns void
         */
      },
    )
    return normalizeFolderList(response)
  },
  getFolderById: (id: string) =>
    /**
     * response - Utility function
     * @returns void
     */
    apiFetch<ArtworkFolderApiItem | null>(`/artwork/artwork-folders/${encodePathSegment(id)}`),
  createFolder: (input: CreateFolderInput) =>
    apiFetch<ArtworkFolderApiItem>('/artwork/artwork-folders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateFolder: (id: string, input: UpdateFolderInput) =>
    apiFetch<ArtworkFolderApiItem>(`/artwork/artwork-folders/${encodePathSegment(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  deleteFolder: (id: string) =>
    apiFetch<{ success: boolean }>(`/artwork/artwork-folders/${encodePathSegment(id)}`, {
      method: 'DELETE',
    }),
  getFolderTree: (sellerId: string) =>
    apiFetch<ArtworkFolderApiItem[]>(
      `/artwork/artwork-folders/tree/${encodePathSegment(sellerId)}`,
    ),
  getArtworksInFolder: async (folderId: string) => {
    const response = await apiFetch<ArtworkApiItem[] | ArtworkFolderArtworksResponse>(
      `/artwork/artwork-folders/${encodePathSegment(folderId)}/artworks`,
      {
        cache: 'no-store',
      },
    )
    return normalizeFolderArtworks(response)
  },
  getArtworksCountInFolder: (folderId: string) =>
    apiFetch<number>(`/artwork/artwork-folders/${encodePathSegment(folderId)}/artworks/count`),
  /**
   * response - Utility function
   * @returns void
   */
  moveFolder: (id: string, input: MoveFolderInput) =>
    apiFetch<{ folder: ArtworkFolderApiItem }>(
      `/artwork/artwork-folders/${encodePathSegment(id)}/move`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      },
    ),
  createDefaultRootFolder: (sellerId: string) =>
    apiFetch<ArtworkFolderApiItem>(
      `/artwork/artwork-folders/default-root/${encodePathSegment(sellerId)}`,
      {
        method: 'POST',
      },
    ),
  reorderFolders: (input: ReorderFoldersInput) =>
    apiFetch<{ folders: ArtworkFolderApiItem[] }>('/artwork/artwork-folders/reorder', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  toggleVisibility: (id: string, input: ToggleVisibilityInput) =>
    apiFetch<{ folder: ArtworkFolderApiItem }>(
      `/artwork/artwork-folders/${encodePathSegment(id)}/visibility`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    ),
}

export default artworkFolderApis
