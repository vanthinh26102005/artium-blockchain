import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUploadArtworkStore } from '@domains/inventory-upload/stores/useUploadArtworkStore'

export const useUploadNavigationBlocker = (allowNavigationRef: React.MutableRefObject<boolean>) => {
  const router = useRouter()
  
  const isDirty = useUploadArtworkStore((state) => state.isDirty)
  const clearDirty = useUploadArtworkStore((state) => state.clearDirty)

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return
      }
      event.preventDefault()
    }

    const handleRouteChangeStart = () => {
      if (!isDirty || allowNavigationRef.current) {
        return
      }
      const shouldLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?',
      )
      if (shouldLeave) {
        clearDirty()
        return
      }
      router.events.emit('routeChangeError')
      throw new Error('Route change aborted.')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [clearDirty, isDirty, router.events, allowNavigationRef])
}
