export type InventoryArtworkStatus = 'Draft' | 'Hidden'

export type InventoryArtwork = {
  id: string
  title: string
  creatorName: string
  status: InventoryArtworkStatus
  backendStatus?: string
  createdAt?: string
  updatedAt?: string
  price?: number
  thumbnailUrl: string
  folderId?: string
}
