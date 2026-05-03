import { createContext, useContext } from 'react'

export type ToastVariant = 'loading' | 'success' | 'error' | 'warning' | 'info'

export type ToastInput = {
  title?: string
  message: string
  durationMs?: number
  toastKey?: string
}

export type ToastUpdateInput = Partial<ToastInput> & {
  variant?: ToastVariant
}

export type ToastItem = ToastInput & {
  id: string
  variant: ToastVariant
}

export type ToastOptions = Omit<ToastInput, 'message'>

export type ToastApi = {
  loading: (message: string, options?: ToastOptions) => string
  success: (message: string, options?: ToastOptions) => string
  error: (message: string, options?: ToastOptions) => string
  warning: (message: string, options?: ToastOptions) => string
  info: (message: string, options?: ToastOptions) => string
  update: (id: string, nextToast: ToastUpdateInput) => void
  dismiss: (id: string) => void
}

/**
 * ToastContext - React component
 * @returns React element
 */
export const ToastContext = createContext<ToastApi | null>(null)

export const useToast = () => {
  const toast = useContext(ToastContext)

  /**
   * useToast - Custom React hook
   * @returns void
   */
  if (!toast) {
    throw new Error('useToast must be used within ToastProvider.')
  }

  /**
   * toast - Utility function
   * @returns void
   */
  return toast
}
