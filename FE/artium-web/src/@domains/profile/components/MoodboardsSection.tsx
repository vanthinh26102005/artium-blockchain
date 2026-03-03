// next
import Image from 'next/image'
import Link from 'next/link'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileMoodboard } from '@domains/profile/types'

type MoodboardsSectionProps = {
  moodboards: ProfileMoodboard[]
  title?: string
  subtitle?: string
  className?: string
  showSeeAll?: boolean
  seeAllHref?: string
  size?: 'compact' | 'large'
  detailBaseHref?: string
}

export const MoodboardsSection = ({
  moodboards,
  title = 'Moodboards',
  subtitle = 'Curated inspirations and themes',
  className,
  showSeeAll = true,
  seeAllHref,
  size = 'compact',
  detailBaseHref,
}: MoodboardsSectionProps) => {
  const isLarge = size === 'large'
  const hasHeaderContent = Boolean(title || subtitle || showSeeAll)

  return (
    <section className={cn(className)}>
      {hasHeaderContent ? (
        <div className="mb-4 flex items-center justify-between gap-3">
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
  }

  return (
    <button type="button" className={className}>
      SEE ALL &gt;
    </button>
  )
}

type MoodboardCardProps = {
  board: ProfileMoodboard
  size: 'compact' | 'large'
  href?: string
}

const MoodboardCard = ({ board, size, href }: MoodboardCardProps) => {
  const isLarge = size === 'large'
  const coverUrls = board.artworkCoverUrls ?? []
  const secondaryCover = coverUrls[1] || board.secondaryCoverUrl || board.coverUrl
  const primaryCover = coverUrls[0] || board.coverUrl
  const extraCoverCount = Math.max(0, coverUrls.length - 1)
  const featuredSuffix = extraCoverCount > 0 ? ` +${extraCoverCount} other` : ''
  const authorAvatarUrl = board.authorAvatarUrl || 'https://placehold.co/64x64.png?text=HP'
  const sizeStyles = isLarge
    ? {
        secondaryCoverClass: 'left-20 bottom-20 h-32 w-26',
        primaryCoverClass: 'left-28 bottom-12 h-48 w-35',
        coverHeightClass: 'h-44 sm:h-48',
        cardWidthClass: 'w-[220px]',
        contentPaddingClass: 'px-4 pb-5 pt-4',
        titleClassName: 'text-[15px]',
      }
    : {
        secondaryCoverClass: 'left-20 bottom-12 h-30 w-24',
        primaryCoverClass: 'left-28 bottom-6 h-45 w-32',
        coverHeightClass: 'h-40',
        cardWidthClass: 'w-[200px] flex-shrink-0',
        contentPaddingClass: 'px-3 pb-4 pt-3',
        titleClassName: '',
      }
  const cardBody = (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        'w-full',
      )}
    >
      <div className={cn('relative overflow-hidden bg-white', sizeStyles.coverHeightClass)}>
        <div
          className={cn(
            'absolute rotate-10 overflow-hidden rounded-xl bg-white shadow-lg',
            sizeStyles.secondaryCoverClass,
          )}
        >
          <Image
            src={secondaryCover}
            alt={`${board.title} secondary`}
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>
        <div
          className={cn(
            'absolute rotate-13 overflow-hidden rounded-xl bg-white shadow-xl',
            sizeStyles.primaryCoverClass,
          )}
        >
          <Image src={primaryCover} alt={board.title} fill sizes="140px" className="object-cover" />
        </div>
        {board.isPrivate ? (
          <span className="absolute top-4 left-4 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white uppercase">
            Private
          </span>
        ) : null}
      </div>
      <div className={cn('space-y-1.5', sizeStyles.contentPaddingClass)}>
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-slate-200">
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
