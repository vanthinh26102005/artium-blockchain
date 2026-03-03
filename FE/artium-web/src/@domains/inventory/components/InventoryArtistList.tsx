// @domains - inventory
import { type InventoryArtist } from '@domains/inventory/types/inventoryArtist'

type InventoryArtistListProps = {
  artists: InventoryArtist[]
}

export const InventoryArtistList = ({ artists }: InventoryArtistListProps) => {
  if (artists.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white py-10 text-center text-base text-slate-500">
        No artists found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {artists.map((artist) => (
        <div
          key={artist.id}
          className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200">
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-300 text-base font-semibold text-slate-700">
                  {artist.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-slate-900">{artist.name}</p>
                {artist.isVerified ? (
                  <img
                    src="/images/discover/verified-icon.svg"
                    alt="Verified"
                    className="h-4 w-4"
                  />
                ) : null}
              </div>
              <p className="text-base text-slate-500">
                {artist.artworkCount} artwork{artist.artworkCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
