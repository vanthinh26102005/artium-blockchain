export type InventoryArtist = {
  id: string
  name: string
  avatarUrl?: string
  artworkCount: number
  artworkThumbnails: string[] // Array of artwork thumbnail URLs
  isVerified?: boolean
  profileHref: string
  followedAt?: string | null
  location?: string
  bio?: string
  isMutual?: boolean
}
