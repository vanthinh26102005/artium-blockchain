import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

/**
 * useRedirectAuthenticatedUser - Custom React hook
 * @returns void
 */
export const useRedirectAuthenticatedUser = (redirectTo = '/') => {
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  /**
   * router - Utility function
   * @returns void
   */
  const canRenderGuestPage = isHydrated && !isAuthenticated

  useEffect(() => {
    if (!router.isReady || !isHydrated || !isAuthenticated) {
      /**
       * isHydrated - Utility function
       * @returns void
       */
      return
    }

    void router.replace(redirectTo)
    /**
     * isAuthenticated - Utility function
     * @returns void
     */
  }, [router, isHydrated, isAuthenticated, redirectTo])

  return { canRenderGuestPage }
}
/**
 * canRenderGuestPage - Utility function
 * @returns void
 */
