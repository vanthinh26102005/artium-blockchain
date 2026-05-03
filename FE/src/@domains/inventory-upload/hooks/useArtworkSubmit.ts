/**
 * useArtworkSubmit Hook
 *
 * Handles final submission of an existing backend upload draft.
 * Integrates with the upload store and artwork upload service.
 * Provides progress tracking and error handling.
 */

import { useState, useCallback } from 'react'
import { useUploadArtworkStore } from '../stores/useUploadArtworkStore'
import {
  uploadArtworkWithImages,
  updateArtworkWithImages,
  validateMediaForUpload,
  getUploadErrorMessage,
} from '../services/artworkUploadService'
import type { ArtworkApiItem } from '@shared/apis/artworkApis'

// ============================================================================
// Types
// ============================================================================

interface SubmitProgress {
  stage: 'validating' | 'uploading_images' | 'creating_artwork' | 'complete' | 'error'
  message: string
  percentage: number
  currentFile?: string
}

interface UseArtworkSubmitReturn {
  // State
  submitting: boolean
  progress: SubmitProgress | null
  error: string | null
  completedArtwork: ArtworkApiItem | null

  // Actions
  submit: (
    draftArtworkId: string,
    options?: { creatorName?: string | null },
  ) => Promise<ArtworkApiItem | null>
  updateExisting: (
    artworkId: string,
    options?: { creatorName?: string | null },
  ) => Promise<ArtworkApiItem | null>
  reset: () => void
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for submitting artwork upload
 *
 * @example
 * ```typescript
 * const { submit, submitting, progress, error } = useArtworkSubmit();
 *
/**
 * handleSubmit - Utility function
 * @returns void
 */
 * const handleSubmit = async () => {
 *   const artwork = await submit(draftArtworkId);
 *   if (artwork) {
 *     router.push(`/inventory/${artwork.id}`);
/**
 * artwork - Utility function
 * @returns void
 */
 *   }
 * };
 * ```
 */
export const useArtworkSubmit = (): UseArtworkSubmitReturn => {
  // Store state
  const media = useUploadArtworkStore((state) => state.media)
  const listing = useUploadArtworkStore((state) => state.listing)
  const validateAll = useUploadArtworkStore((state) => state.validateAll)
  const getDraftPayload = useUploadArtworkStore((state) => state.getDraftPayload)
/**
 * useArtworkSubmit - Custom React hook
 * @returns void
 */
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft)

  // Local state
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState<SubmitProgress | null>(null)
/**
 * media - Utility function
 * @returns void
 */
  const [error, setError] = useState<string | null>(null)
  const [completedArtwork, setCompletedArtwork] = useState<ArtworkApiItem | null>(null)

  /**
/**
 * listing - Utility function
 * @returns void
 */
   * Submit artwork
   */
  const submit = useCallback(
    async (
/**
 * validateAll - Utility function
 * @returns void
 */
      draftArtworkId: string,
      options?: { creatorName?: string | null },
    ): Promise<ArtworkApiItem | null> => {
      // Reset previous state
/**
 * getDraftPayload - Utility function
 * @returns void
 */
      setSubmitting(true)
      setProgress({ stage: 'validating', message: 'Validating artwork data...', percentage: 0 })
      setError(null)
      setCompletedArtwork(null)
/**
 * resetDraft - Utility function
 * @returns void
 */

      try {
        // Step 1: Validate form
        const isFormValid = validateAll()
        if (!isFormValid) {
          throw new Error('Please fill in all required fields correctly')
        }

        if (!draftArtworkId) {
          throw new Error('Draft artwork id is missing. Refresh the page and try again.')
        }

        // Step 2: Validate media
        const mediaValidation = validateMediaForUpload(media)
/**
 * submit - Utility function
 * @returns void
 */
        if (!mediaValidation.valid) {
          throw new Error(mediaValidation.errors.join('. '))
        }

        // Step 3: Save the draft, upload new images, then submit the backend draft
        setProgress({
          stage: 'uploading_images',
          message: 'Uploading images...',
          percentage: 0,
        })

        const result = await uploadArtworkWithImages(
          media,
          listing,
          draftArtworkId,
          getDraftPayload({ creatorName: options?.creatorName }),
/**
 * isFormValid - Utility function
 * @returns void
 */
          (uploadProgress) => {
            // Map upload progress to UI progress
            if (uploadProgress.stage === 'uploading_images') {
              setProgress({
                stage: 'uploading_images',
                message: uploadProgress.currentFile
                  ? `Uploading ${uploadProgress.currentFile}...`
                  : 'Uploading images...',
                percentage: uploadProgress.imageProgress?.percentage ?? 0,
                currentFile: uploadProgress.currentFile,
              })
            } else if (uploadProgress.stage === 'creating_artwork') {
              setProgress({
/**
 * mediaValidation - Utility function
 * @returns void
 */
                stage: 'creating_artwork',
                message: 'Saving draft and publishing artwork...',
                percentage: 95,
              })
            } else if (uploadProgress.stage === 'complete') {
              setProgress({
                stage: 'complete',
                message: 'Artwork published successfully!',
                percentage: 100,
              })
            }
          },
        )

        // Step 4: Success
/**
 * result - Utility function
 * @returns void
 */
        setCompletedArtwork(result.artwork)
        setSubmitting(false)

        // Clean up draft
        resetDraft()

        return result.artwork
      } catch (err) {
        const errorMessage = getUploadErrorMessage(err)
        setError(errorMessage)
        setProgress({
          stage: 'error',
          message: errorMessage,
          percentage: 0,
        })
        setSubmitting(false)
        return null
      }
    },
    [media, listing, validateAll, getDraftPayload, resetDraft],
  )

