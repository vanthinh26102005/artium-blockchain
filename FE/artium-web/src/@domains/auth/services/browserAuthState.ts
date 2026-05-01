const PASSWORD_RESET_SESSION_KEY = 'artium.auth.password-reset'
const SKIP_GOOGLE_BRIDGE_KEY = 'artium.auth.skip-google-bridge'

type PasswordResetSession = {
  email: string
  resetToken: string
}

const isBrowser = () => typeof window !== 'undefined'

export const readPasswordResetSession = (): PasswordResetSession | null => {
  if (!isBrowser()) {
    return null
  }

  const rawSession = window.sessionStorage.getItem(PASSWORD_RESET_SESSION_KEY)
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as PasswordResetSession
  } catch {
    window.sessionStorage.removeItem(PASSWORD_RESET_SESSION_KEY)
    return null
  }
}

export const writePasswordResetSession = (payload: PasswordResetSession) => {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(PASSWORD_RESET_SESSION_KEY, JSON.stringify(payload))
}

export const clearPasswordResetSession = () => {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(PASSWORD_RESET_SESSION_KEY)
}

export const markSkipGoogleBridge = () => {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(SKIP_GOOGLE_BRIDGE_KEY, '1')
}

export const consumeSkipGoogleBridge = () => {
  if (!isBrowser()) {
    return false
  }

  const shouldSkipBridge = window.sessionStorage.getItem(SKIP_GOOGLE_BRIDGE_KEY) === '1'
  if (shouldSkipBridge) {
    window.sessionStorage.removeItem(SKIP_GOOGLE_BRIDGE_KEY)
  }

  return shouldSkipBridge
}
