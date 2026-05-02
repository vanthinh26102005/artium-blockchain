export interface User {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
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
