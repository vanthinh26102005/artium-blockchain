import Image from 'next/image'
import Link from 'next/link'

// third-party
import { ChevronRight, ImageOff, MapPin } from 'lucide-react'

// @domains - inventory
import { type InventoryArtist } from '@domains/inventory/types/inventoryArtist'

type InventoryArtistCardProps = {
  artist: InventoryArtist
}

export const InventoryArtistCard = ({ artist }: InventoryArtistCardProps) => {
  const displayThumbnails = artist.artworkThumbnails.slice(0, 4)
  const remainingCount = Math.max(0, artist.artworkCount - displayThumbnails.length)
  const hasThumbnails = displayThumbnails.length > 0
  const overlayIndex = remainingCount > 0 ? displayThumbnails.length - 1 : -1

  return (
    <Link
      href={artist.profileHref}
      className="group block h-full rounded-[28px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200">
          {artist.avatarUrl ? (
            <Image
              src={artist.avatarUrl}
              alt={artist.name}
              width={48}
              height={48}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-300 text-base font-semibold text-slate-700">
              {artist.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
              {artist.name}
            </h3>
            {artist.isVerified ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                Verified
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm text-slate-500">
            {artist.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {artist.location}
              </span>
            ) : (
              `${artist.artworkCount} artwork${artist.artworkCount !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {hasThumbnails ? (
          <div className="grid grid-cols-2 gap-2">
            {displayThumbnails.map((url, index) => (
              <div
                key={`${artist.id}-${index}`}
                className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1280px) 180px, (min-width: 768px) 240px, 50vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                {index === overlayIndex ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    +{remainingCount} more
                  </div>
                ) : null}
              </div>
            ))}
            {displayThumbnails.length < 4
              ? Array.from({ length: 4 - displayThumbnails.length }).map((_, index) => (
                  <div
                    key={`${artist.id}-placeholder-${index}`}
                    className="aspect-square rounded-xl bg-slate-50"
                  />
                ))
              : null}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50">
            <ImageOff className="h-12 w-12 text-slate-300" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Artworks
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {artist.artworkCount.toLocaleString('en-US')}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
          View
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
