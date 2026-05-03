// react
import { useCallback, useState } from 'react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

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

/**
 * useForgotPassword - Custom React hook
 * @returns void
 */
export const useForgotPassword = (): UseForgotPasswordResult => {
  // -- state --
  const [isRequesting, setIsRequesting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -- handlers --
  const requestReset = useCallback(async (payload: RequestPasswordResetPayload) => {
    setError(null)
    setIsRequesting(true)
/**
 * requestReset - Utility function
 * @returns void
 */

    try {
      await usersApi.requestPasswordReset(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed.'
      setError(message)
      throw error
    } finally {
      setIsRequesting(false)
    }
/**
 * message - Utility function
 * @returns void
 */
  }, [])

  const verifyReset = useCallback(async (payload: VerifyPasswordResetPayload) => {
    setError(null)
    setIsVerifying(true)

    try {
      return await usersApi.verifyPasswordReset(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed.'
      setError(message)
/**
 * verifyReset - Utility function
 * @returns void
 */
      throw error
    } finally {
      setIsVerifying(false)
    }
  }, [])

  return {
    requestReset,
    verifyReset,
    isLoading: isRequesting || isVerifying,
/**
 * message - Utility function
 * @returns void
 */
    error,
  }
}
