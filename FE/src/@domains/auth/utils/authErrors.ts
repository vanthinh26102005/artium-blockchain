import type { ApiError } from '@shared/services/apiClient'

type AuthErrorContext =
  | 'login'
  | 'signup'
  | 'signupOtp'
  | 'forgotRequest'
  | 'forgotVerify'
  | 'resetVerify'
  | 'resetConfirm'
  | 'google'

const contextFallbacks: Record<AuthErrorContext, string> = {
  login: 'Email or password is incorrect.',
  signup: 'Something went wrong. Please try again.',
  signupOtp: 'The code is incorrect or expired. Request a new code.',
  forgotRequest: 'Something went wrong. Please try again.',
  forgotVerify: 'The code is incorrect or expired. Request a new code.',
  resetVerify: 'The code is incorrect or expired. Request a new code.',
  resetConfirm: 'Something went wrong. Please try again.',
  google: 'Google sign-in failed. Please try again.',
}

const getRawMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return ''
}

const getApiStatus = (error: unknown) => (error as ApiError | undefined)?.status

const getApiErrorData = (error: unknown) => (error as ApiError | undefined)?.data

export const isCaptchaRequiredError = (error: unknown) => {
  const data = getApiErrorData(error)

  if (!data || typeof data !== 'object') {
    return false
  }

  const errorData = data as {
    captchaRequired?: unknown
    errors?: { captchaRequired?: unknown } | null
  }

  return errorData.captchaRequired === true || errorData.errors?.captchaRequired === true
}

const normalizeMessage = (message: string) =>
  message.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()

export const getPracticalAuthErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
  context?: AuthErrorContext,
) => {
  const rawMessage = getRawMessage(error)
  const normalized = normalizeMessage(rawMessage)
  const status = getApiStatus(error)
  const contextFallback = context ? contextFallbacks[context] : fallback

  if (isCaptchaRequiredError(error)) {
    return 'Complete the verification and try again.'
  }

  if (!normalized) {
    return contextFallback || fallback
  }

  if (
    context === 'login' ||
    status === 401 ||
    normalized.includes('invalid credentials') ||
    normalized.includes('invalid password') ||
    normalized.includes('wrong password')
  ) {
    return 'Email or password is incorrect.'
  }

  if (
    normalized.includes('email already') ||
    normalized.includes('already exists') ||
    normalized.includes('already registered') ||
    normalized.includes('duplicate')
  ) {
    return 'An account with this email already exists. Sign in instead.'
  }

  if (
    normalized.includes('otp') ||
    normalized.includes('verification code') ||
    normalized.includes('verify code') ||
    normalized.includes('invalid code') ||
    normalized.includes('expired code') ||
    normalized.includes('code expired')
  ) {
    return 'The code is incorrect or expired. Request a new code.'
  }

  if (
    normalized.includes('reset session') ||
    normalized.includes('reset token') ||
    normalized.includes('token expired') ||
    normalized.includes('expired token')
  ) {
    return 'Your reset session expired. Request a new code.'
  }

  if (
    normalized === 'request failed' ||
    normalized === 'verification failed' ||
    normalized === 'reset failed' ||
    normalized === 'registration failed' ||
    normalized === 'otp verification failed' ||
    normalized === 'login failed' ||
    normalized === 'failed to fetch' ||
    normalized.includes('networkerror')
  ) {
    return contextFallback || fallback
  }

  return rawMessage
}
