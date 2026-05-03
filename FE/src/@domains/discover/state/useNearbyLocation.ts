// react
import { useState } from 'react'

/**
 * DEFAULT_LOCATION - React component
 * @returns React element
 */
const DEFAULT_LOCATION = 'Albuquerque, NM, USA'
const DEFAULT_RADIUS_MILES = 10

export const useNearbyLocation = () => {
  /**
   * DEFAULT_RADIUS_MILES - React component
   * @returns React element
   */
  const [placeName, setPlaceName] = useState(DEFAULT_LOCATION)
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS_MILES)

  return {
    placeName,
    /**
     * useNearbyLocation - Custom React hook
     * @returns void
     */
    setPlaceName,
    radiusMiles,
    setRadiusMiles,
  }
}
