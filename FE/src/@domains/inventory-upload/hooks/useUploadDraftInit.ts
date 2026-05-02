import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import type { ApiError } from '@shared/services/apiClient'
import artworkApis from '@shared/apis/artworkApis'
import { useUploadArtworkStore } from '@domains/inventory-upload/stores/useUploadArtworkStore'

const createDraftArtworkId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const getQueryParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export const useUploadDraftInit = (allowNavigationRef: React.RefObject<boolean>) => {
  const router = useRouter()
  
  const hydrateFromQuery = useUploadArtworkStore((state) => state.hydrateFromQuery)
  const hydrateFromBackendDraft = useUploadArtworkStore((state) => state.hydrateFromBackendDraft)
  const hydrationError = useUploadArtworkStore((state) => state.hydrationError)
  const setHydrationError = useUploadArtworkStore((state) => state.setHydrationError)
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft)
  
  const [isDraftLoading, setIsDraftLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  const generatedDraftIdRef = useRef<string | null>(null)
  const lastHydratedDraftIdRef = useRef<string | null>(null)
  const lastHydratedArtworkIdRef = useRef<string | null>(null)
  
  const artworkIdParam = getQueryParam(router.query.artworkId)
  const isEditingArtwork = Boolean(artworkIdParam)

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const artworkIdParamStr = getQueryParam(router.query.artworkId)
    const legacyDraftParam = router.query.draft
    const draftArtworkIdQuery = router.query.draftArtworkId ?? legacyDraftParam
    const draftArtworkIdParam = getQueryParam(draftArtworkIdQuery)

    if (artworkIdParamStr) {
      if (lastHydratedArtworkIdRef.current === artworkIdParamStr) {
        return
      }

      let isCancelled = false
      const loadArtwork = async () => {
        hydrateFromQuery(artworkIdParamStr)
        setHydrationError(null)
        setIsDraftLoading(true)
        generatedDraftIdRef.current = null
        lastHydratedDraftIdRef.current = null

        try {
          const artwork = await artworkApis.getArtworkById(artworkIdParamStr)

          if (isCancelled) {
            return
          }

          if (!artwork) {
            setHydrationError('This artwork is not available for your account.')
            return
          }

          hydrateFromBackendDraft(artwork)
          lastHydratedArtworkIdRef.current = artworkIdParamStr
        } catch (err) {
          if (isCancelled) {
            return
          }

          const apiError = err as ApiError
          const message =
            apiError.status === 401
              ? 'Please log in again to continue editing this artwork.'
              : apiError.status === 403 || apiError.status === 404
                ? 'This artwork is not available for your account.'
                : apiError.message || 'We could not load this artwork. Please try again.'
          setHydrationError(message)
        } finally {
          if (!isCancelled) {
            setIsDraftLoading(false)
          }
        }
      }

      loadArtwork()

      return () => {
        isCancelled = true
      }
    }

    if (
      !router.query.draftArtworkId &&
      typeof draftArtworkIdParam === 'string' &&
      draftArtworkIdParam
    ) {
      const nextQuery = { ...router.query }
      delete nextQuery.draft
      nextQuery.draftArtworkId = draftArtworkIdParam

      allowNavigationRef.current = true
      router
        .replace(
          {
            pathname: router.pathname,
            query: nextQuery,
          },
          undefined,
          { shallow: true },
        )
        .finally(() => {
          allowNavigationRef.current = false
        })
      return
    }

    if (!draftArtworkIdParam) {
      const nextDraftId = createDraftArtworkId()
      generatedDraftIdRef.current = nextDraftId
      lastHydratedDraftIdRef.current = null
      lastHydratedArtworkIdRef.current = null
      allowNavigationRef.current = true
      router
        .replace(
          {
            pathname: router.pathname,
            query: { ...router.query, draftArtworkId: nextDraftId },
          },
          undefined,
          { shallow: true },
        )
        .finally(() => {
          allowNavigationRef.current = false
        })
      return
    }

    if (lastHydratedDraftIdRef.current === draftArtworkIdParam) {
      return
    }

    let isCancelled = false
    const loadDraft = async () => {
      const isGeneratedDraft = generatedDraftIdRef.current === draftArtworkIdParam
      hydrateFromQuery(draftArtworkIdParam)
      setHydrationError(null)
      setIsDraftLoading(true)

      try {
        const draft = isGeneratedDraft
          ? await artworkApis.createUploadDraft(draftArtworkIdParam)
          : await artworkApis.getUploadDraft(draftArtworkIdParam)

        if (isCancelled) {
          return
        }

        hydrateFromBackendDraft(draft)
        lastHydratedDraftIdRef.current = draftArtworkIdParam
        generatedDraftIdRef.current = null
      } catch (err) {
        if (isCancelled) {
          return
        }

        const apiError = err as ApiError
        const message =
          apiError.status === 401
            ? 'Please log in again to continue editing this draft.'
            : apiError.status === 403 || apiError.status === 404
              ? 'This draft is not available for your account. Start a new upload or open one of your drafts.'
              : apiError.message || 'We could not load this draft. Please try again.'
        setHydrationError(message)
      } finally {
        if (!isCancelled) {
          setIsDraftLoading(false)
        }
      }
    }

    loadDraft()

    return () => {
      isCancelled = true
    }
  }, [
    hydrateFromBackendDraft,
    hydrateFromQuery,
    retryCount,
    router,
    router.isReady,
    router.pathname,
    router.query,
    router.replace,
    setHydrationError,
    allowNavigationRef
  ])

  const handleRetryDraftLoad = () => {
    lastHydratedDraftIdRef.current = null
    lastHydratedArtworkIdRef.current = null
    setRetryCount((count) => count + 1)
  }

  const handleStartNewDraft = () => {
    const nextDraftId = createDraftArtworkId()
    generatedDraftIdRef.current = nextDraftId
    lastHydratedDraftIdRef.current = null
    lastHydratedArtworkIdRef.current = null
    resetDraft()
    setHydrationError(null)
    const nextQuery = { ...router.query }
    delete nextQuery.artworkId
    nextQuery.draftArtworkId = nextDraftId
    allowNavigationRef.current = true
    router
      .replace(
        {
          pathname: router.pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true },
      )
      .finally(() => {
        allowNavigationRef.current = false
      })
  }

  return {
    isDraftLoading,
    isEditingArtwork,
    artworkIdParam,
    hydrationError,
    handleRetryDraftLoad,
    handleStartNewDraft,
  }
}
