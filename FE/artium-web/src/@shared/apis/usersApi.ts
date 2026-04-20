// @shared - services
import { apiFetch, apiPost } from '@shared/services/apiClient'

// @shared - types
import type {
  ConfirmPasswordResetPayload,
  LoginResponse,
  RegisterCompletePayload,
  RegisterInitiatePayload,
  RequestOtpResponse,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  UserPayload,
  VerifyPasswordResetPayload,
  VerifyPasswordResetResponse,
} from '@shared/types/auth'
import { normalizeLoginResponse, normalizeUserPayload } from '@shared/types/auth'

type LoginByEmailInput = {
  email: string
  password: string
}

type LoginByGoogleInput = {
  idToken: string
}

const usersApi = {
  loginByEmail: async (input: LoginByEmailInput) => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/login', input, { auth: false })
    return normalizeLoginResponse(raw)
  },
  loginByGoogle: async (input: LoginByGoogleInput) => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/google', input, { auth: false })
    return normalizeLoginResponse(raw)
  },
  loginWithGoogle: async (input: LoginByGoogleInput) => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/google', input, { auth: false })
    return normalizeLoginResponse(raw)
  },
  registerInitiate: (input: RegisterInitiatePayload) =>
    apiPost<RequestOtpResponse>('/identity/auth/register/initiate', input, {
      auth: false,
    }),
  registerComplete: async (input: RegisterCompletePayload) => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/register/complete', input, { auth: false })
    return normalizeLoginResponse(raw)
  },
  requestPasswordReset: (input: RequestPasswordResetPayload) =>
    apiPost<RequestPasswordResetResponse>('/identity/auth/password/reset/request', input, {
      auth: false,
    }),
  verifyPasswordReset: (input: VerifyPasswordResetPayload) =>
    apiPost<VerifyPasswordResetResponse>('/identity/auth/password/reset/verify', input, {
      auth: false,
    }),
  confirmPasswordReset: async (input: ConfirmPasswordResetPayload) => {
    const raw = await apiFetch<Record<string, unknown>>('/identity/auth/password/reset/confirm', {
      auth: false,
      method: 'PUT',
      body: JSON.stringify(input),
    })
    return normalizeLoginResponse(raw)
  },
  getMe: async () => {
    const raw = await apiFetch<Record<string, unknown>>('/identity/users/me', { auth: true, cache: 'no-store' })
    return normalizeUserPayload(raw)
  },
  getUserBySlug: async (slug: string) => {
    const raw = await apiFetch<Record<string, unknown>>(`/identity/users/slug/${encodeURIComponent(slug)}`, {
      auth: false,
      cache: 'no-store',
    })
    return normalizeUserPayload(raw)
  },
  getUserById: async (userId: string) => {
    const raw = await apiFetch<Record<string, unknown>>(`/identity/users/${encodeURIComponent(userId)}`, {
      auth: false,
      cache: 'no-store',
    })
    return normalizeUserPayload(raw)
  },
}

export default usersApi
