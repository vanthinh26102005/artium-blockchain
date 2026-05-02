// next
import Image from 'next/image'
import Link from 'next/link'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileArtwork, ProfileUser } from '@domains/profile/types'

type ProfileArtworkCardProps = {
  artwork: ProfileArtwork
  artist: ProfileUser
  showPrice?: boolean
  mediaClassName?: string
}

export const ProfileArtworkCard = ({
  artwork,
  artist,
  showPrice = true,
  mediaClassName,
}: ProfileArtworkCardProps) => {
  // -- derived --
  const isSold = Boolean(artwork.isSold)
  const aspectRatio = '4 / 4'

  // -- render --
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
      <Link
        href={`/artworks/${artwork.id}`}
        aria-label={`View artwork ${artwork.title}`}
        className={cn(
          'relative block w-full cursor-pointer bg-slate-100 transition-colors group-hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none',
          mediaClassName,
        )}
        style={{ aspectRatio }}
      >
        <div className="absolute inset-0 p-6">
          <div className="relative h-full w-full">
            <Image
              src={artwork.coverUrl}
              alt={artwork.title}
              fill
              sizes="(min-width: 1280px) 10rem, (min-width: 1024px) 10rem, (min-width: 640px) 45vw, 90vw"
              className="object-contain transition-transform duration-200 ease-out group-hover:scale-[1.01]"
            />
          </div>
        </div>
      </Link>

      <div className="space-y-3 px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link
            href={`/profile/${artist.username}`}
            className="group/artist inline-flex items-center gap-2 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-200">
              <Image
                src={artist.avatarUrl}
                alt={artist.displayName}
                fill
                sizes="28px"
                className="object-cover"
              />
            </span>
            <span className="font-semibold text-slate-700 transition-colors group-hover/artist:text-slate-900">
              {artist.displayName}
            </span>
          </Link>
        </div>

        <h4 className="text-base font-semibold text-slate-900">
          <Link
            href={`/artworks/${artwork.id}`}
            className="line-clamp-2 block cursor-pointer transition-colors hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {artwork.title}
          </Link>
        </h4>

        {showPrice ? (
          isSold ? (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              SOLD
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {artwork.priceLabel}
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
