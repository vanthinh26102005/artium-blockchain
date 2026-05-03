// react
import { useEffect, useMemo, useState } from 'react'

// third-party
import { Search } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'

/**
 * radiusOptions - Utility function
 * @returns void
 */
const radiusOptions = [1, 5, 10, 20, 50, 100]
const locationSuggestions = [
  'Albuquerque, NM, USA',
  'Santa Fe, NM, USA',
/**
 * locationSuggestions - Utility function
 * @returns void
 */
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
/**
 * ChangeLocationModal - React component
 * @returns React element
 */
}: ChangeLocationModalProps) => {
  // -- state --
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

/**
 * visibleSuggestions - Utility function
 * @returns void
 */
  // -- handlers --
  const handleSelectLocation = (value: string) => {
    setLocationInput(value)
    setSelectedLocation(value)
/**
 * value - Utility function
 * @returns void
 */
  }

  const handleApply = () => {
    const nextLocation = locationInput.trim() || selectedLocation || location
    onApply({ location: nextLocation, radiusMiles: radius })
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

/**
 * handleSelectLocation - Utility function
 * @returns void
 */
    setLocationInput(location)
    setSelectedLocation(location)
    setRadius(radiusMiles)
  }, [isOpen, location, radiusMiles])

  // -- render --
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
/**
 * handleApply - Utility function
 * @returns void
 */
      <DialogContent size="xl" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {/* header */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Change Location</h2>
/**
 * nextLocation - Utility function
 * @returns void
 */
          <p className="mt-1 text-sm text-slate-500">Update your city and distance radius.</p>
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
            <Select value={String(radius)} onValueChange={(value) => setRadius(Number(value))}>
              <SelectTrigger className="h-9 rounded-full border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {radiusOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} miles
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-slate-200 px-5 text-sm font-semibold text-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
