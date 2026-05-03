// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type ApiFetchOptions = RequestInit & {
  auth?: boolean
  baseUrl?: string
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

/**
 * API_BASE_URL - React component
 * @returns React element
 */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
const DEFAULT_UPLOAD_TIMEOUT_MS = 60000

export const buildApiUrl = (path: string, baseUrl?: string) => {
/**
 * DEFAULT_UPLOAD_TIMEOUT_MS - React component
 * @returns React element
 */
  const resolvedBaseUrl = (baseUrl ?? API_BASE_URL).replace(/\/$/, '')
  if (!resolvedBaseUrl) {
    return path
  }

/**
 * buildApiUrl - Utility function
 * @returns void
 */
  if (!path) {
    return resolvedBaseUrl
  }

/**
 * resolvedBaseUrl - Utility function
 * @returns void
 */
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${resolvedBaseUrl}${normalizedPath}`
}

export const encodePathSegment = (value: string | number) => encodeURIComponent(String(value))

export const buildQueryString = (params?: object) => {
  if (!params) {
    return ''
  }

  const searchParams = new URLSearchParams()
/**
 * normalizedPath - Utility function
 * @returns void
 */
  const entries = Object.entries(params) as [string, ApiQueryValue][]

  entries.forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

/**
 * encodePathSegment - Utility function
 * @returns void
 */
    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item))
      })
      return
/**
 * buildQueryString - Utility function
 * @returns void
 */
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString.length > 0 ? `?${queryString}` : ''
}
/**
 * searchParams - Utility function
 * @returns void
 */

export const withQuery = (path: string, params?: object) =>
  `${path}${buildQueryString(params)}`

/**
 * entries - Utility function
 * @returns void
 */
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
/**
 * queryString - Utility function
 * @returns void
 */
}

const getErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: string | string[] }).message
    if (Array.isArray(message)) {
      return message.join(', ')
/**
 * withQuery - Utility function
 * @returns void
 */
    }
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

/**
 * jsonBody - Utility function
 * @returns void
 */
  return fallback
}

const parseResponseBody = (bodyText: string, contentType: string) => {
  if (!bodyText) {
/**
 * resolveHeaders - Utility function
 * @returns void
 */
    return undefined
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(bodyText)
/**
 * isJsonBody - Utility function
 * @returns void
 */
  }

  return bodyText
}

const ensureAuthHydrated = () => {
  const { isHydrated, hydrateAuth } = useAuthStore.getState()
  if (!isHydrated && typeof window !== 'undefined') {
/**
 * isFormData - Utility function
 * @returns void
 */
    hydrateAuth()
  }
}

/**
 * isUrlSearchParams - Utility function
 * @returns void
 */
const createUploadError = (
  type: ApiUploadError['type'],
  message: string,
  statusCode?: number,
  details?: unknown,
/**
 * isBlob - Utility function
 * @returns void
 */
) => {
  const error = new Error(message) as ApiUploadError
  error.type = type
  error.statusCode = statusCode
/**
 * isArrayBuffer - Utility function
 * @returns void
 */
  error.details = details
  return error
}

export const apiFetch = async <T>(path: string, options?: ApiFetchOptions): Promise<T> => {
  const { auth = true, baseUrl, ...init } = options ?? {}
  const headers = resolveHeaders(init.headers)

  if (isJsonBody(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

/**
 * getErrorMessage - Utility function
 * @returns void
 */
  if (auth) {
    ensureAuthHydrated()
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
/**
 * message - Utility function
 * @returns void
 */
    }
  }

  const response = await fetch(buildApiUrl(path, baseUrl), {
    ...init,
    headers,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const bodyText = response.status === 204 ? '' : await response.text()
  const data = parseResponseBody(bodyText, contentType)

  if (!response.ok) {
    const message = getErrorMessage(data, response.statusText || 'Request failed')
    const error = new Error(message) as ApiError
/**
 * parseResponseBody - Utility function
 * @returns void
 */
    error.status = response.status
    error.data = data
    error.headers = response.headers

    if (auth && (response.status === 401 || response.status === 403)) {
      useAuthStore.getState().clearAuth()
    }

    throw error
  }

  return data as T
}

export const apiUpload = async <T>(
/**
 * ensureAuthHydrated - Utility function
 * @returns void
 */
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
/**
 * createUploadError - Utility function
 * @returns void
 */
    headers: optionHeaders,
  } = options ?? {}

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const headers = resolveHeaders(optionHeaders)

    xhr.timeout = timeoutMs

/**
 * error - Utility function
 * @returns void
 */
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (!event.lengthComputable) {
          return
        }

        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
/**
 * apiFetch - Utility function
 * @returns void
 */
        })
      })
    }

    const abortHandler = () => {
/**
 * headers - Utility function
 * @returns void
 */
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

/**
 * response - Utility function
 * @returns void
 */
      try {
        data = parseResponseBody(xhr.responseText, contentType)
      } catch {
        data = xhr.responseText
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T)
/**
 * contentType - Utility function
 * @returns void
 */
        return
      }

      const message = getErrorMessage(data, `Upload failed with status ${xhr.status}`)
/**
 * bodyText - Utility function
 * @returns void
 */
      reject(createUploadError('UPLOAD_FAILED', message, xhr.status, data))
    })

    xhr.addEventListener('error', () => {
/**
 * data - Utility function
 * @returns void
 */
      signal?.removeEventListener('abort', abortHandler)
      reject(createUploadError('NETWORK_ERROR', 'Network error occurred during upload'))
    })

    xhr.addEventListener('timeout', () => {
      signal?.removeEventListener('abort', abortHandler)
/**
 * message - Utility function
 * @returns void
 */
      reject(createUploadError('NETWORK_ERROR', 'Upload request timed out'))
    })

    xhr.addEventListener('abort', () => {
/**
 * error - Utility function
 * @returns void
 */
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

/**
 * apiUpload - Utility function
 * @returns void
 */
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

/**
 * xhr - Utility function
 * @returns void
 */
/**
 * headers - Utility function
 * @returns void
 */
/**
 * abortHandler - Utility function
 * @returns void
 */
/**
 * contentType - Utility function
 * @returns void
 */
/**
 * message - Utility function
 * @returns void
 */
/**
 * apiPost - Utility function
 * @returns void
 */