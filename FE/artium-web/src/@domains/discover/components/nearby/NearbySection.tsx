// react
import { useState } from 'react'

// third-party
import { MapPin } from 'lucide-react'

// @domains - discover
import { ChangeLocationModal } from '@domains/discover/components/nearby/ChangeLocationModal'
import { useNearbyLocation } from '@domains/discover/state/useNearbyLocation'

export const NearbySection = () => {
  // -- state --
  const { placeName, radiusMiles, setPlaceName, setRadiusMiles } = useNearbyLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // -- derived --

  // -- handlers --
  const handleApply = (next: { location: string; radiusMiles: number }) => {
    setPlaceName(next.location)
    setRadiusMiles(next.radiusMiles)
    setIsModalOpen(false)
  }

  // -- render --
  return (
    <section className="mt-6 space-y-6">
      {/* location */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
      >
        <span className="flex items-center gap-2 text-sm text-slate-700">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-900">{placeName}</span>
          <span className="text-slate-400">|</span>
          <span>{radiusMiles} miles</span>
        </span>
        <span className="text-sm font-semibold text-blue-600">Change</span>
      </button>

      {/* map placeholder */}
      <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Nearby results will appear here.
      </div>

      {/* modal */}
      <ChangeLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={placeName}
        radiusMiles={radiusMiles}
        onApply={handleApply}
      />
    </section>
  )
}
