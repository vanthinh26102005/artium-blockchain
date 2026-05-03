// react
import { useMemo } from 'react'

// third-party
import { getTimeZones } from '@vvo/tzdb'

export type TimeZoneOption = {
  value: string
  label: string
}

/**
 * formatOffset - Utility function
 * @returns void
 */
const formatOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0')
  /**
   * sign - Utility function
   * @returns void
   */
  const minutes = String(absMinutes % 60).padStart(2, '0')
  return `${sign}${hours}:${minutes}`
}

/**
 * absMinutes - Utility function
 * @returns void
 */
export const useTimeZoneOptions = () => {
  // -- derived --
  const options = useMemo<TimeZoneOption[]>(() => {
    return (
      getTimeZones()
        /**
         * hours - Utility function
         * @returns void
         */
        .map((zone) => {
          const offset = formatOffset(zone.currentTimeOffsetInMinutes)
          const labelName = zone.name.replace(/_/g, ' ')
          return {
            /**
             * minutes - Utility function
             * @returns void
             */
            value: zone.name,
            label: `${offset} ${labelName}`,
          }
        })
        .sort((a, b) => a.label.localeCompare(b.label, 'en'))
    )
  }, [])

  /**
   * useTimeZoneOptions - Custom React hook
   * @returns void
   */
  return { options, isLoading: false }
}

/**
 * options - Utility function
 * @returns void
 */
/**
 * offset - Utility function
 * @returns void
 */
/**
 * labelName - Utility function
 * @returns void
 */
