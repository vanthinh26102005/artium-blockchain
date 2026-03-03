// react
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

// third-party
import { Search, X } from 'lucide-react'

const radiusOptions = [1, 5, 10, 20, 50, 100]
const locationSuggestions = [
  'Albuquerque, NM, USA',
  'Santa Fe, NM, USA',
  'Denver, CO, USA',
  'Phoenix, AZ, USA',
  'Austin, TX, USA',
  'Portland, OR, USA',
]

type ChangeLocationModalProps = {
  isOpen: boolean
  onClose: () => void
  location: string
  radiusMiles: number
  onApply: (next: { location: string; radiusMiles: number }) => void
}

export const ChangeLocationModal = ({
  isOpen,
  onClose,
  location,
  radiusMiles,
  onApply,
}: ChangeLocationModalProps) => {
  // -- state --
  const [isMounted, setIsMounted] = useState(false)
  const [locationInput, setLocationInput] = useState(location)
  const [selectedLocation, setSelectedLocation] = useState(location)
  const [radius, setRadius] = useState(radiusMiles)

  // -- derived --
  const visibleSuggestions = useMemo(() => {
    const value = locationInput.trim().toLowerCase()
    if (!value) {
      return locationSuggestions
    }

    return locationSuggestions.filter((item) => item.toLowerCase().includes(value))
  }, [locationInput])

  // -- handlers --
  const handleSelectLocation = (value: string) => {
    setLocationInput(value)
    setSelectedLocation(value)
  }

  const handleApply = () => {
    const nextLocation = locationInput.trim() || selectedLocation || location
    onApply({ location: nextLocation, radiusMiles: radius })
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setLocationInput(location)
    setSelectedLocation(location)
    setRadius(radiusMiles)
  }, [isOpen, location, radiusMiles])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // -- render --
  if (!isOpen || !isMounted) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Change Location</h2>
            <p className="mt-1 text-sm text-slate-500">Update your city and distance radius.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* form */}
        <div className="mt-6 space-y-4">
          {/* location */}
          <label className="text-sm font-medium text-slate-700">Location</label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              placeholder="Search for a city"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* suggestions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSelectLocation('Current location (mock)')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700"
            >
              Use my current location
            </button>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {visibleSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectLocation(item)}
                  className={`w-full rounded-xl border px-4 py-2 text-left text-sm transition ${
                    item === selectedLocation
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* radius */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Radius</label>
            <select
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
            >
              {radiusOptions.map((option) => (
                <option key={option} value={option}>
                  {option} miles
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
