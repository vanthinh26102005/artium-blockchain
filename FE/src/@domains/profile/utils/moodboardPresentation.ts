import type { MoodboardApiItem, MoodboardApiMediaItem } from '@shared/apis/profileApis'

export const DEFAULT_MOODBOARD_COVER = '/images/placeholder-artwork.jpg'

const INVALID_IMAGE_SRC_VALUES = new Set(['undefined', 'null', ''])

const normalizeImageSrc = (value?: string | null) => {
  const src = value?.trim() ?? ''
  return INVALID_IMAGE_SRC_VALUES.has(src.toLowerCase()) ? undefined : src
}

export const resolveMoodboardMediaDisplayUrl = (
  media?: MoodboardApiMediaItem | null,
) => {
  if (!media) return undefined
  return normalizeImageSrc(media.thumbnailUrl) || normalizeImageSrc(media.secureUrl) || normalizeImageSrc(media.url)
}

export const resolveMoodboardCoverUrl = (
  moodboard: MoodboardApiItem,
  fallback = DEFAULT_MOODBOARD_COVER,
) => {
  const media = moodboard.media ?? []
  const coverMedia = media.find((item) => item.isCover) ?? media[0]

  return (
    normalizeImageSrc(moodboard.coverImageUrl) ||
    resolveMoodboardMediaDisplayUrl(coverMedia) ||
    fallback
  )
}
