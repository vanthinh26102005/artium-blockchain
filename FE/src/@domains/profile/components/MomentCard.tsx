// next
import Image from 'next/image'
import Link from 'next/link'

// third-party
import { Heart, MessageCircle, Play } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { Moment } from '@domains/profile/constants/moments'

type MomentCardProps = {
  moment: Moment
  hrefBase?: string
  className?: string
  mediaClassName?: string
}

export const MomentCard = ({ moment, hrefBase, className, mediaClassName }: MomentCardProps) => {
  const thumbnail = moment.type === 'video' ? moment.posterUrl || moment.mediaUrl : moment.mediaUrl
  const defaultBase = `/profile/${moment.author.username}/moments`
  const href = hrefBase ? `${hrefBase}/${moment.id}` : `${defaultBase}/${moment.id}`

  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className={cn('relative aspect-[4/5] overflow-hidden bg-slate-100', mediaClassName)}>
          <Image
            src={thumbnail}
            alt={moment.caption}
            fill
            sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {moment.type === 'video' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                <Play className="h-5 w-5 text-slate-900" />
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-1 leading-none">
              <Heart className="h-5 w-5" />
              {moment.likes ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 leading-none">
              <MessageCircle className="h-5 w-5" />
              {moment.comments ?? 0}
            </span>
          </div>
          <p className={cn('line-clamp-2 text-sm leading-snug text-slate-700')}>{moment.caption}</p>
        </div>
      </div>
    </Link>
  )
}
