import { useSyncExternalStore } from 'react'

export interface MockUser {
  username: string
  avatarUrl: string
}

interface MockAuthState {
  isLoggedIn: boolean
  user: MockUser
}

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
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => authState

const setAuthState = (nextState: Partial<MockAuthState>) => {
  authState = { ...authState, ...nextState }
  listeners.forEach((listener) => listener())
}

export const login = () => setAuthState({ isLoggedIn: true })
export const logout = () => setAuthState({ isLoggedIn: false })

export const useMockAuth = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    ...state,
    login,
    logout,
  }
}
