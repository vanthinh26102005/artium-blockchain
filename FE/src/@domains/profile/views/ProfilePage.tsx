// react
import { useMemo, useState } from 'react'

// third-party
import { Film, Grid2X2, Sparkles } from 'lucide-react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ArtworksSection } from '@domains/profile/components/ArtworksSection'
import { MomentDeviceUploadComposer } from '@domains/profile/components/MomentDeviceUploadComposer'
import { MomentsSection } from '@domains/profile/components/MomentsSection'
import { MoodboardDeviceUploadComposer } from '@domains/profile/components/MoodboardDeviceUploadComposer'
import { MoodboardsSection } from '@domains/profile/components/MoodboardsSection'
import { ProfileAboutSection } from '@domains/profile/components/ProfileAboutSection'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import { ProfileSalesStatsSection } from '@domains/profile/components/ProfileSalesStatsSection'
import {
  ProfileArtworksSectionSkeleton,
  ProfileHeroSkeleton,
  ProfileMomentsSectionSkeleton,
  ProfileMoodboardsSectionSkeleton,
  ProfileOverviewSkeleton,
  ProfileTabsSkeleton,
} from '@domains/profile/components/ProfileSkeletons'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import { ProfileMoodboard, ProfileMoment, ProfileTabKey } from '@domains/profile/types'
import profileApis from '@shared/apis/profileApis'
import type { CreateMomentInput, CreateMoodboardInput } from '@shared/apis/profileApis'
import { mapMoodboardToProfileMoodboard, mapMomentToProfileMoment } from '@domains/profile/utils/profileApiMapper'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type ProfilePageViewProps = {
  username?: string | string[]
}

