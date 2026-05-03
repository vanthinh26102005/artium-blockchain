import { useSyncExternalStore } from 'react'

export interface MockUser {
  username: string
  avatarUrl: string
}

interface MockAuthState {
  isLoggedIn: boolean
  user: MockUser
}

/**
 * defaultUser - Utility function
 * @returns void
 */
const defaultUser: MockUser = {
  username: 'artiumfan',
  avatarUrl: '/images/logo-dark-mode.png',
}

let authState: MockAuthState = {
  isLoggedIn: false,
  user: defaultUser,
}

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  /**
   * listeners - Utility function
   * @returns void
   */
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => authState
/**
 * subscribe - Utility function
 * @returns void
 */

const setAuthState = (nextState: Partial<MockAuthState>) => {
  authState = { ...authState, ...nextState }
  listeners.forEach((listener) => listener())
}

export const login = () => setAuthState({ isLoggedIn: true })
export const logout = () => setAuthState({ isLoggedIn: false })
/**
 * getSnapshot - Utility function
 * @returns void
 */

export const useMockAuth = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    /**
     * setAuthState - Utility function
     * @returns void
     */
    ...state,
    login,
    logout,
  }
}

/**
 * login - Utility function
 * @returns void
 */
/**
 * logout - Utility function
 * @returns void
 */
/**
 * useMockAuth - Custom React hook
 * @returns void
 */
/**
 * state - Utility function
 * @returns void
 */
