// third-party
import { MapPin, Tag } from 'lucide-react'

// @domains - discover
import { type DiscoverProfile } from '@domains/discover/mock/mockProfiles'

type ProfileCardProps = {
  profile: DiscoverProfile
  isFollowing: boolean
  onToggleFollow: () => void
}

export const ProfileCard = ({ profile, isFollowing, onToggleFollow }: ProfileCardProps) => {
  // -- state --

  // -- derived --
  const collageImages = profile.collage
  const extendedCollage = [
    ...collageImages,
    ...Array.from(
      { length: Math.max(0, 4 - collageImages.length) },
      (_, index) => `https://picsum.photos/seed/profile-${profile.id}-${index}/200/200`,
    ),
  ]
  const [primaryImage, smallOne, smallTwo, smallThree] = extendedCollage

  // -- handlers --

  // -- render --
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white px-5 pt-12 pb-5 shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
      {/* avatar */}
      <img
        src={profile.avatarUrl}
        alt={profile.fullName}
        className="absolute -top-7 left-5 h-16 w-16 rounded-full border border-slate-200 bg-white object-cover shadow-sm"
      />

      {/* follow */}
      <button
        type="button"
        onClick={onToggleFollow}
        aria-pressed={isFollowing}
        className={`absolute top-4 right-5 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
          isFollowing
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
        }`}
      >
        {isFollowing ? null : (
          <img
            src="/images/discover/follow-icon.svg"
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
        )}
        {isFollowing ? 'Following' : 'Follow'}
      </button>

      {/* info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{profile.fullName}</h3>
          {profile.isVerified ? (
            <img src="/images/discover/verified-icon.svg" alt="Verified" className="h-4 w-4" />
          ) : null}
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">{profile.username}</span> | {profile.role}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            {profile.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Tag className="h-4 w-4 text-slate-400" />
            {profile.statsLabel}
          </span>
        </div>
      </div>

      {/* collage */}
      <div className="mt-6 grid grid-cols-3 grid-rows-2 gap-3">
        {/* collage - primary */}
        <div className="col-span-1 row-span-2 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
          <img
            src={primaryImage}
            alt="Profile collage"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* collage - row 1 */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
          <img
            src={smallOne}
            alt="Profile collage"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* collage - row 1 */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
          <img
            src={smallTwo}
            alt="Profile collage"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* collage - row 2 */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
          <img
            src={smallThree}
            alt="Profile collage"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* see more */}
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-300/70 text-sm font-semibold text-white">
          + See More
        </div>
      </div>
    </div>
  )
}