export const ProfilePageView = ({ username: _username }: ProfilePageViewProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('overview')
  const [isMomentDialogOpen, setIsMomentDialogOpen] = useState(false)
  const [isMoodboardDialogOpen, setIsMoodboardDialogOpen] = useState(false)
  const [momentSubmitting, setMomentSubmitting] = useState(false)
  const [moodboardSubmitting, setMoodboardSubmitting] = useState(false)
  const [momentError, setMomentError] = useState<string | null>(null)
  const [moodboardError, setMoodboardError] = useState<string | null>(null)
  const [momentSuccess, setMomentSuccess] = useState<string | null>(null)
  const [moodboardSuccess, setMoodboardSuccess] = useState<string | null>(null)
  const [createdMoments, setCreatedMoments] = useState<ProfileMoment[]>([])
  const [createdMoodboards, setCreatedMoodboards] = useState<ProfileMoodboard[]>([])

  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, user: fetchedUser, sellerProfile, isOwner, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileDataWithDraft = useProfileDraftData(baseData)
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)

  const profileData = profileDataWithDraft
  const profileHandle = resolvedUsername || profileData?.user.username || usernameFromRoute || ''
  const canRenderProfile = !isLoading && !error && Boolean(profileData)

  const pageTitle = profileData
    ? `${profileData.user.displayName} (@${resolvedUsername}) | Artium`
    : 'Profile | Artium'
  const baseHref = profileHandle ? `/profile/${encodeURIComponent(profileHandle)}` : ''
  const tabHrefs = profileHandle
    ? {
        overview: baseHref,
        artworks: `${baseHref}/artworks`,
        moments: `${baseHref}/moments`,
        moodboards: `${baseHref}/moodboards`,
      }
    : undefined
  const moments = useMemo(
    () => [...createdMoments, ...(profileData?.moments ?? [])],
    [createdMoments, profileData?.moments],
  )
  const moodboards = useMemo(
    () => [...createdMoodboards, ...(profileData?.moodboards ?? [])],
    [createdMoodboards, profileData?.moodboards],
  )

  const handleCreateMoment = async (input: CreateMomentInput) => {
    if (!isAuthenticated || momentSubmitting) return

    setMomentSubmitting(true)
    setMomentError(null)
    setMomentSuccess(null)

    try {
      const created = await profileApis.createMoment(input)
      setCreatedMoments((prev) => [mapMomentToProfileMoment(created), ...prev])
      setMomentSuccess('Moment published.')
      setIsMomentDialogOpen(false)
    } catch (err) {
      setMomentError(err instanceof Error ? err.message : 'Failed to create moment.')
    } finally {
      setMomentSubmitting(false)
    }
  }

  const handleCreateMoodboard = async (input: CreateMoodboardInput) => {
    if (!isAuthenticated || moodboardSubmitting || !profileData) return

    setMoodboardSubmitting(true)
    setMoodboardError(null)
    setMoodboardSuccess(null)

    try {
      const created = await profileApis.createMoodboard(input)
      setCreatedMoodboards((prev) => [
        mapMoodboardToProfileMoodboard(created, profileData.user),
        ...prev,
      ])
      setMoodboardSuccess('Moodboard created.')
      setIsMoodboardDialogOpen(false)
    } catch (err) {
      setMoodboardError(err instanceof Error ? err.message : 'Failed to create moodboard.')
    } finally {
      setMoodboardSubmitting(false)
    }
  }

  const renderTabContent = () => {
    if (isLoading) {
      switch (activeTab) {
        case 'artworks':
          return <ProfileArtworksSectionSkeleton count={5} />
        case 'moments':
          return <ProfileMomentsSectionSkeleton count={6} />
        case 'moodboards':
          return <ProfileMoodboardsSectionSkeleton count={4} />
        case 'overview':
        default:
          return <ProfileOverviewSkeleton />
      }
    }

    if (error) {
      return null
    }

    if (!profileData) {
      return null
    }

    switch (activeTab) {
      case 'artworks':
        return <ArtworksSection artworks={profileData.artworks} showSeeAll={false} isOwner={isOwner} />
      case 'moments':
        return <MomentsSection moments={moments} showSeeAll={false} isOwner={isOwner} />
      case 'moodboards':
        return (
          <MoodboardsSection
            moodboards={moodboards}
            detailBaseHref={profileHandle ? `${baseHref}/moodboards` : undefined}
            isOwner={isOwner}
          />
        )
      case 'overview':
      default:
        return (
          <div className="space-y-8">
            <ArtworksSection
              artworks={profileData.artworks}
              limit={5}
              seeAllHref={profileHandle ? `${baseHref}/artworks` : undefined}
              isOwner={isOwner}
            />
            <MomentsSection
              moments={moments}
              limit={6}
              seeAllHref={profileHandle ? `${baseHref}/moments` : undefined}
              detailBaseHref={profileHandle ? `${baseHref}/moments` : undefined}
              isOwner={isOwner}
            />
            <MoodboardsSection
              moodboards={moodboards}
              seeAllHref={profileHandle ? `${baseHref}/moodboards` : undefined}
              detailBaseHref={profileHandle ? `${baseHref}/moodboards` : undefined}
              isOwner={isOwner}
            />
            <ProfileAboutSection
              about={profileData.about}
              editHref={profileHandle ? `/profile/${encodeURIComponent(profileHandle)}/edit` : '/'}
            />
            {sellerProfile ? (
              <ProfileSalesStatsSection
                displayName={profileData.user.displayName}
                stats={profileData.salesStats}
              />
            ) : null}
          </div>
        )
    }
  }

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
          ) : (
            <ProfileHero
              user={profileData.user}
              stats={profileData.stats}
              userId={fetchedUser?.id}
              isOwner={isOwner}
            />
          )}
        </div>
        {isOwner && canRenderProfile ? (
          <div className="container">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    <Sparkles className="h-3 w-3" />
                    Studio tools
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Share a new story or mood
                  </h2>
                  <p className="text-sm text-slate-600">
                    Post a behind-the-scenes moment or start a moodboard collection in seconds.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMomentError(null)
                      setMomentSuccess(null)
                      setIsMomentDialogOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <Film className="h-4 w-4" />
                    New moment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoodboardError(null)
                      setMoodboardSuccess(null)
                      setIsMoodboardDialogOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  >
                    <Grid2X2 className="h-4 w-4" />
                    New moodboard
                  </button>
                </div>
              </div>
              {(momentSuccess || moodboardSuccess) && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
                  {momentSuccess ? <p>{momentSuccess}</p> : null}
                  {moodboardSuccess ? <p>{moodboardSuccess}</p> : null}
                </div>
              )}
            </section>
          </div>
        ) : null}
        {isLoading ? (
          <div className="container">
            <ProfileTabsSkeleton />
          </div>
        ) : canRenderProfile ? (
          <div className="container">
            <ProfileTabs
              tabs={PROFILE_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabHrefs={tabHrefs}
            />
          </div>
        ) : null}
        {(isLoading || canRenderProfile) ? (
          <div className="container px-4 py-6 sm:px-6">{renderTabContent()}</div>
        ) : null}
      </div>

      {isMomentDialogOpen ? (
        <MomentDeviceUploadComposer
          open={isMomentDialogOpen}
          submitting={momentSubmitting}
          errorMessage={momentError}
          onOpenChange={(open) => {
            setIsMomentDialogOpen(open)
            if (!open) {
              setMomentSubmitting(false)
              setMomentError(null)
            }
          }}
          onPublish={handleCreateMoment}
        />
      ) : null}

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
