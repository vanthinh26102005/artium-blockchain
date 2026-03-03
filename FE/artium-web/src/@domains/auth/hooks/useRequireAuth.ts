// react
import { useEffect } from 'react'

// next
import { useRouter } from 'next/router'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export const useRequireAuth = () => {
  // -- state --
  const router = useRouter()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // -- effects --
  useEffect(() => {
    if (!router.isReady || !isHydrated || isAuthenticated) {
      return
    }

    const nextPath = encodeURIComponent(router.asPath || '/')
    void router.replace(`/login?next=${nextPath}`)
  }, [isHydrated, isAuthenticated, router])
}
