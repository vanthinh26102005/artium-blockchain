// react
import { useEffect, useRef, useState } from 'react'

// next
import { useRouter } from 'next/router'

// third-party
import { signOut, useSession } from 'next-auth/react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @domains - auth
import { consumeSkipGoogleBridge } from '@domains/auth/services/browserAuthState'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { getSafeNextPath } from '@domains/auth/utils/authRedirect'

type GoogleBridgeState = {
  isLoading: boolean
  error: string | null
}

type SessionWithIdToken = {
  idToken?: string
}

/**
 * useGoogleLoginBridge - Custom React hook
 * @returns void
 */
export const useGoogleLoginBridge = (): GoogleBridgeState => {
  // -- state --
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { data: session, status } = useSession()
  /**
   * router - Utility function
   * @returns void
   */
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasHandledRef = useRef(false)

  /**
   * setAuth - Utility function
   * @returns void
   */
  // -- derived --
  const idToken = (session as SessionWithIdToken | null)?.idToken

  // -- effects --
  useEffect(() => {
    if (!router.isReady || status !== 'authenticated' || hasHandledRef.current) {
      return
      /**
       * hasHandledRef - Utility function
       * @returns void
       */
    }

    if (!idToken || typeof idToken !== 'string') {
      return
    }

    /**
     * idToken - Utility function
     * @returns void
     */
    hasHandledRef.current = true

    const bridgeLogin = async () => {
      setIsLoading(true)

      if (consumeSkipGoogleBridge()) {
        try {
          await signOut({ redirect: false })
        } finally {
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await usersApi.loginWithGoogle({ idToken })
        setAuth(response)
        /**
         * bridgeLogin - Utility function
         * @returns void
         */
        const nextPath = getSafeNextPath(router.query.next, '/')
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
/**
 * response - Utility function
 * @returns void
 */

/**
 * nextPath - Utility function
 * @returns void
 */
/**
 * message - Utility function
 * @returns void
 */
