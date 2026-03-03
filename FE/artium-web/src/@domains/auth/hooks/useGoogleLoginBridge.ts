// react
import { useEffect, useRef, useState } from 'react'

// next
import { useRouter } from 'next/router'

// third-party
import { signOut, useSession } from 'next-auth/react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type GoogleBridgeState = {
  isLoading: boolean
  error: string | null
}

type SessionWithIdToken = {
  idToken?: string
}

const getNextPath = (next?: string | string[]) => {
  if (typeof next === 'string' && next.trim().length > 0) {
    return next
  }

  return '/'
}

export const useGoogleLoginBridge = (): GoogleBridgeState => {
  // -- state --
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasHandledRef = useRef(false)

  // -- derived --
  const idToken = (session as SessionWithIdToken | null)?.idToken

  // -- effects --
  useEffect(() => {
    if (!router.isReady || status !== 'authenticated' || hasHandledRef.current) {
      return
    }

    if (!idToken || typeof idToken !== 'string') {
      return
    }

    hasHandledRef.current = true
    setIsLoading(true)

    const bridgeLogin = async () => {
      try {
        const response = await usersApi.loginWithGoogle({ idToken })
        setAuth(response)
        const nextPath = getNextPath(router.query.next)
        await router.replace(nextPath)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Google login failed.'
        setError(message)
        await signOut({ redirect: false })
      } finally {
        setIsLoading(false)
      }
    }

    void bridgeLogin()
  }, [status, idToken, router, setAuth])

  return { isLoading, error }
}
