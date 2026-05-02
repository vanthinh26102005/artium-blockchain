// react
import { useEffect, useRef, useState } from 'react'

// next
import { useRouter } from 'next/router'

// @shared - seo
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import type { ApiError } from '@shared/services/apiClient'
import artworkApis from '@shared/apis/artworkApis'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'

// @domains - inventory upload
import { UploadWizardShell } from '@domains/inventory-upload/components/layout/UploadWizardShell'
import { Step1Layout } from '@domains/inventory-upload/components/step-1/Step1Layout'
import { Step2Layout } from '@domains/inventory-upload/components/step-2/Step2Layout'
import { SubmissionProgress } from '@domains/inventory-upload/components/shared/SubmissionProgress'
import { useUploadArtworkStore } from '@domains/inventory-upload/stores/useUploadArtworkStore'
import { useArtworkSubmit } from '@domains/inventory-upload/hooks/useArtworkSubmit'
import { resolveUploadCreatorName } from '@domains/inventory-upload/utils/artistIdentity'
import { useAuthStore } from '@/@domains/auth/stores/useAuthStore'

const TOTAL_STEPS = 2

const createDraftArtworkId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const getQueryParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export const UploadPage = () => {
  // -- router --
  const router = useRouter()

  // -- auth --
  const user = useAuthStore((state) => state.user)

  // -- state --
  const step = useUploadArtworkStore((state) => state.step)
  const draftId = useUploadArtworkStore((state) => state.draftId)
  const isDirty = useUploadArtworkStore((state) => state.isDirty)
  const hydrateFromQuery = useUploadArtworkStore((state) => state.hydrateFromQuery)
  const hydrateFromBackendDraft = useUploadArtworkStore((state) => state.hydrateFromBackendDraft)
  const hydrationError = useUploadArtworkStore((state) => state.hydrationError)
  const setHydrationError = useUploadArtworkStore((state) => state.setHydrationError)
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft)
  const nextStep = useUploadArtworkStore((state) => state.nextStep)
  const prevStep = useUploadArtworkStore((state) => state.prevStep)
  const getStepStatus = useUploadArtworkStore((state) => state.getStepStatus)
  const clearDirty = useUploadArtworkStore((state) => state.clearDirty)
  const validateStep = useUploadArtworkStore((state) => state.validateStep)
  const revokeMediaPreviews = useUploadArtworkStore((state) => state.revokeMediaPreviews)

  const [isExitOpen, setIsExitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftLoading, setIsDraftLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [sellerProfile, setSellerProfile] = useState<SellerProfilePayload | null>(null)
  const allowNavigationRef = useRef(false)
  const generatedDraftIdRef = useRef<string | null>(null)
  const lastHydratedDraftIdRef = useRef<string | null>(null)
  const lastHydratedArtworkIdRef = useRef<string | null>(null)
  const artworkIdParam = getQueryParam(router.query.artworkId)
  const isEditingArtwork = Boolean(artworkIdParam)

  // -- submission --
  const {
    submit,
    updateExisting,
    submitting,
    progress,
    error,
    completedArtwork,
    reset: resetSubmit,
  } = useArtworkSubmit()

  const stepStatus = getStepStatus(step)

  // -- effects --
  useEffect(() => {
    if (!user?.id) {
      setSellerProfile(null)
      return
    }

    let isCancelled = false

    const loadSellerProfile = async () => {
      try {
        const profile = await profileApis.getSellerProfileByUserId(user.id)
        if (!isCancelled) {
          setSellerProfile(profile)
        }
      } catch {
        if (!isCancelled) {
          setSellerProfile(null)
        }
      }
    }

    loadSellerProfile()

    return () => {
      isCancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const artworkIdParam = getQueryParam(router.query.artworkId)
    const legacyDraftParam = router.query.draft
    const draftArtworkIdQuery = router.query.draftArtworkId ?? legacyDraftParam
    const draftArtworkIdParam = getQueryParam(draftArtworkIdQuery)

    if (artworkIdParam) {
      if (lastHydratedArtworkIdRef.current === artworkIdParam) {
        return
      }

      let isCancelled = false
      const loadArtwork = async () => {
        hydrateFromQuery(artworkIdParam)
        setHydrationError(null)
        setIsDraftLoading(true)
        generatedDraftIdRef.current = null
        lastHydratedDraftIdRef.current = null

        try {
          const artwork = await artworkApis.getArtworkById(artworkIdParam)

          if (isCancelled) {
            return
          }

          if (!artwork) {
            setHydrationError('This artwork is not available for your account.')
            return
          }

          hydrateFromBackendDraft(artwork)
          lastHydratedArtworkIdRef.current = artworkIdParam
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
  ])

  useEffect(() => {
    return () => revokeMediaPreviews()
  }, [revokeMediaPreviews])

  useEffect(() => {
    validateStep(step)
  }, [step, validateStep])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
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
  }, [clearDirty, isDirty, router.events])

  // -- handlers --
  const handlePrevStep = () => {
    prevStep()
  }

  const handleNextStep = async () => {
    // If on step 2 (final step), submit the artwork
    if (step === TOTAL_STEPS) {
      if (!user || !user.id) {
        setHydrationError('Please log in to submit artwork.')
        return
      }

      if (isEditingArtwork && !artworkIdParam) {
        setHydrationError('Artwork id is missing. Refresh the page and try again.')
        return
      }

      if (!isEditingArtwork && !draftId) {
        setHydrationError('Draft artwork id is missing. Refresh the page and try again.')
        return
      }

      if (hydrationError || isDraftLoading) {
        return
      }

      try {
        setIsSubmitting(true)
        const creatorName = resolveUploadCreatorName(user, sellerProfile)
        const artwork = isEditingArtwork
          ? await updateExisting(artworkIdParam ?? '', {
              creatorName,
            })
          : await submit(draftId ?? '', {
              creatorName,
            })

        if (artwork) {
          // Success! Navigate to inventory or artwork detail
          allowNavigationRef.current = true
          clearDirty()
          router.push(`/inventory`)
        }
      } catch (err) {
        console.error('Submission failed:', err)
        // Error is already captured in the hook
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Move to next step
      nextStep()
    }
  }

  const handleClose = () => {
    if (step === 1) {
      setIsExitOpen(true)
      return
    }
    router.push('/inventory')
  }

  const handleExitDraft = () => {
    setIsExitOpen(false)
    allowNavigationRef.current = true
    clearDirty()
    router.push('/inventory')
  }

  const handleDeleteDraft = () => {
    allowNavigationRef.current = true
    resetDraft()
    setIsExitOpen(false)
    router.push('/inventory')
  }

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

  // -- render --
  return (
    <>
      <Metadata title={`${isEditingArtwork ? 'Edit' : 'Upload'} Artwork | Artium`} />
      <UploadWizardShell
        title={isEditingArtwork ? 'Edit Artwork' : 'Upload Artwork'}
        step={step}
        totalSteps={TOTAL_STEPS}
        onCancel={handleClose}
        onPrev={handlePrevStep}
        onNext={handleNextStep}
        isNextDisabled={
          !stepStatus.isValid || isDraftLoading || !!hydrationError || submitting || isSubmitting
        }
      >
        {isDraftLoading ? (
          <div className="mx-auto mt-16 max-w-2xl rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#0F6BFF]" />
            <h1 className="mt-6 text-[22px] font-bold text-[#191414]">
              Loading {isEditingArtwork ? 'artwork' : 'draft'}
            </h1>
            <p className="mt-2 text-[15px] text-black/60">
              Syncing the upload form before you continue.
            </p>
          </div>
        ) : hydrationError ? (
          <div className="mx-auto mt-16 max-w-2xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-[22px] font-bold text-[#191414]">
              {isEditingArtwork ? 'Artwork unavailable' : 'Draft unavailable'}
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-black/65">{hydrationError}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetryDraftLoad}
                className="rounded-full px-6"
              >
                Try Again
              </Button>
              <Button type="button" onClick={handleStartNewDraft} className="rounded-full px-6">
                Start New Draft
              </Button>
            </div>
          </div>
        ) : step === 1 ? (
          <Step1Layout currentUser={user} sellerProfile={sellerProfile} />
        ) : (
          <Step2Layout />
        )}
      </UploadWizardShell>
      <Dialog open={isExitOpen} onOpenChange={setIsExitOpen}>
        <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
          <div className="px-8 py-6">
            <h2 className="text-[22px] font-bold text-[#191414] uppercase">
              {isEditingArtwork ? 'Exit Editing?' : 'Exit Draft?'}
            </h2>
            <p className="mt-4 text-[18px] text-[#191414]">
              {isEditingArtwork
                ? 'You can exit and discard your unsaved changes.'
                : 'Your progress has been saved automatically, you can exit or discard your progress'}
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-black/10 text-[18px] font-semibold">
            <button
              type="button"
              onClick={handleDeleteDraft}
              className="px-6 py-5 text-center text-red-500 transition hover:bg-red-50"
            >
              {isEditingArtwork ? 'Discard Changes' : 'Delete Draft'}
            </button>
            <button
              type="button"
              onClick={handleExitDraft}
              className="border-l border-black/10 px-6 py-5 text-center text-[#191414] transition hover:bg-black/5"
            >
              Exit
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission Progress Dialog */}
      <Dialog
        open={submitting || !!completedArtwork}
        onOpenChange={() => {
          if (completedArtwork && !submitting) {
            resetSubmit()
          }
        }}
      >
        <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
          <div className="px-8 py-6">
            {progress && (
              <SubmissionProgress
                stage={progress.stage}
                message={progress.message}
                percentage={progress.percentage}
                currentFile={progress.currentFile}
                error={error}
              />
            )}

            {completedArtwork && !submitting && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    allowNavigationRef.current = true
                    router.push(`/inventory`)
                  }}
                  className="rounded-full bg-[#0F6BFF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0F6BFF]/90"
                >
                  Go to Inventory
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
