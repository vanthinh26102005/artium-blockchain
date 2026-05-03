import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUploadArtworkStore } from '@domains/inventory-upload/stores/useUploadArtworkStore'

/**
 * useUploadNavigationBlocker - Custom React hook
 * @returns void
 */
export const useUploadNavigationBlocker = (allowNavigationRef: React.MutableRefObject<boolean>) => {
  const router = useRouter()
  
  const isDirty = useUploadArtworkStore((state) => state.isDirty)
/**
 * router - Utility function
 * @returns void
 */
  const clearDirty = useUploadArtworkStore((state) => state.clearDirty)

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
/**
 * isDirty - Utility function
 * @returns void
 */
        return
      }
      event.preventDefault()
    }
/**
 * clearDirty - Utility function
 * @returns void
 */

    const handleRouteChangeStart = () => {
      if (!isDirty || allowNavigationRef.current) {
        return
      }
      const shouldLeave = window.confirm(
/**
 * handleBeforeUnload - Utility function
 * @returns void
 */
        'You have unsaved changes. Are you sure you want to leave this page?',
      )
      if (shouldLeave) {
        clearDirty()
        return
      }
      router.events.emit('routeChangeError')
      throw new Error('Route change aborted.')
    }

/**
 * handleRouteChangeStart - Utility function
 * @returns void
 */
    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
/**
 * shouldLeave - Utility function
 * @returns void
 */
  }, [clearDirty, isDirty, router.events, allowNavigationRef])
}
