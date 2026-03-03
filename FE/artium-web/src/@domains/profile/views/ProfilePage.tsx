// react
import { FormEvent, useMemo, useState } from 'react'

// third-party
import { Film, Grid2X2, Sparkles } from 'lucide-react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - profile
import { ArtworksSection } from '@domains/profile/components/ArtworksSection'
import { MomentsSection } from '@domains/profile/components/MomentsSection'
import { MoodboardsSection } from '@domains/profile/components/MoodboardsSection'
import { ProfileAboutSection } from '@domains/profile/components/ProfileAboutSection'
import { ProfileHero } from '@domains/profile/components/ProfileHero'
import { ProfileSalesStatsSection } from '@domains/profile/components/ProfileSalesStatsSection'
import { ProfileTabs } from '@domains/profile/components/ProfileTabs'
import { PROFILE_TABS } from '@domains/profile/constants/profileTabs'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import { ProfileMoodboard, ProfileMoment, ProfileTabKey } from '@domains/profile/types'
import profileApis from '@shared/apis/profileApis'
import { mapMoodboardToProfileMoodboard, mapMomentToProfileMoment } from '@domains/profile/utils/profileApiMapper'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Input } from '@shared/components/ui/input'
import { Switch } from '@shared/components/ui/switch'
import { cn } from '@shared/lib/utils'

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
  const [momentForm, setMomentForm] = useState({
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    thumbnailUrl: '',
    caption: '',
    location: '',
    hashtags: '',
    durationSeconds: '',
    isPinned: false,
  })
  const [moodboardForm, setMoodboardForm] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    tags: '',
    isPrivate: false,
    isCollaborative: false,
  })

  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, sellerProfile, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileDataWithDraft = useProfileDraftData(baseData)
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)
  const isOwner =
    isAuthenticated &&
    sellerProfile &&
    authUser?.id === sellerProfile.userId

  const profileData = baseData

  const pageTitle = `${profileData.user.displayName} (@${resolvedUsername}) | Artium`
  const baseHref = `/profile/${encodeURIComponent(resolvedUsername)}`
  const moments = useMemo(
    () => [...createdMoments, ...profileData.moments],
    [createdMoments, profileData.moments],
  )
  const moodboards = useMemo(
    () => [...createdMoodboards, ...profileData.moodboards],
    [createdMoodboards, profileData.moodboards],
  )

  const resetMomentForm = () => {
    setMomentForm({
      mediaUrl: '',
      mediaType: 'image',
      thumbnailUrl: '',
      caption: '',
      location: '',
      hashtags: '',
      durationSeconds: '',
      isPinned: false,
    })
    setMomentError(null)
  }

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

  const handleCreateMoment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated || momentSubmitting) return

    const mediaUrl = momentForm.mediaUrl.trim()
    if (!mediaUrl) {
      setMomentError('Please provide a media URL to publish your moment.')
      return
    }

    const durationValue =
      momentForm.mediaType === 'video' && momentForm.durationSeconds.trim()
        ? Number(momentForm.durationSeconds)
        : undefined

    setMomentSubmitting(true)
    setMomentError(null)
    setMomentSuccess(null)

    const payload = {
      mediaUrl,
      mediaType: momentForm.mediaType,
      thumbnailUrl:
        momentForm.mediaType === 'video' && momentForm.thumbnailUrl.trim()
          ? momentForm.thumbnailUrl.trim()
          : undefined,
      caption: momentForm.caption.trim() || undefined,
      location: momentForm.location.trim() || undefined,
      hashtags: parseTags(momentForm.hashtags),
      durationSeconds: Number.isFinite(durationValue) ? durationValue : undefined,
      isPinned: momentForm.isPinned,
    }

    try {
      const created = await profileApis.createMoment(payload)
      setCreatedMoments((prev) => [mapMomentToProfileMoment(created), ...prev])
      setMomentSuccess('Moment published.')
      setIsMomentDialogOpen(false)
      resetMomentForm()
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
    switch (activeTab) {
      case 'artworks':
        return <ArtworksSection artworks={profileData.artworks} showSeeAll={false} />
      case 'moments':
        return <MomentsSection moments={moments} showSeeAll={false} />
      case 'moodboards':
        return (
          <MoodboardsSection
            moodboards={moodboards}
            detailBaseHref={`${baseHref}/moodboards`}
          />
        )
      case 'overview':
      default:
        return (
          <div className="space-y-8">
            <ArtworksSection
              artworks={profileData.artworks}
              limit={5}
              seeAllHref={`${baseHref}/artworks`}
            />
            <MomentsSection
              moments={moments}
              limit={6}
              seeAllHref={`${baseHref}/moments`}
              detailBaseHref={`${baseHref}/moments`}
            />
            <MoodboardsSection
              moodboards={moodboards}
              seeAllHref={`${baseHref}/moodboards`}
              detailBaseHref={`${baseHref}/moodboards`}
            />
            <ProfileAboutSection
              about={profileData.about}
              editHref={`/profile/${encodeURIComponent(resolvedUsername)}/edit`}
            />
            <ProfileSalesStatsSection
              displayName={profileData.user.displayName}
              stats={profileData.salesStats}
            />
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
        {isOwner && !isLoading && !error ? (
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
                      resetMomentForm()
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
        <div className="container">
          <ProfileTabs
            tabs={PROFILE_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabHrefs={{
              overview: baseHref,
              artworks: `${baseHref}/artworks`,
              moments: `${baseHref}/moments`,
              moodboards: `${baseHref}/moodboards`,
            }}
          />
        </div>
        <div className="container px-4 py-6 sm:px-6">{renderTabContent()}</div>
      </div>

      <Dialog
        open={isMomentDialogOpen}
        onOpenChange={(open) => {
          setIsMomentDialogOpen(open)
          if (!open) {
            resetMomentForm()
            setMomentSubmitting(false)
          }
        }}
      >
        <DialogContent size="4xl" className="w-[95vw] rounded-3xl bg-white p-0">
          <form onSubmit={handleCreateMoment} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  Moment
                </p>
                <h3 className="text-2xl font-semibold">Tell your story in motion</h3>
                <p className="text-sm text-white/70">
                  Paste a media URL and add a caption to publish instantly.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                {momentForm.mediaUrl ? (
                  momentForm.mediaType === 'video' ? (
                    <video
                      src={momentForm.mediaUrl}
                      poster={momentForm.thumbnailUrl || undefined}
                      className="h-56 w-full object-cover"
                      controls
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={momentForm.mediaUrl}
                      alt="Moment preview"
                      className="h-56 w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-white/60">
                    Preview appears here
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6 py-8">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Media URL</label>
                <Input
                  value={momentForm.mediaUrl}
                  onChange={(event) =>
                    setMomentForm((prev) => ({ ...prev, mediaUrl: event.target.value }))
                  }
                  placeholder="https://..."
                  className="h-11 rounded-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMomentForm((prev) => ({ ...prev, mediaType: 'image' }))}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    momentForm.mediaType === 'image'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setMomentForm((prev) => ({ ...prev, mediaType: 'video' }))}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    momentForm.mediaType === 'video'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  Video
                </button>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-sm text-slate-600">Pin to profile</span>
                  <Switch
                    checked={momentForm.isPinned}
                    onCheckedChange={(checked) =>
                      setMomentForm((prev) => ({ ...prev, isPinned: checked }))
                    }
                  />
                </div>
              </div>

              {momentForm.mediaType === 'video' ? (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Thumbnail URL (optional)
                  </label>
                  <Input
                    value={momentForm.thumbnailUrl}
                    onChange={(event) =>
                      setMomentForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
                    }
                    placeholder="https://..."
                    className="h-11 rounded-full"
                  />
                </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Caption</label>
                <textarea
                  value={momentForm.caption}
                  onChange={(event) =>
                    setMomentForm((prev) => ({ ...prev, caption: event.target.value }))
                  }
                  placeholder="Share the story behind the piece..."
                  className="h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <Input
                    value={momentForm.location}
                    onChange={(event) =>
                      setMomentForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                    placeholder="City, Country"
                    className="h-11 rounded-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Hashtags
                  </label>
                  <Input
                    value={momentForm.hashtags}
                    onChange={(event) =>
                      setMomentForm((prev) => ({ ...prev, hashtags: event.target.value }))
                    }
                    placeholder="studio, oil, sketch"
                    className="h-11 rounded-full"
                  />
                </div>
              </div>

              {momentForm.mediaType === 'video' ? (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Duration (seconds)
                  </label>
                  <Input
                    value={momentForm.durationSeconds}
                    onChange={(event) =>
                      setMomentForm((prev) => ({ ...prev, durationSeconds: event.target.value }))
                    }
                    placeholder="e.g. 30"
                    type="number"
                    min={1}
                    max={60}
                    className="h-11 rounded-full"
                  />
                </div>
              ) : null}

              {momentError ? (
                <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {momentError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMomentDialogOpen(false)}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={momentSubmitting}
                  className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {momentSubmitting ? 'Publishing...' : 'Publish moment'}
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
