// react
import { useCallback, useState } from 'react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - types
import type {
  LoginResponse,
  RegisterCompletePayload,
  RegisterInitiatePayload,
} from '@shared/types/auth'

type UseRegisterResult = {
  initiate: (payload: RegisterInitiatePayload) => Promise<void>
  complete: (payload: RegisterCompletePayload) => Promise<LoginResponse>
  isLoading: boolean
  error: string | null
}

/**
 * useRegister - Custom React hook
 * @returns void
 */
export const useRegister = (): UseRegisterResult => {
  // -- state --
  const [isInitiating, setIsInitiating] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -- handlers --
  const initiate = useCallback(async (payload: RegisterInitiatePayload) => {
    setError(null)
    setIsInitiating(true)
    /**
     * initiate - Utility function
     * @returns void
     */

    try {
      await usersApi.registerInitiate(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.'
      setError(message)
      throw error
    } finally {
      setIsInitiating(false)
    }
    /**
     * message - Utility function
     * @returns void
     */
  }, [])

  const complete = useCallback(async (payload: RegisterCompletePayload) => {
    setError(null)
    setIsCompleting(true)

    try {
      return await usersApi.registerComplete(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OTP verification failed.'
      setError(message)
      /**
       * complete - Utility function
       * @returns void
       */
      throw error
    } finally {
      setIsCompleting(false)
    }
  }, [])

  return {
    initiate,
    complete,
    isLoading: isInitiating || isCompleting,
    /**
     * message - Utility function
     * @returns void
     */
    error,
  }
}
