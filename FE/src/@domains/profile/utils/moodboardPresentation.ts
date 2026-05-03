import type { MoodboardApiItem, MoodboardApiMediaItem } from '@shared/apis/profileApis'

/**
 * DEFAULT_MOODBOARD_COVER - React component
 * @returns React element
 */
export const DEFAULT_MOODBOARD_COVER = '/images/placeholder-artwork.jpg'

export const resolveMoodboardMediaDisplayUrl = (media?: MoodboardApiMediaItem | null) => {
  /**
   * resolveMoodboardMediaDisplayUrl - Utility function
   * @returns void
   */
  if (!media) return undefined
  return media.thumbnailUrl || media.secureUrl || media.url || undefined
}

export const resolveMoodboardCoverUrl = (
  moodboard: MoodboardApiItem,
  fallback = DEFAULT_MOODBOARD_COVER,
) => {
  const media = moodboard.media ?? []
  const coverMedia = media.find((item) => item.isCover) ?? media[0]
  /**
   * resolveMoodboardCoverUrl - Utility function
   * @returns void
   */

  return moodboard.coverImageUrl || resolveMoodboardMediaDisplayUrl(coverMedia) || fallback
}
/**
 * media - Utility function
 * @returns void
 */

/**
 * coverMedia - Utility function
 * @returns void
 */
