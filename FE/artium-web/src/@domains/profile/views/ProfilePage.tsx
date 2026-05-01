// react
import { FormEvent, useMemo, useState } from 'react'

// third-party
import { Film, Grid2X2, Sparkles } from 'lucide-react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ArtworksSection } from '@domains/profile/components/ArtworksSection'
import { MomentDeviceUploadComposer } from '@domains/profile/components/MomentDeviceUploadComposer'
import { MomentsSection } from '@domains/profile/components/MomentsSection'
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
import type { CreateMomentInput } from '@shared/apis/profileApis'
import { mapMoodboardToProfileMoodboard, mapMomentToProfileMoment } from '@domains/profile/utils/profileApiMapper'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Input } from '@shared/components/ui/input'
import { Switch } from '@shared/components/ui/switch'

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
  const [moodboardForm, setMoodboardForm] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    tags: '',
    isPrivate: false,
    isCollaborative: false,
  })

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

  const resetMoodboardForm = () => {
    setMoodboardForm({
      title: '',
      description: '',
      coverImageUrl: '',
      tags: '',
      isPrivate: false,
      isCollaborative: false,
    })
    setMoodboardError(null)
  }

  const parseTags = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (item.startsWith('#') ? item.slice(1) : item))

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

  const handleCreateMoodboard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated || moodboardSubmitting) return

    const title = moodboardForm.title.trim()
    if (!title) {
      setMoodboardError('Please add a title for your moodboard.')
      return
    }

    setMoodboardSubmitting(true)
    setMoodboardError(null)
    setMoodboardSuccess(null)

    const payload = {
      title,
      description: moodboardForm.description.trim() || undefined,
      coverImageUrl: moodboardForm.coverImageUrl.trim() || undefined,
      isPrivate: moodboardForm.isPrivate,
      isCollaborative: moodboardForm.isCollaborative,
      tags: parseTags(moodboardForm.tags),
    }

    try {
      const created = await profileApis.createMoodboard(payload)
      if (!profileData) {
        return
      }
      setCreatedMoodboards((prev) => [
        mapMoodboardToProfileMoodboard(created, profileData.user),
        ...prev,
      ])
      setMoodboardSuccess('Moodboard created.')
      setIsMoodboardDialogOpen(false)
      resetMoodboardForm()
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
                      resetMoodboardForm()
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

      <Dialog
        open={isMoodboardDialogOpen}
        onOpenChange={(open) => {
          setIsMoodboardDialogOpen(open)
          if (!open) {
            resetMoodboardForm()
            setMoodboardSubmitting(false)
          }
        }}
      >
        <DialogContent size="3xl" className="w-[95vw] rounded-3xl bg-white p-0">
          <form onSubmit={handleCreateMoodboard} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-6 bg-slate-50 px-6 py-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Moodboard
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Curate a new collection
                </h3>
                <p className="text-sm text-slate-600">
                  Organize inspirations, themes, and references into a shareable board.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {moodboardForm.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={moodboardForm.coverImageUrl}
                    alt="Moodboard cover preview"
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-slate-400">
                    Cover preview appears here
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6 py-8">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Title</label>
                <Input
                  value={moodboardForm.title}
                  onChange={(event) =>
                    setMoodboardForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="e.g. Minimalist textures"
                  className="h-11 rounded-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={moodboardForm.description}
                  onChange={(event) =>
                    setMoodboardForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Describe the mood or story..."
                  className="h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Cover image URL</label>
                <Input
                  value={moodboardForm.coverImageUrl}
                  onChange={(event) =>
                    setMoodboardForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                  className="h-11 rounded-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Tags 
                </label>
                <Input
                  value={moodboardForm.tags}
                  onChange={(event) =>
                    setMoodboardForm((prev) => ({ ...prev, tags: event.target.value }))
                  }
                  placeholder="minimal, sculptural, light"
                  className="h-11 rounded-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <Switch
                    checked={moodboardForm.isPrivate}
                    onCheckedChange={(checked) =>
                      setMoodboardForm((prev) => ({ ...prev, isPrivate: checked }))
                    }
                  />
                  Private board
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <Switch
                    checked={moodboardForm.isCollaborative}
                    onCheckedChange={(checked) =>
                      setMoodboardForm((prev) => ({ ...prev, isCollaborative: checked }))
                    }
                  />
                  Allow collaborators
                </label>
              </div>

              {moodboardError ? (
                <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {moodboardError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMoodboardDialogOpen(false)}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={moodboardSubmitting}
                  className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {moodboardSubmitting ? 'Creating...' : 'Create moodboard'}
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
