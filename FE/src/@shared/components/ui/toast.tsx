import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// third-party
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'

// @shared - hooks
import {
  ToastContext,
  type ToastApi,
  type ToastItem,
  type ToastOptions,
  type ToastUpdateInput,
  type ToastVariant,
} from '@shared/hooks/useToast'

// @shared - utils
import { cn } from '@shared/lib/utils'

const DEFAULT_TOAST_DURATION_MS: Record<ToastVariant, number | null> = {
  loading: null,
  success: 3000,
  error: 5000,
  warning: 4500,
  info: 4000,
}

const MAX_VISIBLE_TOASTS = 4

const getToastIcon = (variant: ToastVariant) => {
  if (variant === 'loading') {
    return <Loader2 className="h-5 w-5 animate-spin text-[#191414]" />
  }

  if (variant === 'success') {
    return <CheckCircle2 className="h-5 w-5 text-[#167a3b]" />
  }

  if (variant === 'error') {
    return <XCircle className="h-5 w-5 text-[#b42318]" />
  }

  if (variant === 'warning') {
    return <AlertTriangle className="h-5 w-5 text-[#9a3412]" />
  }

  return <Info className="h-5 w-5 text-[#2454a6]" />
}

const getToastClasses = (variant: ToastVariant) =>
  cn(
    'pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-white px-4 py-3 text-left shadow-[0_20px_60px_rgba(25,20,20,0.18)]',
    variant === 'success' && 'border-[#b9e5c8] bg-[#f0fbf4]',
    variant === 'error' && 'border-[#ffb4ad] bg-[#fff1f0]',
    variant === 'warning' && 'border-[#f7c978] bg-[#fff7ed]',
    variant === 'info' && 'border-[#b8cdf8] bg-[#f3f7ff]',
    variant === 'loading' && 'border-black/10 bg-white',
  )

const createToastId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

type ToastProviderProps = {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timerRefs = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const clearToastTimer = useCallback((id: string) => {
    const timer = timerRefs.current.get(id)

    if (timer) {
      clearTimeout(timer)
      timerRefs.current.delete(id)
    }
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      clearToastTimer(id)
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
    },
    [clearToastTimer],
  )

  const scheduleDismiss = useCallback(
    (toast: ToastItem) => {
      clearToastTimer(toast.id)

      const durationMs = toast.durationMs ?? DEFAULT_TOAST_DURATION_MS[toast.variant]
      if (!durationMs) {
        return
      }

      const timer = setTimeout(() => dismiss(toast.id), durationMs)
      timerRefs.current.set(toast.id, timer)
    },
    [clearToastTimer, dismiss],
  )

  const addToast = useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      let nextToast: ToastItem | null = null

      const toast: ToastItem = {
        id: createToastId(),
        variant,
        message,
        title: options?.title,
        durationMs: options?.durationMs,
        toastKey: options?.toastKey,
      }

      setToasts((currentToasts) => {
        if (!toast.toastKey) {
          nextToast = toast
          return [toast, ...currentToasts].slice(0, MAX_VISIBLE_TOASTS)
        }

        const existingToast = currentToasts.find(
          (currentToast) => currentToast.toastKey === toast.toastKey,
        )

        if (!existingToast) {
          nextToast = toast
          return [toast, ...currentToasts].slice(0, MAX_VISIBLE_TOASTS)
        }

        nextToast = {
          ...existingToast,
          variant,
          message,
          title: options?.title,
          durationMs: options?.durationMs,
          toastKey: toast.toastKey,
        }

        return [
          nextToast,
          ...currentToasts.filter((currentToast) => currentToast.id !== existingToast.id),
        ].slice(0, MAX_VISIBLE_TOASTS)
      })

      if (nextToast) {
        scheduleDismiss(nextToast)
      }

      return toast.id
    },
    [scheduleDismiss],
  )

  const update = useCallback(
    (id: string, nextToast: ToastUpdateInput) => {
      let updatedToast: ToastItem | null = null

      setToasts((currentToasts) =>
        currentToasts.map((toast) => {
          if (toast.id !== id) {
            return toast
          }

          updatedToast = {
            ...toast,
            ...nextToast,
            message: nextToast.message ?? toast.message,
            variant: nextToast.variant ?? toast.variant,
            toastKey: nextToast.toastKey ?? toast.toastKey,
          }

          return updatedToast
        }),
      )

      if (updatedToast) {
        scheduleDismiss(updatedToast)
      }
    },
    [scheduleDismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      loading: (message: string, options?: ToastOptions) => addToast('loading', message, options),
      success: (message: string, options?: ToastOptions) => addToast('success', message, options),
      error: (message: string, options?: ToastOptions) => addToast('error', message, options),
      warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
      info: (message: string, options?: ToastOptions) => addToast('info', message, options),
      update,
      dismiss,
    }),
    [addToast, dismiss, update],
  )

  useEffect(() => {
    const timers = timerRefs.current

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-5 left-1/2 z-[300] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 flex-col gap-3 sm:top-7">
        {toasts.map((toast) => (
          <div key={toast.id} className={getToastClasses(toast.variant)} role="status">
            <div className="mt-0.5 shrink-0">{getToastIcon(toast.variant)}</div>
            <div className="min-w-0 flex-1">
              {toast.title ? (
                <p className="text-sm font-bold text-[#191414]">{toast.title}</p>
              ) : null}
              <p className="text-sm leading-5 font-semibold text-[#191414]">{toast.message}</p>
            </div>
            {toast.variant !== 'loading' ? (
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#6f6a67] transition hover:bg-black/5 hover:text-[#191414]"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
