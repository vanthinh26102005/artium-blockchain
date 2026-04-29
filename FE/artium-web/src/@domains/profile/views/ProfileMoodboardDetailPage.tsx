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
import type { ProfileMoodboard } from '@domains/profile/types'

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
  const artworks = profileData?.artworks.slice(0, 8) ?? []
  const featuringArtist = artworks[0]?.artistName
  const featuringSuffix = artworks.length > 1 ? ' and 1 other' : ''
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
                  {featuringArtist ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Featuring {featuringArtist}
                      {featuringSuffix}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-400">@{resolvedUsername}</p>
                </div>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {artworks.map((artwork) => (
                  <ProfileArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    artist={profileData.user}
                    showPrice={false}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}
