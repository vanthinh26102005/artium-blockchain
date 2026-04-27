// react
import { useEffect, useRef } from 'react'

// @domains - auth
import { refreshMe, hydrateAuth } from '@domains/auth/services/authSession'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export const AuthBootstrap = () => {
  // -- state --
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const didRefreshRef = useRef(false)

  // -- effects --
  useEffect(() => {
    hydrateAuth()
  }, [])

  useEffect(() => {
    if (!isHydrated || didRefreshRef.current) {
      return
    }

    didRefreshRef.current = true

    if (!accessToken) {
      return
    }

    void refreshMe()
  }, [isHydrated, accessToken])

  // -- render --
  return null
}
