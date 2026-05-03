// next
import Image from 'next/image'
import Link from 'next/link'
import { Film, Pencil, Trash2 } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import type { ProfileMoodboard, ProfileMoodboardMedia } from '@domains/profile/types'

type MoodboardsSectionProps = {
  moodboards: ProfileMoodboard[]
  title?: string
  subtitle?: string
  className?: string
  showSeeAll?: boolean
  seeAllHref?: string
  size?: 'compact' | 'large'
  detailBaseHref?: string
  isOwner?: boolean
  onEditMoodboard?: (moodboard: ProfileMoodboard) => void
  onDeleteMoodboard?: (moodboard: ProfileMoodboard) => void
}

/**
 * MoodboardsSection - React component
 * @returns React element
 */
export const MoodboardsSection = ({
  moodboards,
  title = 'Moodboards',
  subtitle = 'Curated inspirations and themes',
  className,
  showSeeAll = true,
  seeAllHref,
  size = 'compact',
  detailBaseHref,
  isOwner = false,
  onEditMoodboard,
  onDeleteMoodboard,
}: MoodboardsSectionProps) => {
  const isLarge = size === 'large'
  const hasHeaderContent = Boolean(title || subtitle || showSeeAll)

/**
 * isLarge - Utility function
 * @returns void
 */
  return (
    <section className={cn(className)}>
      {hasHeaderContent ? (
        <div className="mb-4 flex items-center justify-between gap-3">
/**
 * hasHeaderContent - Utility function
 * @returns void
 */
          <div>
            <h3 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
              {title}
            </h3>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          {showSeeAll ? <SeeAllAction href={seeAllHref} /> : null}
        </div>
      ) : null}

      <div
        className={cn(
          isLarge
            ? 'grid [grid-template-columns:repeat(auto-fit,minmax(200px,220px))] justify-start gap-5'
            : 'flex gap-4 overflow-x-auto pb-2',
        )}
      >
        {moodboards.map((board) => (
          <MoodboardCard
            key={board.id}
            board={board}
            size={size}
            href={detailBaseHref ? `${detailBaseHref}/${board.id}` : undefined}
            isOwner={isOwner}
            onEdit={onEditMoodboard}
            onDelete={onDeleteMoodboard}
          />
        ))}
      </div>
    </section>
  )
}

type SeeAllActionProps = {
  href?: string
}

const SeeAllAction = ({ href }: SeeAllActionProps) => {
  const className = 'text-sm font-semibold text-blue-600 hover:text-blue-700'

  if (href) {
    return (
      <Link href={href} className={className}>
        SEE ALL &gt;
      </Link>
    )
/**
 * SeeAllAction - React component
 * @returns React element
 */
  }

  return (
    <button type="button" className={className}>
/**
 * className - Utility function
 * @returns void
 */
      SEE ALL &gt;
    </button>
  )
}

type MoodboardCardProps = {
  board: ProfileMoodboard
  size: 'compact' | 'large'
  href?: string
  isOwner?: boolean
  onEdit?: (board: ProfileMoodboard) => void
  onDelete?: (board: ProfileMoodboard) => void
}

