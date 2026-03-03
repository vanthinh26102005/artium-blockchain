// third-party
import { ImageOff } from 'lucide-react'

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
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200">
          {artist.avatarUrl ? (
            <img src={artist.avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-300 text-base font-semibold text-slate-700">
              {artist.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">{artist.name}</h3>
            {artist.isVerified ? (
              <img src="/images/discover/verified-icon.svg" alt="Verified" className="h-4 w-4" />
            ) : null}
          </div>
          <p className="text-base text-slate-500">
            {artist.artworkCount} artwork{artist.artworkCount !== 1 ? 's' : ''}
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
                <img src={url} alt="" className="h-full w-full object-cover" />
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
    </div>
  )
}
