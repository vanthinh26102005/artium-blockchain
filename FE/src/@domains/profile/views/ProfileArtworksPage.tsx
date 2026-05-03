// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ProfileArtworkCard } from '@domains/profile/components/ProfileArtworkCard'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import {
  ProfileArtworksSectionSkeleton,
  ProfileHeroSkeleton,
  ProfileTabsSkeleton,
} from '@domains/profile/components/ProfileSkeletons'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'

type ProfileArtworksPageViewProps = {
  username?: string | string[]
}

/**
 * ProfileArtworksPageView - React component
 * @returns React element
 */
export const ProfileArtworksPageView = ({ username: _username }: ProfileArtworksPageViewProps) => {
  // -- derived --
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
    ? `${profileData.user.displayName} (@${resolvedUsername}) | Artworks`
    : 'Profile Artworks | Artium'
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

  // -- render --
  return (
/**
 * pageTitle - Utility function
 * @returns void
 */
    <>
      <Metadata title={pageTitle} />
      <div className="space-y-4">
        <div className="container">
          {isLoading ? (
            <ProfileHeroSkeleton />
/**
 * baseHref - Utility function
 * @returns void
 */
          ) : error || !profileData ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error ?? 'Profile not found.'}
            </div>
/**
 * tabHrefs - Utility function
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
            <ProfileTabsSkeleton />
          </div>
        ) : canRenderProfile ? (
          <div className="container">
            <ProfileTabs tabs={PROFILE_TABS} activeTab="artworks" tabHrefs={tabHrefs} />
          </div>
        ) : null}
        {isLoading ? (
          <div className="container py-6">
            <ProfileArtworksSectionSkeleton count={8} layout="grid" />
          </div>
        ) : canRenderProfile && profileData ? (
          <div className="container py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
                  Artworks
                </h2>
                <p className="text-sm text-slate-500">All artworks by this artist</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profileData.artworks.map((artwork) => (
                <ProfileArtworkCard key={artwork.id} artwork={artwork} artist={profileData.user} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