const MoodboardCard = ({ board, size, href, isOwner = false, onEdit, onDelete }: MoodboardCardProps) => {
  const isLarge = size === 'large'
  const uploadedMedia = board.mediaItems ?? []
  const coverMedia = uploadedMedia.find((media) => media.isCover) ?? uploadedMedia[0]
  const secondaryMedia = uploadedMedia.find((media) => media.id !== coverMedia?.id)
  const fallbackCoverUrls = (board.artworkCoverUrls ?? []).filter(Boolean)
  const primaryCover = fallbackCoverUrls[0] || board.coverUrl
  const secondaryCover = fallbackCoverUrls[1] || board.secondaryCoverUrl || board.coverUrl
  const extraCoverCount = Math.max(0, (uploadedMedia.length || fallbackCoverUrls.length) - 1)
  const featuredSuffix = extraCoverCount > 0 ? ` +${extraCoverCount} other` : ''
  const authorAvatarUrl = board.authorAvatarUrl || 'https://placehold.co/64x64.png?text=HP'
  const sizeStyles = isLarge
    ? {
      secondaryCoverClass: 'left-20 bottom-20 h-32 w-26',
      primaryCoverClass: 'left-28 bottom-12 h-48 w-35',
/**
 * MoodboardCard - React component
 * @returns React element
 */
      coverHeightClass: 'h-44 sm:h-48',
      cardWidthClass: 'w-[220px]',
      contentPaddingClass: 'px-4 pb-5 pt-4',
      titleClassName: 'text-[15px]',
/**
 * isLarge - Utility function
 * @returns void
 */
    }
    : {
      secondaryCoverClass: 'left-20 bottom-12 h-30 w-24',
      primaryCoverClass: 'left-28 bottom-6 h-45 w-32',
/**
 * uploadedMedia - Utility function
 * @returns void
 */
      coverHeightClass: 'h-40',
      cardWidthClass: 'w-[200px] shrink-0',
      contentPaddingClass: 'px-3 pb-4 pt-3',
      titleClassName: '',
/**
 * coverMedia - Utility function
 * @returns void
 */
    }
  const cardBody = (
    <div
      className={cn(
/**
 * secondaryMedia - Utility function
 * @returns void
 */
        'group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        'w-full',
      )}
    >
/**
 * fallbackCoverUrls - Utility function
 * @returns void
 */
      <div className={cn('relative overflow-hidden bg-white', sizeStyles.coverHeightClass)}>
        <div
          className={cn(
            'absolute rotate-10 overflow-hidden rounded-xl bg-white shadow-lg',
/**
 * primaryCover - Utility function
 * @returns void
 */
            sizeStyles.secondaryCoverClass,
          )}
        >
          <MoodboardCoverTile
/**
 * secondaryCover - Utility function
 * @returns void
 */
            media={secondaryMedia}
            src={secondaryCover}
            alt={`${board.title} secondary`}
            sizes="120px"
/**
 * extraCoverCount - Utility function
 * @returns void
 */
          />
        </div>
        <div
          className={cn(
/**
 * featuredSuffix - Utility function
 * @returns void
 */
            'absolute rotate-13 overflow-hidden rounded-xl bg-white shadow-xl',
            sizeStyles.primaryCoverClass,
          )}
        >
/**
 * authorAvatarUrl - Utility function
 * @returns void
 */
          <MoodboardCoverTile
            media={coverMedia}
            src={primaryCover}
            alt={board.title}
/**
 * sizeStyles - Utility function
 * @returns void
 */
            sizes="140px"
          />
        </div>
        {board.isPrivate ? (
          <span className="absolute top-4 left-4 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white uppercase">
            Private
          </span>
        ) : null}
        {/* Owner controls overlay */}
        {isOwner && (onEdit || onDelete) && (
          <div className="absolute top-4 right-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(board)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-blue-600"
                aria-label="Edit moodboard"
/**
 * cardBody - Utility function
 * @returns void
 */
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(board)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-red-600"
                aria-label="Delete moodboard"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className={cn('space-y-1.5', sizeStyles.contentPaddingClass)}>
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-200">
            <Image
              src={authorAvatarUrl}
              alt={board.author}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'truncate text-sm font-semibold text-slate-900',
                sizeStyles.titleClassName,
              )}
            >
              {board.title}
            </p>
            <p className="truncate text-xs text-slate-500">by {board.author}</p>
          </div>
        </div>
        {board.featuredArtist ? (
          <p className="truncate text-xs text-slate-500">
            Featuring {board.featuredArtist}
            {featuredSuffix}
          </p>
        ) : null}
      </div>
    </div>
  )

  if (!href) {
    return <div className={sizeStyles.cardWidthClass}>{cardBody}</div>
  }

  return (
    <Link href={href} className={cn('inline-flex', sizeStyles.cardWidthClass)}>
      {cardBody}
    </Link>
  )
}

type MoodboardCoverTileProps = {
  media?: ProfileMoodboardMedia
  src?: string
  alt: string
  sizes: string
}

const resolveMoodboardCoverSrc = (media?: ProfileMoodboardMedia, fallbackSrc?: string) => {
  if (media) {
    if (media.thumbnailUrl) return media.thumbnailUrl
    if (media.mediaType === 'image') return media.secureUrl || media.url || media.displayUrl
    return null
  }

  return fallbackSrc?.trim() || null
}

const MoodboardCoverTile = ({ media, src, alt, sizes }: MoodboardCoverTileProps) => {
  const imageSrc = resolveMoodboardCoverSrc(media, src)

  if (!imageSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <Film className="h-5 w-5" />
      </div>
    )
  }

  return <Image src={imageSrc} alt={alt} fill sizes={sizes} className="object-cover" />
}

/**
 * resolveMoodboardCoverSrc - Utility function
 * @returns void
 */
/**
 * MoodboardCoverTile - React component
 * @returns React element
 */
/**
 * imageSrc - Utility function
 * @returns void
 */