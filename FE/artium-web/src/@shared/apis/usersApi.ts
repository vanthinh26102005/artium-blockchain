// @shared - services
import { apiFetch, apiPost } from '@shared/services/apiClient'

// @shared - types
import type {
  ConfirmPasswordResetPayload,
  LoginByWalletPayload,
  LoginResponse,
  RegisterCompletePayload,
  RegisterInitiatePayload,
  RequestOtpResponse,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  UserPayload,
  VerifyPasswordResetPayload,
  VerifyPasswordResetResponse,
  WalletNonceResponse,
} from '@shared/types/auth'

type LoginByEmailInput = {
  email: string
  password: string
}

type LoginByGoogleInput = {
  idToken: string
}

const usersApi = {
  loginByEmail: (input: LoginByEmailInput) =>
    apiPost<LoginResponse>('/identity/auth/login', input, { auth: false }),
  loginByGoogle: (input: LoginByGoogleInput) =>
    apiPost<LoginResponse>('/identity/auth/google', input, { auth: false }),
  loginWithGoogle: (input: LoginByGoogleInput) =>
    apiPost<LoginResponse>('/identity/auth/google', input, { auth: false }),
  getWalletNonce: (address: string) =>
    apiFetch<WalletNonceResponse>(
      `/identity/auth/wallet/nonce?address=${encodeURIComponent(address)}`,
      { auth: false, cache: 'no-store' },
    ),
  loginByWallet: (input: LoginByWalletPayload) =>
    apiPost<LoginResponse>('/identity/auth/wallet', input, { auth: false }),
  registerInitiate: (input: RegisterInitiatePayload) =>
    apiPost<RequestOtpResponse>('/identity/auth/register/initiate', input, {
      auth: false,
    }),
  registerComplete: (input: RegisterCompletePayload) =>
    apiPost<LoginResponse>('/identity/auth/register/complete', input, { auth: false }),
  requestPasswordReset: (input: RequestPasswordResetPayload) =>
    apiPost<RequestPasswordResetResponse>('/identity/auth/password/reset/request', input, {
      auth: false,
    }),
  verifyPasswordReset: (input: VerifyPasswordResetPayload) =>
    apiPost<VerifyPasswordResetResponse>('/identity/auth/password/reset/verify', input, {
      auth: false,
    }),
  confirmPasswordReset: (input: ConfirmPasswordResetPayload) =>
    apiFetch<LoginResponse>('/identity/auth/password/reset/confirm', {
      auth: false,
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  getMe: () => apiFetch<UserPayload>('/identity/users/me', { auth: true, cache: 'no-store' }),
}

export default usersApi
