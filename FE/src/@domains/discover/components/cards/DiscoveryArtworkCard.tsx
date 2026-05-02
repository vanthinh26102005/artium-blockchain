// next
import { useRouter } from 'next/router'

// @domains - discover
import { type DiscoverArtwork } from '@domains/discover/mock/mockArtworks'

type DiscoveryArtworkCardProps = {
  artwork: DiscoverArtwork
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const DiscoveryArtworkCard = ({ artwork }: DiscoveryArtworkCardProps) => {
  // -- state --
  const router = useRouter()

  // -- derived --
  const priceLabel = artwork.isSold ? 'Sold' : priceFormatter.format(artwork.price)
  const priceDotClass = artwork.isSold ? 'bg-slate-400' : 'bg-blue-500'

  // Calculate dynamic height based on image dimensions if available
  const imageHeight =
    artwork.imageMediumHeight && artwork.imageMediumWidth
      ? (artwork.imageMediumHeight / artwork.imageMediumWidth) * 160 // 160 is columnWidth
      : 160 // fallback to square

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
        <div className="w-full bg-slate-100" style={{ height: imageHeight }}>
          <img
            src={artwork.imageMedium}
            alt={artwork.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        {/* details */}
        <div className="space-y-3 px-4 pt-4 pb-5">
          {/* creator */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <img
              src={
                artwork.creator.coverImage ??
                `https://picsum.photos/seed/avatar-${artwork.id}/48/48`
              }
              alt={artwork.creator.fullName}
              className="h-7 w-7 rounded-full border border-white object-cover"
            />
            <span className="font-semibold text-slate-700">{artwork.creator.fullName}</span>
            <img src="/images/discover/verified-icon.svg" alt="Verified" className="h-4 w-4" />
          </div>

          {/* title */}
          <h3
            className="text-base font-semibold text-slate-800"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {artwork.title}
          </h3>

          {/* price */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
            <span className={`h-2 w-2 rounded-full ${priceDotClass}`} />
            {priceLabel}
          </div>
        </div>
      </div>
    </button>
  )
}
