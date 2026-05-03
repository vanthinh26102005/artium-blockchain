// react
import { useEffect, useRef } from 'react'

// @domains - auth
import { refreshMe, hydrateAuth } from '@domains/auth/services/authSession'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

/**
 * AuthBootstrap - React component
 * @returns React element
 */
export const AuthBootstrap = () => {
  // -- state --
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const didRefreshRef = useRef(false)
  /**
   * isHydrated - Utility function
   * @returns void
   */

  // -- effects --
  useEffect(() => {
    hydrateAuth()
    /**
     * accessToken - Utility function
     * @returns void
     */
  }, [])

  useEffect(() => {
    if (!isHydrated || didRefreshRef.current) {
      /**
       * didRefreshRef - Utility function
       * @returns void
       */
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
