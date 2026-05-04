export interface User {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  walletAddress?: string | null
}

export interface Artwork {
  id: string
  title: string
  artistName: string
  priceLabel: string
  coverUrl: string
  likesCount: number
  isSold?: boolean
  medium?: string
  dimensions?: string
}