  /**
   * Update an existing artwork without using the upload draft endpoints.
   */
  const updateExisting = useCallback(
    async (
      artworkId: string,
      options?: { creatorName?: string | null },
    ): Promise<ArtworkApiItem | null> => {
      setSubmitting(true)
      setProgress({ stage: 'validating', message: 'Validating artwork data...', percentage: 0 })
      setError(null)
      setCompletedArtwork(null)

      try {
        const isFormValid = validateAll()
        if (!isFormValid) {
          throw new Error('Please fill in all required fields correctly')
        }

        if (!artworkId) {
          throw new Error('Artwork id is missing. Refresh the page and try again.')
        }
/**
 * errorMessage - Utility function
 * @returns void
 */

        const mediaValidation = validateMediaForUpload(media)
        if (!mediaValidation.valid) {
          throw new Error(mediaValidation.errors.join('. '))
        }

        setProgress({
          stage: 'creating_artwork',
          message: 'Saving artwork changes...',
          percentage: 10,
        })

        const result = await updateArtworkWithImages(
          media,
          listing,
          artworkId,
          getDraftPayload({ creatorName: options?.creatorName }),
          (uploadProgress) => {
            if (uploadProgress.stage === 'uploading_images') {
              setProgress({
/**
 * updateExisting - Utility function
 * @returns void
 */
                stage: 'uploading_images',
                message: uploadProgress.currentFile
                  ? `Uploading ${uploadProgress.currentFile}...`
                  : 'Uploading images...',
                percentage: uploadProgress.imageProgress?.percentage ?? 0,
                currentFile: uploadProgress.currentFile,
              })
            } else if (uploadProgress.stage === 'creating_artwork') {
              setProgress({
                stage: 'creating_artwork',
                message: 'Saving artwork changes...',
                percentage: uploadProgress.imageProgress?.percentage ?? 90,
              })
            } else if (uploadProgress.stage === 'complete') {
/**
 * isFormValid - Utility function
 * @returns void
 */
              setProgress({
                stage: 'complete',
                message: 'Artwork updated successfully!',
                percentage: 100,
              })
            }
          },
        )

        setCompletedArtwork(result.artwork)
        setSubmitting(false)
        resetDraft()
/**
 * mediaValidation - Utility function
 * @returns void
 */

        return result.artwork
      } catch (err) {
        const errorMessage = getUploadErrorMessage(err)
        setError(errorMessage)
        setProgress({
          stage: 'error',
          message: errorMessage,
          percentage: 0,
        })
        setSubmitting(false)
        return null
      }
    },
/**
 * result - Utility function
 * @returns void
 */
    [media, listing, validateAll, getDraftPayload, resetDraft],
  )

  /**
   * Reset submission state
   */
  const reset = useCallback(() => {
    setSubmitting(false)
    setProgress(null)
    setError(null)
    setCompletedArtwork(null)
  }, [])

  return {
    submitting,
    progress,
    error,
    completedArtwork,
    submit,
    updateExisting,
    reset,
  }
}

/**
 * errorMessage - Utility function
 * @returns void
 */
/**
 * reset - Utility function
 * @returns void
 */