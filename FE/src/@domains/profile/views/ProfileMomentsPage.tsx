// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ProfileMomentsMasonry } from '@domains/profile/components/ProfileMomentsMasonry'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import {
  ProfileHeroSkeleton,
  ProfileMomentsSectionSkeleton,
  ProfileTabsSkeleton,
} from '@domains/profile/components/ProfileSkeletons'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import { mapProfileMomentToMomentCard } from '@domains/profile/utils/profileApiMapper'

type ProfileMomentsPageViewProps = {
  username?: string | string[]
}

/**
 * ProfileMomentsPageView - React component
 * @returns React element
 */
export const ProfileMomentsPageView = ({ username: _username }: ProfileMomentsPageViewProps) => {
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, user: fetchedUser, isOwner, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
/**
 * usernameFromRoute - Custom React hook
 * @returns void
 */
  })
  const profileData = useProfileDraftData(baseData)
  const profileHandle = resolvedUsername || profileData?.user.username || usernameFromRoute || ''
  const canRenderProfile = !isLoading && !error && Boolean(profileData)
  const pageTitle = profileData
    ? `${profileData.user.displayName} (@${resolvedUsername}) | Moments`
    : 'Profile Moments | Artium'
/**
 * profileData - Utility function
 * @returns void
 */
  const baseHref = profileHandle ? `/profile/${encodeURIComponent(profileHandle)}` : ''
  const tabHrefs = profileHandle
    ? {
        overview: baseHref,
/**
 * profileHandle - Utility function
 * @returns void
 */
        artworks: `${baseHref}/artworks`,
        moments: `${baseHref}/moments`,
        moodboards: `${baseHref}/moodboards`,
      }
/**
 * canRenderProfile - Utility function
 * @returns void
 */
    : undefined
  const useProfileBaseHref = Boolean(profileData?.moments.length && profileHandle)
  const moments = profileData
    ? profileData.moments.map((moment) => mapProfileMomentToMomentCard(moment, profileData.user))
/**
 * pageTitle - Utility function
 * @returns void
 */
    : []

  return (
    <>
      <Metadata title={pageTitle} />
      <div className="space-y-4">
/**
 * baseHref - Utility function
 * @returns void
 */
        <div className="container">
          {isLoading ? (
            <ProfileHeroSkeleton />
          ) : error || !profileData ? (
/**
 * tabHrefs - Utility function
 * @returns void
 */
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error ?? 'Profile not found.'}
            </div>
          ) : (
            <ProfileHero
              user={profileData.user}
              stats={profileData.stats}
              userId={fetchedUser?.id}
              isOwner={isOwner}
            />
          )}
/**
 * useProfileBaseHref - Custom React hook
 * @returns void
 */
        </div>
        {isLoading ? (
          <div className="container">
            <ProfileTabsSkeleton />
/**
 * moments - Utility function
 * @returns void
 */
          </div>
        ) : canRenderProfile && profileData ? (
          <div className="container">
            <ProfileTabs tabs={PROFILE_TABS} activeTab="moments" tabHrefs={tabHrefs} />
          </div>
        ) : null}
        {isLoading ? (
          <div className="container py-6">
            <ProfileMomentsSectionSkeleton count={8} layout="masonry" />
          </div>
        ) : canRenderProfile ? (
          <div className="container py-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
                  Moments
                </h2>
                <p className="text-sm text-slate-500">All moments by this artist</p>
              </div>
            </div>
            <ProfileMomentsMasonry
              moments={moments}
              hrefBase={useProfileBaseHref ? `${baseHref}/moments` : undefined}
            />
          </div>
        ) : null}
      </div>
    </>
  )
}
