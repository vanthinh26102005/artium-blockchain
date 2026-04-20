// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { MoodboardsSection } from '@domains/profile/components/MoodboardsSection'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'

type ProfileMoodboardsPageViewProps = {
  username?: string | string[]
}

export const ProfileMoodboardsPageView = ({
  username: _username,
}: ProfileMoodboardsPageViewProps) => {
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, user: fetchedUser, isOwner, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileData = useProfileDraftData(baseData)
  const pageTitle = `${profileData.user.displayName} (@${resolvedUsername}) | Moodboards`
  const baseHref = `/profile/${resolvedUsername}`

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
              userId={fetchedUser?.id}
              isOwner={isOwner}
            />
          )}
        </div>
        <div className="container">
          <ProfileTabs
            tabs={PROFILE_TABS}
            activeTab="moodboards"
            tabHrefs={{
              overview: baseHref,
              artworks: `${baseHref}/artworks`,
              moments: `${baseHref}/moments`,
              moodboards: `${baseHref}/moodboards`,
            }}
          />
        </div>
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
                Moodboards
              </h2>
              <p className="text-sm text-slate-500">All moodboards by this artist</p>
            </div>
            <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400">
              Create Moodboard
            </button>
          </div>
          <MoodboardsSection
            moodboards={profileData.moodboards}
            showSeeAll={false}
            title=""
            subtitle=""
            size="large"
            detailBaseHref={`${baseHref}/moodboards`}
          />
        </div>
      </div>
    </>
  )
}
