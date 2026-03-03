// next
import { useRouter } from 'next/router'

// @domains - discover
import { type TopPicksArtwork } from '@domains/discover/mock/mockTopPicksArtworks'

type ArtworkThumbnailCardProps = {
  artwork: TopPicksArtwork
}

export const ArtworkThumbnailCard = ({ artwork }: ArtworkThumbnailCardProps) => {
  // -- state --
  const router = useRouter()

  // -- derived --

  // -- handlers --
  const handleClick = () => {
    void router.push(`/artworks/${artwork.id}`)
  }

  // -- render --
  return (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full text-left focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
      aria-label={`View artwork ${artwork.title}`}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
        {/* media */}
        <div className="relative w-full bg-slate-100" style={{ height: artwork.height }}>
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />

          {/* trending badge */}
          {artwork.badges.trending && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold tracking-wide text-green-700 uppercase">
                Trending
              </span>
            </div>
          )}
        </div>

        {/* details */}
        <div className="space-y-3 px-4 pt-3 pb-4">
          {/* price */}
          {artwork.badges.price ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {artwork.badges.price}
            </div>
          ) : null}

          {/* creator */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <img
              src={artwork.avatarUrl}
              alt={artwork.username}
              className="h-6 w-6 rounded-full border border-white object-cover"
            />
            <span className="font-medium">@{artwork.username}</span>
            <img src="/images/discover/verified-icon.svg" alt="Verified" className="h-4 w-4" />
          </div>

          {/* title */}
          <h3
            className="text-base font-semibold text-slate-900"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {artwork.title}
          </h3>
        </div>
      </div>
    </button>
  )
}
