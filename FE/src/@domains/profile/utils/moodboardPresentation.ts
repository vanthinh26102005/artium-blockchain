import type { MoodboardApiItem, MoodboardApiMediaItem } from '@shared/apis/profileApis'

export const DEFAULT_MOODBOARD_COVER = '/images/placeholder-artwork.jpg'

export const resolveMoodboardMediaDisplayUrl = (
  media?: MoodboardApiMediaItem | null,
) => {
  if (!media) return undefined
  return media.thumbnailUrl || media.secureUrl || media.url || undefined
}

export const resolveMoodboardCoverUrl = (
  moodboard: MoodboardApiItem,
  fallback = DEFAULT_MOODBOARD_COVER,
) => {
  const media = moodboard.media ?? []
  const coverMedia = media.find((item) => item.isCover) ?? media[0]

  return (
    moodboard.coverImageUrl ||
    resolveMoodboardMediaDisplayUrl(coverMedia) ||
    fallback
  )
}
