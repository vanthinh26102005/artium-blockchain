// third-party
import { Heart, MessageCircle, Play } from 'lucide-react'

// @domains - discover
import { type DiscoverMoment } from '@domains/discover/mock/mockMoments'

type MomentCardProps = {
  moment: DiscoverMoment
  onClick?: (moment: DiscoverMoment) => void
}

/**
 * getMomentThumbnail - Utility function
 * @returns void
 */
const getMomentThumbnail = (moment: DiscoverMoment) => {
  for (const content of moment.contents) {
    if (content.video?.processedThumb) {
      return content.video.processedThumb
/**
 * content - Utility function
 * @returns void
 */
    }
    if (content.image?.imageMedium) {
      return content.image.imageMedium
    }
    if (content.artwork?.imageMedium) {
      return content.artwork.imageMedium
    }
  }

  return 'https://picsum.photos/seed/moment-fallback/600/760'
}

export const MomentCard = ({ moment, onClick }: MomentCardProps) => {
  // -- state --

  // -- derived --
  const thumbnail = getMomentThumbnail(moment)

/**
 * MomentCard - React component
 * @returns React element
 */
  // -- handlers --

  // -- render --
  // -- render --
  return (
    <article
      onClick={() => onClick?.(moment)}
/**
 * thumbnail - Utility function
 * @returns void
 */
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)] ${onClick ? 'cursor-pointer transition-transform hover:scale-[1.02]' : ''}`}
    >
      {/* thumbnail */}
      <div className="relative aspect-4/5 w-full bg-slate-100">
        <img
          src={thumbnail}
          alt={moment.caption}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        {/* play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <Play className="h-5 w-5 text-slate-800" />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="space-y-2 px-4 pt-3 pb-4">
        {/* header */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          {/* user */}
          <div className="flex items-center gap-2">
            <img
              src={moment.user.avatarUrl}
              alt={moment.user.fullName}
              className="h-6 w-6 rounded-full border border-white object-cover"
            />
            <span className="font-medium">@{moment.user.username}</span>
            {moment.user.isVerified ? (
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            ) : null}
          </div>

          {/* stats */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {/* likes */}
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {moment.stats.likes}
            </span>

            {/* comments */}
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {moment.stats.comments}
            </span>
          </div>
        </div>

        {/* caption */}
        <p
          className="text-sm text-slate-700"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {moment.caption}
        </p>
      </div>
    </article>
  )
}
