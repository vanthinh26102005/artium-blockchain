// next
import Image from 'next/image'

// third-party
import { MoreHorizontal } from 'lucide-react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ProfileArtworkCard } from '@domains/profile/components/ProfileArtworkCard'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import profileApis from '@shared/apis/profileApis'
import { mapMoodboardToProfileMoodboard } from '@domains/profile/utils/profileApiMapper'
import { useEffect, useState } from 'react'
import type { ProfileMoodboard, ProfileMoodboardMedia } from '@domains/profile/types'

type ProfileMoodboardDetailPageViewProps = {
  username?: string | string[]
  moodboardId?: string | string[]
}

export const ProfileMoodboardDetailPageView = ({
  username: _username,
  moodboardId: _moodboardId,
}: ProfileMoodboardDetailPageViewProps) => {
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const moodboardIdFromRoute = Array.isArray(_moodboardId) ? _moodboardId[0] : _moodboardId
  const { data: baseData, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileData = useProfileDraftData(baseData)
  const [selectedMoodboard, setSelectedMoodboard] = useState<ProfileMoodboard | null>(null)

  useEffect(() => {
    let isActive = true

    const resolveMoodboard = async () => {
      if (!profileData) {
        setSelectedMoodboard(null)
        return
      }

      if (!moodboardIdFromRoute) {
        setSelectedMoodboard(profileData.moodboards[0] ?? null)
        return
      }

      const existing =
        profileData.moodboards.find((board) => board.id === moodboardIdFromRoute) ?? null
      if (existing) {
        setSelectedMoodboard(existing)
        return
      }

      try {
        const moodboard = await profileApis.getMoodboard(moodboardIdFromRoute)
        if (!isActive) return
        if (moodboard) {
          setSelectedMoodboard(mapMoodboardToProfileMoodboard(moodboard, profileData.user))
          return
        }
        setSelectedMoodboard(null)
      } catch {
        if (!isActive) return
        setSelectedMoodboard(null)
      }
    }

    void resolveMoodboard()

    return () => {
      isActive = false
    }
  }, [moodboardIdFromRoute, profileData])

  const moodboard = selectedMoodboard
  const orderedMediaItems = (moodboard?.mediaItems ?? [])
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
  const coverMedia = orderedMediaItems.find((media) => media.isCover) ?? orderedMediaItems[0]
  const relatedArtworks = profileData?.artworks.slice(0, 8) ?? []
  const pageTitle = profileData
    ? `${moodboard?.title || 'Moodboard'} | ${profileData.user.displayName}`
    : 'Moodboard | Artium'

  return (
    <>
      <Metadata title={pageTitle} />
      <div className="min-h-screen bg-white">
        <div className="container py-10">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading moodboard...
            </div>
          ) : error || !profileData ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error ?? 'Profile not found.'}
            </div>
          ) : null}
          {profileData ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  className="absolute top-0 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                    Moodboard
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    {moodboard?.title || 'Moodboard'}
                  </h1>
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-600">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200">
                      <Image
                        src={moodboard?.authorAvatarUrl || profileData.user.avatarUrl}
                        alt={moodboard?.author || profileData.user.displayName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-slate-800">
                      {moodboard?.author || profileData.user.displayName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">@{resolvedUsername}</p>
                </div>
              </div>

              <div className="mt-10 space-y-10">
                {orderedMediaItems.length > 0 ? (
                  <section aria-label="Uploaded moodboard media" className="space-y-6">
                    {coverMedia ? (
                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
                          <p className="text-sm font-semibold text-slate-900">Cover</p>
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                            Uploaded moodboard media
                          </span>
                        </div>
                        <MoodboardMediaFrame media={coverMedia} priority />
                      </div>
                    ) : null}

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {orderedMediaItems.map((media) => (
                        <div
                          key={media.id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <div className="relative">
                            <MoodboardMediaFrame media={media} />
                            {media.isCover ? (
                              <span className="absolute top-3 left-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                                Cover
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                    This moodboard does not have uploaded media available yet.
                  </div>
                )}

                {relatedArtworks.length > 0 ? (
                  <section className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Related artworks</h2>
                      <p className="text-sm text-slate-500">
                        Existing profile artwork references, shown separately from uploaded moodboard media.
                      </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {relatedArtworks.map((artwork) => (
                        <ProfileArtworkCard
                          key={artwork.id}
                          artwork={artwork}
                          artist={profileData.user}
                          showPrice={false}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

type MoodboardMediaFrameProps = {
  media: ProfileMoodboardMedia
  priority?: boolean
}

const resolveMediaUrl = (media: ProfileMoodboardMedia) =>
  media.secureUrl || media.url || media.displayUrl

const MoodboardMediaFrame = ({ media, priority = false }: MoodboardMediaFrameProps) => {
  const mediaUrl = resolveMediaUrl(media)
  const poster = media.thumbnailUrl || undefined
  const heightClass = priority ? 'h-[420px]' : 'h-72'

  if (!mediaUrl) {
    return (
      <div className={`${heightClass} flex items-center justify-center bg-slate-100 text-sm text-slate-400`}>
        Media unavailable
      </div>
    )
  }

  if (media.mediaType === 'video') {
    return (
      <video
        src={mediaUrl}
        poster={poster}
        controls
        className={`${heightClass} w-full bg-slate-950 object-contain`}
      />
    )
  }

  return (
    <div className={`relative ${heightClass} bg-slate-100`}>
      <Image
        src={media.displayUrl}
        alt="Moodboard uploaded media"
        fill
        priority={priority}
        sizes={priority ? 'min(100vw, 1120px)' : '(min-width: 1024px) 33vw, 50vw'}
        className="object-cover"
      />
    </div>
  )
}
