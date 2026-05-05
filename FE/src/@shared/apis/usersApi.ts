// @shared - services
import { apiFetch, apiPost, encodePathSegment, withQuery } from '@shared/services/apiClient'

// @shared - types
import type {
  ConfirmPasswordResetPayload,
  LoginByWalletPayload,
  RegisterCompletePayload,
  RegisterInitiatePayload,
  RequestOtpResponse,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  VerifyPasswordResetPayload,
  VerifyPasswordResetResponse,
  WalletNonceResponse,
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
  getWalletNonce: (address: string) =>
    apiFetch<WalletNonceResponse>(
      withQuery('/identity/auth/wallet/nonce', { address }),
      { auth: false, cache: 'no-store' },
    ),
  loginByWallet: async (input: LoginByWalletPayload) => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/wallet', input, { auth: false })
    return normalizeLoginResponse(raw)
  },
  linkWallet: async (input: LoginByWalletPayload) => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/wallet/link', input, { auth: true })
    return normalizeUserPayload((raw as { user: Record<string, unknown> }).user ?? raw)
  },
  unlinkWallet: async () => {
    const raw = await apiPost<Record<string, unknown>>('/identity/auth/wallet/unlink', {}, { auth: true })
    return normalizeUserPayload((raw as { user: Record<string, unknown> }).user ?? raw)
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
    const raw = await apiFetch<Record<string, unknown>>(
      `/identity/users/slug/${encodePathSegment(slug)}`,
      {
        auth: false,
        cache: 'no-store',
      },
    )
    return normalizeUserPayload(raw)
  },
  updateMe: async (input: { fullName?: string | null; slug?: string | null; avatarUrl?: string | null }) => {
    const raw = await apiFetch<Record<string, unknown>>('/identity/users/me', {
      method: 'PUT',
      body: JSON.stringify(input),
      auth: true,
    })
    return normalizeUserPayload((raw as { user: Record<string, unknown> }).user ?? raw)
  },
  getUserById: async (userId: string) => {
    const raw = await apiFetch<Record<string, unknown>>(
      `/identity/users/${encodePathSegment(userId)}`,
      {
        auth: false,
        cache: 'no-store',
      },
    )
    return normalizeUserPayload(raw)
  },
}

export default usersApi
