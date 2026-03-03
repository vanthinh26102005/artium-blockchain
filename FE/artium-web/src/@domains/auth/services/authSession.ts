// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

const hydrateAuth = () => useAuthStore.getState().hydrateAuth()
const refreshMe = () => useAuthStore.getState().refreshMe()
const logout = () => useAuthStore.getState().logout()

export { hydrateAuth, refreshMe, logout }
