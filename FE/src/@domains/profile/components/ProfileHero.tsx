// next
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

// third-party
import { BadgeCheck, MapPin, Pencil, Share, UserPlus, UserCheck } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'
import { useFollowUser } from '@shared/hooks/useFollowUser'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

// @domains - profile
import { ProfileStats, ProfileUser } from '@domains/profile/types'

type ProfileHeroProps = {
  user: ProfileUser
  stats: ProfileStats
  userId?: string
  isOwner?: boolean
}

/**
 * formatStat - Utility function
 * @returns void
 */
const formatStat = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`
  if (value >= 1000) return `${Math.floor(value / 1000)}k+`
  return value.toString()
}

export const ProfileHero = ({ user, stats, userId, isOwner = false }: ProfileHeroProps) => {
  const authUser = useAuthStore((state) => state.user)
  const targetUserId = userId || authUser?.id || ''
  /**
   * ProfileHero - React component
   * @returns React element
   */
  const [localFollowersCount, setLocalFollowersCount] = React.useState(stats.followers)
  const [localFollowingCount, setLocalFollowingCount] = React.useState(stats.following)

  React.useEffect(() => {
    /**
     * authUser - Utility function
     * @returns void
     */
    setLocalFollowersCount(stats.followers)
  }, [stats.followers])

  React.useEffect(() => {
    /**
     * targetUserId - Utility function
     * @returns void
     */
    setLocalFollowingCount(stats.following)
  }, [stats.following])

  // Use follow hook
  const {
    isFollowing,
    isLoading: isFollowLoading,
    toggleFollow,
  } = useFollowUser({
    targetUserId,
    onFollowChange: (following) => {
      setLocalFollowersCount((prev) => (following ? prev + 1 : Math.max(0, prev - 1)))
    },
  })

  const handleShare = async () => {
    if (typeof window === 'undefined') {
      return
    }

    const url = window.location.href
    const title = `${user.displayName} (@${user.username})`
    const text = user.headline ? user.headline : `View ${user.displayName}'s profile`

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
        /**
         * handleShare - Utility function
         * @returns void
         */
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      /**
       * url - Utility function
       * @returns void
       */
      console.error('Failed to share profile', error)
    }
  }

  /**
   * title - Utility function
   * @returns void
   */
  return (
    <section className="w-full py-8 font-['Inter'] lg:py-12">
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-4">
          /** * text - Utility function * @returns void */
          <div className="flex w-auto items-center justify-center p-2 lg:p-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-slate-100 shadow sm:h-32 sm:w-32 lg:h-36 lg:w-36">
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-auto space-y-1 lg:flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold leading-[1.05] text-slate-900 sm:text-[28px] lg:text-[32px]">
                {user.displayName}
              </h1>
              {user.verified ? <BadgeCheck className="h-5 w-5 text-blue-600" /> : null}
            </div>
            <p className="text-sm font-medium text-slate-600 sm:text-base">@{user.username}</p>
            {user.headline ? (
              <p className="text-base font-semibold text-slate-800 sm:text-lg">{user.headline}</p>
            ) : null}
            {user.location ? (
              <div className="inline-flex items-center gap-2 text-sm text-slate-600 sm:text-base">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{user.location}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop stats + actions */}
        <div className="hidden w-1/2 pt-0 lg:block">
          <div className="inline-flex h-[51px] w-full justify-center">
            <div className="inline-flex h-full items-center justify-end lg:w-[500px] lg:justify-center">
              <StatBlock label="artworks" value={stats.artworks} />
              <Divider />
              <StatBlock label="followers" value={localFollowersCount} />
              <Divider />
              <StatBlock label="following" value={localFollowingCount} />
            </div>
          </div>
          <div className="mt-8 inline-flex h-[50px] w-full items-stretch justify-center gap-2">
            {isOwner ? (
              <Link
                href={`/profile/${encodeURIComponent(user.username)}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-slate-900 hover:shadow-md"
              >
                <Pencil className="h-4 w-4" />
                <span className="ml-1 text-[12px] font-medium lg:ml-2 lg:text-[16px]">
                  Edit Profile
                </span>
              </Link>
            ) : (
              <button
                onClick={toggleFollow}
                disabled={isFollowLoading}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition',
                  isFollowing
                    ? 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    : 'border-0 bg-blue-600 text-white hover:bg-blue-700',
                  isFollowLoading && 'cursor-not-allowed opacity-60',
                )}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span className="ml-1 text-[12px] font-medium lg:ml-2 lg:text-[16px]">
                      Following
                    </span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span className="ml-1 text-[12px] font-medium lg:ml-2 lg:text-[16px]">
                      Follow
                    </span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-slate-900 hover:shadow-md"
              aria-label="Share profile"
            >
              <Share className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </button>
          </div>
        </div>

        {/* Mobile / tablet stats + actions */}
        <div className="flex w-full flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-start gap-3 text-sm text-slate-600">
            <StatBlock label="artworks" value={stats.artworks} compact />
            <Divider />
            <StatBlock label="followers" value={localFollowersCount} compact />
            <Divider />
            <StatBlock label="following" value={localFollowingCount} compact />
          </div>
          <div className="inline-flex h-[44px] w-full items-stretch justify-start gap-2">
            {isOwner ? (
              <Link
                href={`/profile/${encodeURIComponent(user.username)}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-slate-900 hover:shadow-md"
              >
                <Pencil className="h-4 w-4" />
                <span className="text-[12px] font-medium">Edit Profile</span>
              </Link>
            ) : (
              <button
                onClick={toggleFollow}
                disabled={isFollowLoading}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                  isFollowing
                    ? 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    : 'border-0 bg-blue-600 text-white hover:bg-blue-700',
                  isFollowLoading && 'cursor-not-allowed opacity-60',
                )}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span className="text-[12px] font-medium">Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span className="text-[12px] font-medium">Follow</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900 hover:shadow-sm"
              aria-label="Share profile"
            >
              <Share className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

type StatBlockProps = {
  label: string
  value: number
  compact?: boolean
}

const StatBlock = ({ label, value, compact }: StatBlockProps) => (
  <div className={cn('flex flex-col items-center', compact ? 'px-2' : 'px-4')}>
    <span
      className={cn(
        compact ? 'text-base' : 'text-xl',
        'font-semibold leading-tight text-slate-900',
      )}
    >
      {formatStat(value)}
    </span>
    <span className={cn(compact ? 'text-xs' : 'text-sm', 'leading-snug text-slate-500')}>
      {label}
    </span>
  </div>
)

const Divider = () => <span className="mx-1 h-8 w-px bg-slate-300" />

/**
 * StatBlock - React component
 * @returns React element
 */
/**
 * Divider - React component
 * @returns React element
 */
