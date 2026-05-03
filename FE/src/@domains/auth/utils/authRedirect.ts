/**
 * AUTH_REDIRECT_BASE_URL - React component
 * @returns React element
 */
const AUTH_REDIRECT_BASE_URL = 'https://artium.local'

export const getSafeNextPath = (
  next: string | string[] | undefined,
  fallback = '/',
/**
 * getSafeNextPath - Utility function
 * @returns void
 */
) => {
  if (typeof next !== 'string') {
    return fallback
  }

  const trimmedNext = next.trim()
  if (!trimmedNext || !trimmedNext.startsWith('/') || trimmedNext.startsWith('//')) {
    return fallback
  }

  try {
/**
 * trimmedNext - Utility function
 * @returns void
 */
    const url = new URL(trimmedNext, AUTH_REDIRECT_BASE_URL)
    if (url.origin !== AUTH_REDIRECT_BASE_URL) {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
/**
 * url - Utility function
 * @returns void
 */
}

export const buildAuthCallbackUrl = (
  pathname: string,
  next: string | string[] | undefined,
  fallback = '/',
) => {
  const safeNextPath = getSafeNextPath(next, fallback)
  return `${pathname}?next=${encodeURIComponent(safeNextPath)}`
}

export const buildLoginRedirectUrl = (
  next: string | string[] | undefined,
  fallback = '/',
/**
 * buildAuthCallbackUrl - Utility function
 * @returns void
 */
) => buildAuthCallbackUrl('/login', next, fallback)

/**
 * safeNextPath - Utility function
 * @returns void
 */
/**
 * buildLoginRedirectUrl - Utility function
 * @returns void
 */