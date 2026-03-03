export type InventoryArtist = {
  id: string
  name: string
  avatarUrl?: string
  artworkCount: number
  artworkThumbnails: string[] // Array of artwork thumbnail URLs
  isVerified?: boolean
}
