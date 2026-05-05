import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export const useRedirectAuthenticatedUser = (redirectTo = '/', disabled = false) => {
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const canRenderGuestPage = isHydrated && (disabled || !isAuthenticated)

  useEffect(() => {
    if (disabled || !router.isReady || !isHydrated || !isAuthenticated) {
      return
    }

    void router.replace(redirectTo)
  }, [disabled, router, isHydrated, isAuthenticated, redirectTo])

  return { canRenderGuestPage }
}
