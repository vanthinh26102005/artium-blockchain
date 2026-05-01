// react
import { useEffect, useRef, useState } from 'react'

// next
import { useRouter } from 'next/router'

// @shared - seo
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Dialog, DialogContent } from '@shared/components/ui/dialog'

// @domains - inventory upload
import { UploadWizardShell } from '@domains/inventory-upload/components/layout/UploadWizardShell'
import { Step1Layout } from '@domains/inventory-upload/components/step-1/Step1Layout'
import { Step2Layout } from '@domains/inventory-upload/components/step-2/Step2Layout'
import { SubmissionProgress } from '@domains/inventory-upload/components/shared/SubmissionProgress'
import { useUploadArtworkStore } from '@domains/inventory-upload/stores/useUploadArtworkStore'
import { useArtworkSubmit } from '@domains/inventory-upload/hooks/useArtworkSubmit'
import { useAuthStore } from '@/@domains/auth/stores/useAuthStore'

const TOTAL_STEPS = 2

const createDraftArtworkId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const UploadPage = () => {
  // -- router --
  const router = useRouter()

  // -- auth --
  const user = useAuthStore((state) => state.user)

  // -- state --
  const step = useUploadArtworkStore((state) => state.step)
  const draftId = useUploadArtworkStore((state) => state.draftId)
  const isHydrated = useUploadArtworkStore((state) => state.isHydrated)
  const media = useUploadArtworkStore((state) => state.media)
  const story = useUploadArtworkStore((state) => state.story)
  const isDirty = useUploadArtworkStore((state) => state.isDirty)
  const hydrateFromQuery = useUploadArtworkStore((state) => state.hydrateFromQuery)
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft)
  const nextStep = useUploadArtworkStore((state) => state.nextStep)
  const prevStep = useUploadArtworkStore((state) => state.prevStep)
  const getStepStatus = useUploadArtworkStore((state) => state.getStepStatus)
  const clearDirty = useUploadArtworkStore((state) => state.clearDirty)
  const validateStep = useUploadArtworkStore((state) => state.validateStep)
  const revokeMediaPreviews = useUploadArtworkStore((state) => state.revokeMediaPreviews)

  const [isExitOpen, setIsExitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const allowNavigationRef = useRef(false)

  // -- submission --
  const { submit, submitting, progress, error, completedArtwork, reset: resetSubmit } = useArtworkSubmit()

  const stepStatus = getStepStatus(step)

  // -- effects --
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const draftArtworkIdParam = Array.isArray(router.query.draftArtworkId)
      ? router.query.draftArtworkId[0]
      : router.query.draftArtworkId

    if (!draftArtworkIdParam) {
      const nextDraftId = createDraftArtworkId()
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
      hydrateFromQuery(nextDraftId)
      return
    }

    hydrateFromQuery(draftArtworkIdParam)
  }, [router.isReady, router.pathname, router.query, router.replace, router, hydrateFromQuery])

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
        alert('Please log in to submit artwork')
        return
      }

      try {
        setIsSubmitting(true)
        const artwork = await submit(user.id)

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

  // -- render --
  return (
    <>
      <Metadata title="Upload Artwork | Artium" />
      <UploadWizardShell
        title="Upload Artwork"
        step={step}
        totalSteps={TOTAL_STEPS}
        onCancel={handleClose}
        onPrev={handlePrevStep}
        onNext={handleNextStep}
        isNextDisabled={!stepStatus.isValid}
      >
        {step === 1 ? <Step1Layout /> : <Step2Layout />}
      </UploadWizardShell>
      <Dialog open={isExitOpen} onOpenChange={setIsExitOpen}>
        <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
          <div className="px-8 py-6">
            <h2 className="text-[22px] font-bold text-[#191414] uppercase">Exit Draft?</h2>
            <p className="mt-4 text-[18px] text-[#191414]">
              Your progress has been saved automatically, you can exit or discard your progress
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-black/10 text-[18px] font-semibold">
            <button
              type="button"
              onClick={handleDeleteDraft}
              className="px-6 py-5 text-center text-red-500 transition hover:bg-red-50"
            >
              Delete Draft
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
      <Dialog open={submitting || !!completedArtwork} onOpenChange={() => {
        if (completedArtwork && !submitting) {
          resetSubmit()
        }
      }}>
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
