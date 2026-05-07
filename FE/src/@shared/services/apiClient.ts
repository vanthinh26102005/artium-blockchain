// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type ApiFetchOptions = RequestInit & {
  auth?: boolean
  baseUrl?: string
  dedupe?: boolean
  clientCacheTtlMs?: number
}

export type ApiQueryPrimitive = string | number | boolean
export type ApiQueryValue =
  | ApiQueryPrimitive
  | readonly ApiQueryPrimitive[]
  | null
  | undefined

export type ApiError = Error & {
  status?: number
  data?: unknown
  headers?: Headers
}

export type ApiUploadProgress = {
  loaded: number
  total: number
  percentage: number
}

export type ApiUploadOptions = {
  auth?: boolean
  baseUrl?: string
  timeoutMs?: number
  signal?: AbortSignal
  onProgress?: (progress: ApiUploadProgress) => void
  headers?: HeadersInit
}

export type ApiUploadError = Error & {
  type: 'UPLOAD_FAILED' | 'NETWORK_ERROR'
  statusCode?: number
  details?: unknown
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
const DEFAULT_UPLOAD_TIMEOUT_MS = 60000
const clientResponseCache = new Map<string, { expiresAt: number; data: unknown }>()
const inflightClientRequests = new Map<string, Promise<unknown>>()

export const buildApiUrl = (path: string, baseUrl?: string) => {
  const resolvedBaseUrl = (baseUrl ?? API_BASE_URL).replace(/\/$/, '')
  if (!resolvedBaseUrl) {
    return path
  }

  if (!path) {
    return resolvedBaseUrl
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${resolvedBaseUrl}${normalizedPath}`
}

export const encodePathSegment = (value: string | number) => encodeURIComponent(String(value))

export const buildQueryString = (params?: object) => {
  if (!params) {
    return ''
  }

  const searchParams = new URLSearchParams()
  const entries = Object.entries(params) as [string, ApiQueryValue][]

  entries.forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item))
      })
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString.length > 0 ? `?${queryString}` : ''
}

export const withQuery = (path: string, params?: object) =>
  `${path}${buildQueryString(params)}`

export const jsonBody = (body: unknown) => JSON.stringify(body)

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
    const message = (data as { message?: string | string[] }).message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}

const parseResponseBody = (bodyText: string, contentType: string) => {
  if (!bodyText) {
    return undefined
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(bodyText)
  }

  return bodyText
}

const ensureAuthHydrated = () => {
  const { isHydrated, hydrateAuth } = useAuthStore.getState()
  if (!isHydrated && typeof window !== 'undefined') {
    hydrateAuth()
  }
}

const createUploadError = (
  type: ApiUploadError['type'],
  message: string,
  statusCode?: number,
  details?: unknown,
) => {
  const error = new Error(message) as ApiUploadError
  error.type = type
  error.statusCode = statusCode
  error.details = details
  return error
}

const isCacheableClientRequest = (
  method: string,
  body: BodyInit | null | undefined,
  clientCacheTtlMs?: number,
  dedupe?: boolean,
) =>
  typeof window !== 'undefined' &&
  method === 'GET' &&
  !body &&
  (Boolean(dedupe) || Boolean(clientCacheTtlMs && clientCacheTtlMs > 0))

const buildClientCacheKey = (method: string, url: string, authToken?: string) =>
  `${method}:${url}:${authToken ?? ''}`

const createAbortError = () => {
  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

const withAbortSignal = <T>(
  promise: Promise<T>,
  signal?: AbortSignal | null,
): Promise<T> => {
  if (!signal) {
    return promise
  }

  if (signal.aborted) {
    return Promise.reject(createAbortError())
  }

  return new Promise((resolve, reject) => {
    const abortHandler = () => {
      signal.removeEventListener('abort', abortHandler)
      reject(createAbortError())
    }

    signal.addEventListener('abort', abortHandler, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', abortHandler)
        resolve(value)
      },
      (error) => {
        signal.removeEventListener('abort', abortHandler)
        reject(error)
      },
    )
  })
}

export const apiFetch = async <T>(path: string, options?: ApiFetchOptions): Promise<T> => {
  const { auth = true, baseUrl, dedupe, clientCacheTtlMs, ...init } = options ?? {}
  const headers = resolveHeaders(init.headers)
  const method = (init.method ?? 'GET').toUpperCase()

  if (isJsonBody(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let authToken: string | undefined
  if (auth) {
    ensureAuthHydrated()
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      authToken = accessToken
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  const url = buildApiUrl(path, baseUrl)
  const canUseClientCache = isCacheableClientRequest(method, init.body, clientCacheTtlMs, dedupe)
  const clientCacheKey = canUseClientCache ? buildClientCacheKey(method, url, authToken) : null
  const now = Date.now()

  if (clientCacheKey && clientCacheTtlMs && clientCacheTtlMs > 0) {
    const cached = clientResponseCache.get(clientCacheKey)
    if (cached && cached.expiresAt > now) {
      return cached.data as T
    }
    if (cached) {
      clientResponseCache.delete(clientCacheKey)
    }
  }

  if (clientCacheKey && dedupe) {
    const inflight = inflightClientRequests.get(clientCacheKey)
    if (inflight) {
      return withAbortSignal(inflight as Promise<T>, init.signal)
    }
  }

  const requestPromise = (async () => {
    const fetchInit = clientCacheKey && dedupe ? { ...init, signal: undefined } : init
    const response = await fetch(url, {
      ...fetchInit,
      method,
      headers,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const bodyText = response.status === 204 ? '' : await response.text()
    const data = parseResponseBody(bodyText, contentType)

    if (!response.ok) {
      const message = getErrorMessage(data, response.statusText || 'Request failed')
      const error = new Error(message) as ApiError
      error.status = response.status
      error.data = data
      error.headers = response.headers

      if (auth && (response.status === 401 || response.status === 403)) {
        useAuthStore.getState().clearAuth()
      }

      throw error
    }

    if (clientCacheKey && clientCacheTtlMs && clientCacheTtlMs > 0) {
      clientResponseCache.set(clientCacheKey, {
        expiresAt: Date.now() + clientCacheTtlMs,
        data,
      })
    }

    return data as T
  })()

  if (clientCacheKey && dedupe) {
    inflightClientRequests.set(clientCacheKey, requestPromise)
    requestPromise.then(
      () => inflightClientRequests.delete(clientCacheKey),
      () => inflightClientRequests.delete(clientCacheKey),
    )
  }

  return withAbortSignal(requestPromise, init.signal)
}

export const apiUpload = async <T>(
  path: string,
  formData: FormData,
  options?: ApiUploadOptions,
): Promise<T> => {
  const {
    auth = true,
    baseUrl,
    timeoutMs = DEFAULT_UPLOAD_TIMEOUT_MS,
    signal,
    onProgress,
    headers: optionHeaders,
  } = options ?? {}

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const headers = resolveHeaders(optionHeaders)

    xhr.timeout = timeoutMs

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (!event.lengthComputable) {
          return
        }

        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        })
      })
    }

    const abortHandler = () => {
      xhr.abort()
    }

    if (signal) {
      if (signal.aborted) {
        reject(createUploadError('NETWORK_ERROR', 'Upload cancelled by user'))
        return
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    }

    xhr.addEventListener('load', () => {
      signal?.removeEventListener('abort', abortHandler)

      const contentType = xhr.getResponseHeader('content-type') ?? ''
      let data: unknown

      try {
        data = parseResponseBody(xhr.responseText, contentType)
      } catch {
        data = xhr.responseText
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T)
        return
      }

      const message = getErrorMessage(data, `Upload failed with status ${xhr.status}`)
      reject(createUploadError('UPLOAD_FAILED', message, xhr.status, data))
    })

    xhr.addEventListener('error', () => {
      signal?.removeEventListener('abort', abortHandler)
      reject(createUploadError('NETWORK_ERROR', 'Network error occurred during upload'))
    })

    xhr.addEventListener('timeout', () => {
      signal?.removeEventListener('abort', abortHandler)
      reject(createUploadError('NETWORK_ERROR', 'Upload request timed out'))
    })

    xhr.addEventListener('abort', () => {
      signal?.removeEventListener('abort', abortHandler)
      reject(createUploadError('NETWORK_ERROR', 'Upload was aborted'))
    })

    xhr.open('POST', buildApiUrl(path, baseUrl))

    if (auth) {
      ensureAuthHydrated()
      const { accessToken } = useAuthStore.getState()
      if (accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      }
    }

    headers.forEach((value, key) => {
      xhr.setRequestHeader(key, value)
    })

    xhr.send(formData)
  })
}

export const apiPost = async <T>(
  path: string,
  body: unknown,
  options?: ApiFetchOptions,
): Promise<T> => {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: jsonBody(body),
  })
}

export type { ApiFetchOptions }
