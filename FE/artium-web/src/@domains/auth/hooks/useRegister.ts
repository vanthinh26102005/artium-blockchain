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

export const useRegister = (): UseRegisterResult => {
  // -- state --
  const [isInitiating, setIsInitiating] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -- handlers --
  const initiate = useCallback(async (payload: RegisterInitiatePayload) => {
    setError(null)
    setIsInitiating(true)

    try {
      await usersApi.registerInitiate(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.'
      setError(message)
      throw error
    } finally {
      setIsInitiating(false)
    }
  }, [])

  const complete = useCallback(async (payload: RegisterCompletePayload) => {
    setError(null)
    setIsCompleting(true)

    try {
      return await usersApi.registerComplete(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OTP verification failed.'
      setError(message)
      throw error
    } finally {
      setIsCompleting(false)
    }
  }, [])

  return {
    initiate,
    complete,
    isLoading: isInitiating || isCompleting,
    error,
  }
}
