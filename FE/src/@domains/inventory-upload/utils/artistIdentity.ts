import type { SellerProfilePayload } from '@shared/apis/profileApis'
import type { UserPayload } from '@shared/types/auth'

/**
 * cleanText - Utility function
 * @returns void
 */
const cleanText = (value?: string | null) => {
  const text = value?.trim()
  return text || null
}
/**
 * text - Utility function
 * @returns void
 */

const getEmailName = (email?: string | null) => cleanText(email?.split('@')[0])

export const resolveUploadCreatorName = (
  user?: UserPayload | null,
  sellerProfile?: SellerProfilePayload | null,
) =>
/**
 * getEmailName - Utility function
 * @returns void
 */
  cleanText(sellerProfile?.displayName) ??
  cleanText(user?.fullName) ??
  cleanText(user?.displayName) ??
  getEmailName(user?.email)

/**
 * resolveUploadCreatorName - Utility function
 * @returns void
 */
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
/**
 * resolveUploadArtistName - Utility function
 * @returns void
 */
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)

  if (words.length === 0) {
    return 'A'
  }

/**
 * resolveUploadArtistAvatarUrl - Utility function
 * @returns void
 */
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

/**
 * getUploadArtistInitials - Utility function
 * @returns void
 */
/**
 * words - Utility function
 * @returns void
 */