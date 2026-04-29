import type { SellerProfilePayload } from '@shared/apis/profileApis'
import type { UserPayload } from '@shared/types/auth'

const cleanText = (value?: string | null) => {
  const text = value?.trim()
  return text || null
}

const getEmailName = (email?: string | null) => cleanText(email?.split('@')[0])

export const resolveUploadCreatorName = (
  user?: UserPayload | null,
  sellerProfile?: SellerProfilePayload | null,
) =>
  cleanText(sellerProfile?.displayName) ??
  cleanText(user?.fullName) ??
  cleanText(user?.displayName) ??
  getEmailName(user?.email)

export const resolveUploadArtistName = (
  user?: UserPayload | null,
  sellerProfile?: SellerProfilePayload | null,
) => resolveUploadCreatorName(user, sellerProfile) ?? 'Signed-in artist'

export const resolveUploadArtistAvatarUrl = (
  user?: UserPayload | null,
  sellerProfile?: SellerProfilePayload | null,
) => cleanText(sellerProfile?.profileImageUrl) ?? cleanText(user?.avatarUrl)

export const getUploadArtistInitials = (artistName: string) => {
  const words = artistName
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)

  if (words.length === 0) {
    return 'A'
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}
