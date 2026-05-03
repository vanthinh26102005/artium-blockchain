// react
import { useEffect } from 'react'

// next
import { useRouter } from 'next/router'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { buildLoginRedirectUrl } from '@domains/auth/utils/authRedirect'

/**
 * useRequireAuth - Custom React hook
 * @returns void
 */
export const useRequireAuth = () => {
  // -- state --
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
/**
 * router - Utility function
 * @returns void
 */
  const canRenderProtected = isHydrated && isAuthenticated

  // -- effects --
  useEffect(() => {
/**
 * isHydrated - Utility function
 * @returns void
 */
    if (!router.isReady || !isHydrated || isAuthenticated) {
      return
    }

/**
 * isAuthenticated - Utility function
 * @returns void
 */
    void router.replace(buildLoginRedirectUrl(router.asPath, '/'))
  }, [isHydrated, isAuthenticated, router])

  return { canRenderProtected }
/**
 * canRenderProtected - Utility function
 * @returns void
 */
}
