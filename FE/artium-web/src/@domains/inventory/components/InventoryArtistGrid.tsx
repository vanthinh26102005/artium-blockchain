// @domains - inventory
import { InventoryArtistCard } from '@domains/inventory/components/InventoryArtistCard'
import { type InventoryArtist } from '@domains/inventory/types/inventoryArtist'

type InventoryArtistGridProps = {
  artists: InventoryArtist[]
}

export const InventoryArtistGrid = ({ artists }: InventoryArtistGridProps) => {
  if (artists.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white py-10 text-center text-base text-slate-500">
        No artists found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {artists.map((artist) => (
        <InventoryArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  )
}
