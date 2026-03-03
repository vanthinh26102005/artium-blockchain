// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type ApiFetchOptions = RequestInit & {
  auth?: boolean
  baseUrl?: string
}

type ApiError = Error & {
  status?: number
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

const buildUrl = (path: string, baseUrl?: string) => {
  const resolvedBaseUrl = (baseUrl ?? API_BASE_URL).replace(/\/$/, '')
  if (!resolvedBaseUrl) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${resolvedBaseUrl}${normalizedPath}`
}

const resolveHeaders = (headers?: HeadersInit) => new Headers(headers)

const isJsonBody = (body: BodyInit | null | undefined) => {
  if (!body) {
    return false
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const isUrlSearchParams =
    typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob
  const isArrayBuffer = typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer

  if (isFormData || isUrlSearchParams || isBlob || isArrayBuffer) {
    return false
  }

  return true
}

const getErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: string }).message
    if (message && message.length > 0) {
      return message
    }
  }

  return fallback
}

export const apiFetch = async <T>(path: string, options?: ApiFetchOptions): Promise<T> => {
  const { auth = true, baseUrl, ...init } = options ?? {}
  const headers = resolveHeaders(init.headers)

  if (isJsonBody(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  const response = await fetch(buildUrl(path, baseUrl), {
    ...init,
    headers,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = getErrorMessage(data, response.statusText || 'Request failed')
    const error = new Error(message) as ApiError
    error.status = response.status
    throw error
  }

  return data as T
}

export const apiPost = async <T>(
  path: string,
  body: unknown,
  options?: ApiFetchOptions,
): Promise<T> => {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type { ApiFetchOptions }
export type { ApiError }
