// react
import { useEffect } from 'react'

// next
import { useRouter } from 'next/router'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { buildLoginRedirectUrl } from '@domains/auth/utils/authRedirect'

export const useRequireAuth = () => {
  // -- state --
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const canRenderProtected = isHydrated && isAuthenticated

  // -- effects --
  useEffect(() => {
    if (!router.isReady || !isHydrated || isAuthenticated) {
      return
    }

    void router.replace(buildLoginRedirectUrl(router.asPath, '/'))
  }, [isHydrated, isAuthenticated, router])

  return { canRenderProtected }
}
