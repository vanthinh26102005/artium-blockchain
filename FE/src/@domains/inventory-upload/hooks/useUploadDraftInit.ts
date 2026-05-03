import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import type { ApiError } from '@shared/services/apiClient'
import artworkApis from '@shared/apis/artworkApis'
import { useUploadArtworkStore } from '@domains/inventory-upload/stores/useUploadArtworkStore'

/**
 * createDraftArtworkId - Utility function
 * @returns void
 */
const createDraftArtworkId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const getQueryParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

/**
 * getQueryParam - Utility function
 * @returns void
 */
export const useUploadDraftInit = (allowNavigationRef: React.RefObject<boolean>) => {
  const router = useRouter()

  const hydrateFromQuery = useUploadArtworkStore((state) => state.hydrateFromQuery)
  const hydrateFromBackendDraft = useUploadArtworkStore((state) => state.hydrateFromBackendDraft)
  const hydrationError = useUploadArtworkStore((state) => state.hydrationError)
  /**
   * useUploadDraftInit - Custom React hook
   * @returns void
   */
  const setHydrationError = useUploadArtworkStore((state) => state.setHydrationError)
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft)

  const [isDraftLoading, setIsDraftLoading] = useState(false)
  /**
   * router - Utility function
   * @returns void
   */
  const [retryCount, setRetryCount] = useState(0)

  const generatedDraftIdRef = useRef<string | null>(null)
  const lastHydratedDraftIdRef = useRef<string | null>(null)
  const lastHydratedArtworkIdRef = useRef<string | null>(null)
  /**
   * hydrateFromQuery - Utility function
   * @returns void
   */

  const artworkIdParam = getQueryParam(router.query.artworkId)
  const isEditingArtwork = Boolean(artworkIdParam)

  /**
   * hydrateFromBackendDraft - Utility function
   * @returns void
   */
  useEffect(() => {
    if (!router.isReady) {
      return
    }
    /**
     * hydrationError - Utility function
     * @returns void
     */

    const artworkIdParamStr = getQueryParam(router.query.artworkId)
    const legacyDraftParam = router.query.draft
    const draftArtworkIdQuery = router.query.draftArtworkId ?? legacyDraftParam
    /**
     * setHydrationError - Utility function
     * @returns void
     */
    const draftArtworkIdParam = getQueryParam(draftArtworkIdQuery)

    if (artworkIdParamStr) {
      if (lastHydratedArtworkIdRef.current === artworkIdParamStr) {
        /**
         * resetDraft - Utility function
         * @returns void
         */
        return
      }

      let isCancelled = false
      const loadArtwork = async () => {
        hydrateFromQuery(artworkIdParamStr)
        setHydrationError(null)
        setIsDraftLoading(true)
        /**
         * generatedDraftIdRef - Utility function
         * @returns void
         */
        generatedDraftIdRef.current = null
        lastHydratedDraftIdRef.current = null

        try {
          /**
           * lastHydratedDraftIdRef - Utility function
           * @returns void
           */
          const artwork = await artworkApis.getArtworkById(artworkIdParamStr)

          if (isCancelled) {
            return
            /**
             * lastHydratedArtworkIdRef - Utility function
             * @returns void
             */
          }

          if (!artwork) {
            setHydrationError('This artwork is not available for your account.')
            return
            /**
             * artworkIdParam - Utility function
             * @returns void
             */
          }

          hydrateFromBackendDraft(artwork)
          lastHydratedArtworkIdRef.current = artworkIdParamStr
          /**
           * isEditingArtwork - Utility function
           * @returns void
           */
        } catch (err) {
          if (isCancelled) {
            return
          }

          const apiError = err as ApiError
          const message =
            apiError.status === 401
              ? 'Please log in again to continue editing this artwork.'
              : apiError.status === 403 || apiError.status === 404
                ? /**
                   * artworkIdParamStr - Utility function
                   * @returns void
                   */
                  'This artwork is not available for your account.'
                : apiError.message || 'We could not load this artwork. Please try again.'
          setHydrationError(message)
        } finally {
          /**
           * legacyDraftParam - Utility function
           * @returns void
           */
          if (!isCancelled) {
            setIsDraftLoading(false)
          }
        }
        /**
         * draftArtworkIdQuery - Utility function
         * @returns void
         */
      }

      loadArtwork()

      /**
       * draftArtworkIdParam - Utility function
       * @returns void
       */
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
      /**
       * loadArtwork - Utility function
       * @returns void
       */
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
          /**
           * artwork - Utility function
           * @returns void
           */
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
          /**
           * apiError - Utility function
           * @returns void
           */
          { shallow: true },
        )
        .finally(() => {
          allowNavigationRef.current = false
          /**
           * message - Utility function
           * @returns void
           */
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
          /**
           * nextQuery - Utility function
           * @returns void
           */
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
    /**
     * nextDraftId - Utility function
     * @returns void
     */
    hydrateFromBackendDraft,
    hydrateFromQuery,
    retryCount,
    router,
    router.isReady,
    router.pathname,
    router.query,
    router.replace,
    setHydrationError,
    allowNavigationRef,
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
    /**
     * loadDraft - Utility function
     * @returns void
     */
    allowNavigationRef.current = true
    router
      .replace(
        {
          /**
           * isGeneratedDraft - Utility function
           * @returns void
           */
          pathname: router.pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true },
      )
      .finally(() => {
        allowNavigationRef.current = false
      })
    /**
     * draft - Utility function
     * @returns void
     */
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

/**
 * apiError - Utility function
 * @returns void
 */
/**
 * message - Utility function
 * @returns void
 */
/**
 * handleRetryDraftLoad - Utility function
 * @returns void
 */
/**
 * handleStartNewDraft - Utility function
 * @returns void
 */
/**
 * nextDraftId - Utility function
 * @returns void
 */
/**
 * nextQuery - Utility function
 * @returns void
 */
