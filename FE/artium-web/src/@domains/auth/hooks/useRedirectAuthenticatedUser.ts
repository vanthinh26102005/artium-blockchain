import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export const useRedirectAuthenticatedUser = (redirectTo = '/') => {
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const canRenderGuestPage = isHydrated && !isAuthenticated

  useEffect(() => {
    if (!router.isReady || !isHydrated || !isAuthenticated) {
      return
    }

    void router.replace(redirectTo)
  }, [router, isHydrated, isAuthenticated, redirectTo])

  return { canRenderGuestPage }
}
