// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

/**
 * hydrateAuth - Utility function
 * @returns void
 */
const hydrateAuth = () => useAuthStore.getState().hydrateAuth()
const refreshMe = () => useAuthStore.getState().refreshMe()
const logout = () => useAuthStore.getState().logout()

/**
 * refreshMe - Utility function
 * @returns void
 */
export { hydrateAuth, refreshMe, logout }

/**
 * logout - Utility function
 * @returns void
 */