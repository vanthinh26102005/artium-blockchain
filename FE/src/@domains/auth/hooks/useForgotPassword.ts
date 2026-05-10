// react
import { useCallback, useState } from 'react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'
import { getPracticalAuthErrorMessage } from '@domains/auth/utils/authErrors'

// @shared - types
import type {
  RequestPasswordResetPayload,
  VerifyPasswordResetPayload,
  VerifyPasswordResetResponse,
} from '@shared/types/auth'

type UseForgotPasswordResult = {
  requestReset: (payload: RequestPasswordResetPayload) => Promise<void>
  verifyReset: (payload: VerifyPasswordResetPayload) => Promise<VerifyPasswordResetResponse>
  isLoading: boolean
  error: string | null
}

export const useForgotPassword = (): UseForgotPasswordResult => {
  // -- state --
  const [isRequesting, setIsRequesting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -- handlers --
  const requestReset = useCallback(async (payload: RequestPasswordResetPayload) => {
    setError(null)
    setIsRequesting(true)

    try {
      await usersApi.requestPasswordReset(payload)
    } catch (error) {
      const message = getPracticalAuthErrorMessage(
        error,
        'Something went wrong. Please try again.',
        'forgotRequest',
      )
      setError(message)
      throw error
    } finally {
      setIsRequesting(false)
    }
  }, [])

  const verifyReset = useCallback(async (payload: VerifyPasswordResetPayload) => {
    setError(null)
    setIsVerifying(true)

    try {
      return await usersApi.verifyPasswordReset(payload)
    } catch (error) {
      const message = getPracticalAuthErrorMessage(
        error,
        'The code is incorrect or expired. Request a new code.',
        'forgotVerify',
      )
      setError(message)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }, [])

  return {
    requestReset,
    verifyReset,
    isLoading: isRequesting || isVerifying,
    error,
  }
}
