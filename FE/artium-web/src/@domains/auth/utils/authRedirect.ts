const AUTH_REDIRECT_BASE_URL = 'https://artium.local'

export const getSafeNextPath = (
  next: string | string[] | undefined,
  fallback = '/',
) => {
  if (typeof next !== 'string') {
    return fallback
  }

  const trimmedNext = next.trim()
  if (!trimmedNext || !trimmedNext.startsWith('/') || trimmedNext.startsWith('//')) {
    return fallback
  }

  try {
    const url = new URL(trimmedNext, AUTH_REDIRECT_BASE_URL)
    if (url.origin !== AUTH_REDIRECT_BASE_URL) {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
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
) => buildAuthCallbackUrl('/login', next, fallback)
