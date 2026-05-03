// react
import { useEffect, useRef, useState } from 'react'

// next
import { useRouter } from 'next/router'

// @shared - seo
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
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
import { useUploadDraftInit } from '@domains/inventory-upload/hooks/useUploadDraftInit'
import { useUploadNavigationBlocker } from '@domains/inventory-upload/hooks/useUploadNavigationBlocker'

/**
 * TOTAL_STEPS - React component
 * @returns React element
 */
const TOTAL_STEPS = 2

export const UploadPage = () => {
  // -- router --
  const router = useRouter()
/**
 * UploadPage - React component
 * @returns React element
 */

  // -- auth --
  const user = useAuthStore((state) => state.user)

  // -- state --
/**
 * router - Utility function
 * @returns void
 */
  const step = useUploadArtworkStore((state) => state.step)
  const draftId = useUploadArtworkStore((state) => state.draftId)
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft)
  const nextStep = useUploadArtworkStore((state) => state.nextStep)
  const prevStep = useUploadArtworkStore((state) => state.prevStep)
  const clearDirty = useUploadArtworkStore((state) => state.clearDirty)
/**
 * user - Custom React hook
 * @returns void
 */
  const revokeMediaPreviews = useUploadArtworkStore((state) => state.revokeMediaPreviews)

  const [isExitOpen, setIsExitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sellerProfile, setSellerProfile] = useState<SellerProfilePayload | null>(null)
  const allowNavigationRef = useRef(false)
/**
 * step - Utility function
 * @returns void
 */

  // -- submission --
  const {
    submit,
/**
 * draftId - Utility function
 * @returns void
 */
    updateExisting,
    submitting,
    progress,
    error,
/**
 * resetDraft - Utility function
 * @returns void
 */
    completedArtwork,
    reset: resetSubmit,
  } = useArtworkSubmit()

/**
 * nextStep - Utility function
 * @returns void
 */
  const {
    isDraftLoading,
    isEditingArtwork,
    artworkIdParam,
/**
 * prevStep - Utility function
 * @returns void
 */
    hydrationError,
    handleRetryDraftLoad,
    handleStartNewDraft,
  } = useUploadDraftInit(allowNavigationRef)
/**
 * clearDirty - Utility function
 * @returns void
 */

  useUploadNavigationBlocker(allowNavigationRef)

  // -- effects --
/**
 * revokeMediaPreviews - Utility function
 * @returns void
 */
  useEffect(() => {
    if (!user?.id) {
      setSellerProfile(null)
      return
    }

    let isCancelled = false

/**
 * allowNavigationRef - Utility function
 * @returns void
 */
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
    return () => revokeMediaPreviews()
  }, [revokeMediaPreviews])

  // -- handlers --
  const handlePrevStep = () => {
    prevStep()
  }

  const handleNextStep = async () => {
    // If on step 2 (final step), submit the artwork
    if (step === TOTAL_STEPS) {
      if (!user || !user.id) {
        // Fallback alert instead of setting unmanaged hydration error state directly on UI without hook sync
        alert('Please log in to submit artwork.')
        return
/**
 * loadSellerProfile - Utility function
 * @returns void
 */
      }

      if (isEditingArtwork && !artworkIdParam) {
        alert('Artwork id is missing. Refresh the page and try again.')
        return
/**
 * profile - Utility function
 * @returns void
 */
      }

      if (!isEditingArtwork && !draftId) {
        alert('Draft artwork id is missing. Refresh the page and try again.')
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
/**
 * handlePrevStep - Utility function
 * @returns void
 */
          router.push(`/inventory`)
        }
      } catch (err) {
        console.error('Submission failed:', err)
        // Error is already captured in the hook
      } finally {
        setIsSubmitting(false)
/**
 * handleNextStep - Utility function
 * @returns void
 */
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
/**
 * creatorName - Utility function
 * @returns void
 */

  // -- render --
  return (
    <>
/**
 * artwork - Utility function
 * @returns void
 */
      <Metadata title={`${isEditingArtwork ? 'Edit' : 'Upload'} Artwork | Artium`} />
      <UploadWizardShell
        title={isEditingArtwork ? 'Edit Artwork' : 'Upload Artwork'}
        step={step}
        totalSteps={TOTAL_STEPS}
        onCancel={handleClose}
        onPrev={handlePrevStep}
        onNext={handleNextStep}
        isNextDisabled={
          isDraftLoading || !!hydrationError || submitting || isSubmitting
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
/**
 * handleClose - Utility function
 * @returns void
 */
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
/**
 * handleExitDraft - Utility function
 * @returns void
 */
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
/**
 * handleDeleteDraft - Utility function
 * @returns void
 */
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
