// next
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Play, Pencil, Trash2 } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileMoment } from '@domains/profile/types'

type MomentsSectionProps = {
  moments: ProfileMoment[]
  title?: string
  subtitle?: string
  limit?: number
  className?: string
  showSeeAll?: boolean
  seeAllHref?: string
  detailBaseHref?: string
  isOwner?: boolean
  onEditMoment?: (moment: ProfileMoment) => void
  onDeleteMoment?: (moment: ProfileMoment) => void
}

export const MomentsSection = ({
  moments,
  title = 'Moments',
  subtitle = 'Studio updates and WIP shots',
  limit,
  className,
  showSeeAll = true,
  seeAllHref,
  detailBaseHref,
  isOwner = false,
  onEditMoment,
  onDeleteMoment,
}: MomentsSectionProps) => {
  const visibleMoments = limit ? moments.slice(0, limit) : moments

  return (
    <section className={cn(className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
            {title}
          </h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {showSeeAll ? (
          seeAllHref ? (
            <Link
              href={seeAllHref}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              SEE ALL &gt;
            </Link>
          ) : (
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              SEE ALL &gt;
            </button>
          )
        ) : null}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-5">
        {visibleMoments.map((moment) => {
          const href = detailBaseHref ? `${detailBaseHref}/${moment.id}` : undefined
          const cardContent = (
            <>
              <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-100">
                <Image
                  src={moment.imageUrl}
                  alt={moment.title}
                  fill
                  sizes="(min-width: 1280px) 220px, (min-width: 1024px) 200px, (min-width: 640px) 50vw, 90vw"
                  className="object-cover"
                />
                {moment.mediaType === 'video' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm">
                      <Play className="h-4 w-4 text-slate-900" />
                    </div>
                  </div>
                ) : null}
                {/* Owner controls overlay */}
                {isOwner && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {onEditMoment && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onEditMoment(moment)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-blue-600"
                        aria-label="Edit moment"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDeleteMoment && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onDeleteMoment(moment)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-red-600"
                        aria-label="Delete moment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-[15px] w-[15px] flex-shrink-0" />
                    <span className="flex items-center text-[13px] leading-none tracking-wide">
                      {moment.likes}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-[15px] w-[15px] flex-shrink-0" />
                    <span className="flex items-center text-[13px] leading-none tracking-wide">
                      {moment.comments}
                    </span>
                  </span>
                </div>
                <p className="line-clamp-2 text-sm leading-snug text-slate-800">{moment.title}</p>
              </div>
            </>
          )

          if (href) {
            return (
              <Link
                key={moment.id}
                href={href}
                className="group max-w-[220px] min-w-[200px] flex-shrink-0 rounded-xl border border-slate-200 bg-white transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
              >
                {cardContent}
              </Link>
            )
          }

          return (
            <div
              key={moment.id}
              className="group max-w-[220px] min-w-[200px] flex-shrink-0 rounded-xl border border-slate-200 bg-white transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
            >
              {cardContent}
            </div>
          )
        })}
      </div>
    </section>
  )
}
