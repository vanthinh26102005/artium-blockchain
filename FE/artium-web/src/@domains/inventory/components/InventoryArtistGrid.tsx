// @domains - inventory
import { InventoryArtistCard } from '@domains/inventory/components/InventoryArtistCard'
import { type InventoryArtist } from '@domains/inventory/types/inventoryArtist'

type InventoryArtistGridProps = {
  artists: InventoryArtist[]
}

export const InventoryArtistGrid = ({ artists }: InventoryArtistGridProps) => {
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {artists.map((artist) => (
        <InventoryArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  )
}
