import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'

// @domains - inventory
import { type InventoryArtist } from '@domains/inventory/features/artists/types/inventoryArtist'

type InventoryArtistListProps = {
  artists: InventoryArtist[]
}

const formatFollowedAt = (value?: string | null) => {
  if (!value) {
    return 'Recently followed'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Recently followed'
  }

  return `Followed ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

export const InventoryArtistList = ({ artists }: InventoryArtistListProps) => {
  if (artists.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
        <h3 className="text-base font-semibold text-slate-900">No followed artists found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Follow artists from their profiles to keep them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={artist.profileHref}
          className="group block rounded-[28px] border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {artist.avatarUrl ? (
                  <Image
                    src={artist.avatarUrl}
                    alt={artist.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
                    {artist.name}
                  </h3>
                  {artist.isVerified ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                      Verified
                    </span>
                  ) : null}
                  {artist.isMutual ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Mutual
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-slate-900">
                  {artist.bio || `${artist.artworkCount} artwork${artist.artworkCount === 1 ? '' : 's'}`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span>{formatFollowedAt(artist.followedAt)}</span>
                  {artist.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {artist.location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-5 md:block md:text-right">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Artworks
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {artist.artworkCount.toLocaleString('en-US')}
                </p>
              </div>
              <div className="md:mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Profile
                </p>
                <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                  View artist
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
