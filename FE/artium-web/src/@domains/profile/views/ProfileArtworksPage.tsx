// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ProfileArtworkCard } from '@domains/profile/components/ProfileArtworkCard'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type ProfileArtworksPageViewProps = {
  username?: string | string[]
}

export const ProfileArtworksPageView = ({ username: _username }: ProfileArtworksPageViewProps) => {
  // -- derived --
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, sellerProfile, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileData = useProfileDraftData(baseData)
  const pageTitle = `${profileData.user.displayName} (@${resolvedUsername}) | Artworks`
  const baseHref = `/profile/${resolvedUsername}`
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)
  const isOwner = isAuthenticated && sellerProfile && authUser?.id === sellerProfile.userId

  // -- render --
  return (
    <>
      <Metadata title={pageTitle} />
      <div className="space-y-4">
        <div className="container">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading profile...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error}
            </div>
          ) : (
            <ProfileHero
              user={profileData.user}
              stats={profileData.stats}
              userId={sellerProfile?.userId}
              isOwner={isOwner || false}
            />
          )}
        </div>
        <div className="container">
          <ProfileTabs
            tabs={PROFILE_TABS}
            activeTab="artworks"
            tabHrefs={{
              overview: baseHref,
              artworks: `${baseHref}/artworks`,
              moments: `${baseHref}/moments`,
              moodboards: `${baseHref}/moodboards`,
            }}
          />
        </div>
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
      </div>
    </>
  )
}
