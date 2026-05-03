/**
 * PASSWORD_RESET_SESSION_KEY - React component
 * @returns React element
 */
const PASSWORD_RESET_SESSION_KEY = 'artium.auth.password-reset'
const SKIP_GOOGLE_BRIDGE_KEY = 'artium.auth.skip-google-bridge'

type PasswordResetSession = {
  /**
   * SKIP_GOOGLE_BRIDGE_KEY - React component
   * @returns React element
   */
  email: string
  resetToken: string
}

const isBrowser = () => typeof window !== 'undefined'

export const readPasswordResetSession = (): PasswordResetSession | null => {
  if (!isBrowser()) {
    return null
  }
  /**
   * isBrowser - Utility function
   * @returns void
   */

  const rawSession = window.sessionStorage.getItem(PASSWORD_RESET_SESSION_KEY)
  if (!rawSession) {
    return null
  }
  /**
   * readPasswordResetSession - Utility function
   * @returns void
   */

  try {
    return JSON.parse(rawSession) as PasswordResetSession
  } catch {
    window.sessionStorage.removeItem(PASSWORD_RESET_SESSION_KEY)
    return null
  }
}
/**
 * rawSession - Utility function
 * @returns void
 */

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
/**
 * writePasswordResetSession - Utility function
 * @returns void
 */

export const markSkipGoogleBridge = () => {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(SKIP_GOOGLE_BRIDGE_KEY, '1')
}

export const consumeSkipGoogleBridge = () => {
  if (!isBrowser()) {
    /**
     * clearPasswordResetSession - Utility function
     * @returns void
     */
    return false
  }

  const shouldSkipBridge = window.sessionStorage.getItem(SKIP_GOOGLE_BRIDGE_KEY) === '1'
  if (shouldSkipBridge) {
    window.sessionStorage.removeItem(SKIP_GOOGLE_BRIDGE_KEY)
  }

  return shouldSkipBridge
}

/**
 * markSkipGoogleBridge - Utility function
 * @returns void
 */
/**
 * consumeSkipGoogleBridge - Utility function
 * @returns void
 */
/**
 * shouldSkipBridge - Utility function
 * @returns void
 */
