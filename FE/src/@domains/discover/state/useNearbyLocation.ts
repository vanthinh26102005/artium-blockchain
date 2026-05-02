// react
import { useState } from 'react'

const DEFAULT_LOCATION = 'Albuquerque, NM, USA'
const DEFAULT_RADIUS_MILES = 10

export const useNearbyLocation = () => {
  const [placeName, setPlaceName] = useState(DEFAULT_LOCATION)
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS_MILES)

  return {
    placeName,
    setPlaceName,
    radiusMiles,
    setRadiusMiles,
  }
}
