// third-party
import { create } from 'zustand'
import { signOut } from 'next-auth/react'

// @shared - types
import type { UserPayload } from '@shared/types/auth'
import { markSkipGoogleBridge } from '../services/browserAuthState'

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
  isLoggingOut: boolean
  setAuth: (payload: AuthPayload) => void
  clearAuth: () => void
  hydrateAuth: () => void
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

const isBrowser = () => typeof window !== 'undefined'

const getIsAuthenticated = (user: UserPayload | null, accessToken: string | null) =>
  Boolean(user && accessToken)

const readStoredAuth = () => {
  if (!isBrowser()) {
    return null
  }

  const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawAuth) {
    return null
  }

  try {
    return JSON.parse(rawAuth) as PersistedAuthPayload
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

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
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

const runNextAuthSignOut = async () => {
  const signOutTask = signOut({ redirect: false }).catch(() => undefined)
  const timeoutTask = new Promise<void>((resolve) => {
    window.setTimeout(resolve, 2500)
  })

  await Promise.race([signOutTask, timeoutTask])
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoggingOut: false,
  setAuth: ({ accessToken, refreshToken, user }) => {
    writeStoredAuth({ accessToken, user })

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: getIsAuthenticated(user, accessToken),
      isHydrated: true,
      isLoggingOut: false,
    })
  },
  clearAuth: () => {
    clearStoredAuth()

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoggingOut: false,
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
    if (get().isLoggingOut) {
      return
    }

    if (isBrowser()) {
      markSkipGoogleBridge()
      clearStoredAuth()

      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isHydrated: true,
        isLoggingOut: true,
      })

      await runNextAuthSignOut()
      window.location.replace('/login?loggedOut=1')
      return
    }

    get().clearAuth()
  },
}))

export type { AuthPayload, AuthState }
