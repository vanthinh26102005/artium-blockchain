// react
import { useCallback, useState } from 'react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - types
import type {
  ConfirmPasswordResetPayload,
  LoginResponse,
  VerifyPasswordResetPayload,
  VerifyPasswordResetResponse,
} from '@shared/types/auth'

type UseResetPasswordResult = {
  verifyReset: (payload: VerifyPasswordResetPayload) => Promise<VerifyPasswordResetResponse>
  confirmReset: (payload: ConfirmPasswordResetPayload) => Promise<LoginResponse>
  isLoading: boolean
  error: string | null
}

export const useResetPassword = (): UseResetPasswordResult => {
  // -- state --
  const [isVerifying, setIsVerifying] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -- handlers --
  const verifyReset = useCallback(async (payload: VerifyPasswordResetPayload) => {
    setError(null)
    setIsVerifying(true)

    try {
      return await usersApi.verifyPasswordReset(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed.'
      setError(message)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }, [])

  const confirmReset = useCallback(async (payload: ConfirmPasswordResetPayload) => {
    setError(null)
    setIsConfirming(true)

    try {
      return await usersApi.confirmPasswordReset(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed.'
      setError(message)
      throw error
    } finally {
      setIsConfirming(false)
    }
  }, [])

  return {
    verifyReset,
    confirmReset,
    isLoading: isVerifying || isConfirming,
    error,
  }
}
