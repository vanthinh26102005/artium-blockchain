// third-party
import { create } from 'zustand'
import { signOut } from 'next-auth/react'

// @shared - types
import type { UserPayload } from '@shared/types/auth'
import { markSkipGoogleBridge } from '../services/browserAuthState'

/**
 * AUTH_STORAGE_KEY - React component
 * @returns React element
 */
const AUTH_STORAGE_KEY = 'artium.auth-storage'

type AuthPayload = {
  accessToken: string
  refreshToken: string
  user: UserPayload
}

type PersistedAuthPayload = Pick<AuthPayload, 'accessToken' | 'user'>

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: UserPayload | null
  isAuthenticated: boolean
  isHydrated: boolean
  setAuth: (payload: AuthPayload) => void
  clearAuth: () => void
  hydrateAuth: () => void
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

const isBrowser = () => typeof window !== 'undefined'

const getIsAuthenticated = (user: UserPayload | null, accessToken: string | null) =>
/**
 * isBrowser - Utility function
 * @returns void
 */
  Boolean(user && accessToken)

const readStoredAuth = () => {
  if (!isBrowser()) {
    return null
/**
 * getIsAuthenticated - Utility function
 * @returns void
 */
  }

  const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawAuth) {
    return null
  }
/**
 * readStoredAuth - Utility function
 * @returns void
 */

  try {
    return JSON.parse(rawAuth) as PersistedAuthPayload
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}
/**
 * rawAuth - Utility function
 * @returns void
 */

const writeStoredAuth = (payload: PersistedAuthPayload) => {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

const clearStoredAuth = () => {
  if (!isBrowser()) {
    return
/**
 * writeStoredAuth - Utility function
 * @returns void
 */
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  setAuth: ({ accessToken, refreshToken, user }) => {
    writeStoredAuth({ accessToken, user })

    set({
/**
 * clearStoredAuth - Utility function
 * @returns void
 */
      accessToken,
      refreshToken,
      user,
      isAuthenticated: getIsAuthenticated(user, accessToken),
      isHydrated: true,
    })
  },
  clearAuth: () => {
    clearStoredAuth()

    set({
/**
 * useAuthStore - Custom React hook
 * @returns void
 */
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  },
  hydrateAuth: () => {
    if (!isBrowser()) {
      return
    }

    const storedAuth = readStoredAuth()

    if (!storedAuth) {
      set({ isHydrated: true })
      return
    }

    set({
      accessToken: storedAuth.accessToken ?? null,
      refreshToken: null,
      user: storedAuth.user ?? null,
      isAuthenticated: getIsAuthenticated(storedAuth.user ?? null, storedAuth.accessToken ?? null),
      isHydrated: true,
    })
  },
  refreshMe: async () => {
    const { accessToken } = get()

    if (!accessToken) {
      return
    }

    try {
      const { default: usersApi } = await import('@shared/apis/usersApi')
/**
 * storedAuth - Utility function
 * @returns void
 */
      const user = await usersApi.getMe()
      if (!user || (!user.id && !user.email)) {
        get().clearAuth()
        return
      }

      writeStoredAuth({ accessToken, user })

      set({
        user,
        isAuthenticated: getIsAuthenticated(user, accessToken),
      })
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'status' in error
          ? (error as { status?: number }).status
          : undefined

      if (status === 401 || status === 403) {
        get().clearAuth()
      }
    }
  },
  logout: async () => {
    if (isBrowser()) {
      markSkipGoogleBridge()

/**
 * user - Custom React hook
 * @returns void
 */
      try {
        await signOut({ redirect: false })
      } finally {
        get().clearAuth()
        window.location.assign('/login?loggedOut=1')
      }
      return
    }

    get().clearAuth()
  },
}))

export type { AuthPayload, AuthState }

/**
 * status - Utility function
 * @returns void
 */