// react
import { useMemo, useState } from 'react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { MoodboardDeviceUploadComposer } from '@domains/profile/components/MoodboardDeviceUploadComposer'
import { MoodboardsSection } from '@domains/profile/components/MoodboardsSection'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import {
  ProfileHeroSkeleton,
  ProfileMoodboardsSectionSkeleton,
  ProfileTabsSkeleton,
} from '@domains/profile/components/ProfileSkeletons'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import profileApis from '@shared/apis/profileApis'
import type { CreateMoodboardInput } from '@shared/apis/profileApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import type { ProfileMoodboard } from '@domains/profile/types'
import { mapMoodboardToProfileMoodboard } from '@domains/profile/utils/profileApiMapper'

type ProfileMoodboardsPageViewProps = {
  username?: string | string[]
}

/**
 * ProfileMoodboardsPageView - React component
 * @returns React element
 */
export const ProfileMoodboardsPageView = ({
  username: _username,
}: ProfileMoodboardsPageViewProps) => {
  const [isMoodboardDialogOpen, setIsMoodboardDialogOpen] = useState(false)
  const [moodboardSubmitting, setMoodboardSubmitting] = useState(false)
  const [moodboardError, setMoodboardError] = useState<string | null>(null)
  const [moodboardSuccess, setMoodboardSuccess] = useState<string | null>(null)
  const [createdMoodboards, setCreatedMoodboards] = useState<ProfileMoodboard[]>([])
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, user: fetchedUser, isOwner, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
/**
 * usernameFromRoute - Custom React hook
 * @returns void
 */
  })
  const profileData = useProfileDraftData(baseData)
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)
  const profileHandle = resolvedUsername || profileData?.user.username || usernameFromRoute || ''
  const canRenderProfile = !isLoading && !error && Boolean(profileData)
  const moodboards = useMemo(
/**
 * profileData - Utility function
 * @returns void
 */
    () => [...createdMoodboards, ...(profileData?.moodboards ?? [])],
    [createdMoodboards, profileData?.moodboards],
  )
  const pageTitle = profileData
/**
 * authUser - Utility function
 * @returns void
 */
    ? `${profileData.user.displayName} (@${resolvedUsername}) | Moodboards`
    : 'Profile Moodboards | Artium'
  const baseHref = profileHandle ? `/profile/${encodeURIComponent(profileHandle)}` : ''
  const tabHrefs = profileHandle
/**
 * isAuthenticated - Utility function
 * @returns void
 */
    ? {
        overview: baseHref,
        artworks: `${baseHref}/artworks`,
        moments: `${baseHref}/moments`,
/**
 * profileHandle - Utility function
 * @returns void
 */
        moodboards: `${baseHref}/moodboards`,
      }
    : undefined

/**
 * canRenderProfile - Utility function
 * @returns void
 */
  const handleCreateMoodboard = async (input: CreateMoodboardInput) => {
    if (!isAuthenticated || moodboardSubmitting || !profileData) return

    setMoodboardSubmitting(true)
/**
 * moodboards - Utility function
 * @returns void
 */
    setMoodboardError(null)
    setMoodboardSuccess(null)

    try {
      const created = await profileApis.createMoodboard(input)
      setCreatedMoodboards((prev) => [
        mapMoodboardToProfileMoodboard(created, profileData.user),
/**
 * pageTitle - Utility function
 * @returns void
 */
        ...prev,
      ])
      setMoodboardSuccess('Moodboard created.')
      setIsMoodboardDialogOpen(false)
    } catch (err) {
      setMoodboardError(err instanceof Error ? err.message : 'Failed to create moodboard.')
/**
 * baseHref - Utility function
 * @returns void
 */
    } finally {
      setMoodboardSubmitting(false)
    }
  }
/**
 * tabHrefs - Utility function
 * @returns void
 */

  return (
    <>
      <Metadata title={pageTitle} />
      <div className="space-y-4">
        <div className="container">
          {isLoading ? (
            <ProfileHeroSkeleton />
          ) : error || !profileData ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error ?? 'Profile not found.'}
            </div>
/**
 * handleCreateMoodboard - Utility function
 * @returns void
 */
          ) : (
            <ProfileHero
              user={profileData.user}
              stats={profileData.stats}
              userId={fetchedUser?.id}
              isOwner={isOwner}
            />
          )}
        </div>
        {isLoading ? (
          <div className="container">
/**
 * created - Utility function
 * @returns void
 */
            <ProfileTabsSkeleton />
          </div>
        ) : canRenderProfile && profileData ? (
          <div className="container">
            <ProfileTabs tabs={PROFILE_TABS} activeTab="moodboards" tabHrefs={tabHrefs} />
          </div>
        ) : null}
        {isLoading ? (
          <div className="container py-6">
            <ProfileMoodboardsSectionSkeleton count={8} size="large" />
          </div>
        ) : canRenderProfile && profileData ? (
          <div className="container py-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
                  Moodboards
                </h2>
                <p className="text-sm text-slate-500">All moodboards by this artist</p>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => {
                    setMoodboardError(null)
                    setMoodboardSuccess(null)
                    setIsMoodboardDialogOpen(true)
                  }}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400"
                >
                  Create moodboard
                </button>
              ) : null}
            </div>
            {moodboardSuccess ? (
              <p className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {moodboardSuccess}
              </p>
            ) : null}
            <MoodboardsSection
              moodboards={moodboards}
              showSeeAll={false}
              title=""
              subtitle=""
              size="large"
              detailBaseHref={profileHandle ? `${baseHref}/moodboards` : undefined}
              isOwner={isOwner}
            />
          </div>
        ) : null}
      </div>
      {isMoodboardDialogOpen ? (
        <MoodboardDeviceUploadComposer
          open={isMoodboardDialogOpen}
          submitting={moodboardSubmitting}
          errorMessage={moodboardError}
          onOpenChange={(open) => {
            setIsMoodboardDialogOpen(open)
            if (!open) {
              setMoodboardSubmitting(false)
              setMoodboardError(null)
            }
          }}
          onCreate={handleCreateMoodboard}
        />
      ) : null}
    </>
  )
}
