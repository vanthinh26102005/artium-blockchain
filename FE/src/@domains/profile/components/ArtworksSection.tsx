// next
import Image from 'next/image'
import Link from 'next/link'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileArtwork } from '@domains/profile/types'

type ArtworksSectionProps = {
  artworks: ProfileArtwork[]
  title?: string
  subtitle?: string
  limit?: number
  className?: string
  showSeeAll?: boolean
  seeAllHref?: string
  isOwner?: boolean
}

/**
 * ArtworksSection - React component
 * @returns React element
 */
export const ArtworksSection = ({
  artworks,
  title = 'Artworks',
  subtitle = 'Recent releases',
  limit,
  className,
  showSeeAll = true,
  seeAllHref,
  isOwner = false,
}: ArtworksSectionProps) => {
  const visibleArtworks = limit ? artworks.slice(0, limit) : artworks

  return (
/**
 * visibleArtworks - Utility function
 * @returns void
 */
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

      <div className="flex gap-4 overflow-x-auto pb-2">
        {visibleArtworks.map((artwork) => {
          // Determine button state: owner sees "Edit", sold shows "See details", available shows "Buy now"
          const isSold = artwork.isSold
          const showBuyButton = !isOwner && !isSold
          const buttonLabel = isOwner ? 'Edit artwork' : isSold ? 'See details' : 'Buy now'
          const buttonHref = isOwner
            ? `/inventory/artworks/${artwork.id}/edit`
            : `/artworks/${artwork.id}`
/**
 * isSold - Utility function
 * @returns void
 */

          return (
            <div
              key={artwork.id}
/**
 * showBuyButton - Utility function
 * @returns void
 */
              className="group flex w-[260px] shrink-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link
                href={`/artworks/${artwork.id}`}
/**
 * buttonLabel - Utility function
 * @returns void
 */
                aria-label={`View artwork ${artwork.title}`}
                className="relative block h-[320px] w-full overflow-hidden rounded-t-xl bg-slate-100 transition-colors group-hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="absolute inset-0 p-6">
/**
 * buttonHref - Utility function
 * @returns void
 */
                  <div className="relative h-full w-full">
                    <Image
                      src={artwork.coverUrl}
                      alt={artwork.title}
                      fill
                      sizes="(min-width: 1280px) 260px, (min-width: 1024px) 240px, (min-width: 640px) 60vw, 90vw"
                      className="object-contain transition-transform duration-200 ease-out group-hover:scale-[1.01]"
                      priority={false}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    'absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow',
                    isSold ? 'bg-red-50 text-red-600' : 'bg-white/90 text-slate-900',
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      isSold ? 'bg-red-500' : 'bg-blue-500',
                    )}
                  />
                  <span className="leading-none">{isSold ? 'SOLD' : artwork.priceLabel}</span>
                </span>
              </Link>
              <div className="flex flex-1 flex-col space-y-2 p-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900">
                    <Link
                      href={`/artworks/${artwork.id}`}
                      className="block cursor-pointer truncate transition-colors hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {artwork.title}
                    </Link>
                  </h4>
                  <p className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="flex-shrink truncate">{artwork.medium}</span>
                    <span className="shrink-0 text-slate-400">&middot;</span>
                    <span className="shrink-0 truncate text-right">{artwork.dimensions}</span>
                  </p>
                </div>
                <div className="mt-auto pt-2">
                  <Link
                    href={buttonHref}
                    className={cn(
                      'block w-full cursor-pointer rounded-full border px-3 py-2 text-center text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                      showBuyButton
                        ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/40'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-300/70',
                    )}
                  >
                    {buttonLabel}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
