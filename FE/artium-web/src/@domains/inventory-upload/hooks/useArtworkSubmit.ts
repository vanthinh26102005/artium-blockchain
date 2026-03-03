/**
 * useArtworkSubmit Hook
 * 
 * Handles the final submission of artwork upload form.
 * Integrates with the upload store and artwork upload service.
 * Provides progress tracking and error handling.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useUploadArtworkStore } from "../stores/useUploadArtworkStore";
import {
  uploadArtworkWithImages,
  validateMediaForUpload,
  getUploadErrorMessage,
} from "../services/artworkUploadService";
import type { ArtworkApiItem } from "@shared/apis/artworkApis";

// ============================================================================
// Types
// ============================================================================

interface SubmitProgress {
  stage: 'validating' | 'uploading_images' | 'creating_artwork' | 'complete' | 'error';
  message: string;
  percentage: number;
  currentFile?: string;
}

interface UseArtworkSubmitReturn {
  // State
  submitting: boolean;
  progress: SubmitProgress | null;
  error: string | null;
  completedArtwork: ArtworkApiItem | null;

  // Actions
  submit: (sellerId: string) => Promise<ArtworkApiItem | null>;
  reset: () => void;
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
 * const handleSubmit = async () => {
 *   const artwork = await submit(user.id);
 *   if (artwork) {
 *     router.push(`/inventory/${artwork.id}`);
 *   }
 * };
 * ```
 */
export const useArtworkSubmit = (): UseArtworkSubmitReturn => {
  const router = useRouter();

  // Store state
  const media = useUploadArtworkStore((state) => state.media);
  const details = useUploadArtworkStore((state) => state.details);
  const listing = useUploadArtworkStore((state) => state.listing);
  const validateAll = useUploadArtworkStore((state) => state.validateAll);
  const resetDraft = useUploadArtworkStore((state) => state.resetDraft);

  // Local state
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<SubmitProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedArtwork, setCompletedArtwork] = useState<ArtworkApiItem | null>(null);

  /**
   * Submit artwork
   */
  const submit = useCallback(
    async (sellerId: string): Promise<ArtworkApiItem | null> => {
      // Reset previous state
      setSubmitting(true);
      setProgress({ stage: 'validating', message: 'Validating artwork data...', percentage: 0 });
      setError(null);
      setCompletedArtwork(null);

      try {
        // Step 1: Validate form
        const isFormValid = validateAll();
        if (!isFormValid) {
          throw new Error('Please fill in all required fields correctly');
        }

        // Step 2: Validate media
        const mediaValidation = validateMediaForUpload(media);
        if (!mediaValidation.valid) {
          throw new Error(mediaValidation.errors.join('. '));
        }

        // Step 3: Upload images and create artwork
        setProgress({
          stage: 'uploading_images',
          message: 'Uploading images...',
          percentage: 0,
        });

        const result = await uploadArtworkWithImages(
          media,
          details,
          listing,
          sellerId,
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
              });
            } else if (uploadProgress.stage === 'creating_artwork') {
              setProgress({
                stage: 'creating_artwork',
                message: 'Creating artwork...',
                percentage: 95,
              });
            } else if (uploadProgress.stage === 'complete') {
              setProgress({
                stage: 'complete',
                message: 'Artwork created successfully!',
                percentage: 100,
              });
            }
          },
        );

        // Step 4: Success
        setCompletedArtwork(result.artwork);
        setSubmitting(false);

        // Clean up draft
        resetDraft();

        return result.artwork;
      } catch (err) {
        const errorMessage = getUploadErrorMessage(err);
        setError(errorMessage);
        setProgress({
          stage: 'error',
          message: errorMessage,
          percentage: 0,
        });
        setSubmitting(false);
        return null;
      }
    },
    [media, details, listing, validateAll, resetDraft],
  );

  /**
   * Reset submission state
   */
  const reset = useCallback(() => {
    setSubmitting(false);
    setProgress(null);
    setError(null);
    setCompletedArtwork(null);
  }, []);

  return {
    submitting,
    progress,
    error,
    completedArtwork,
    submit,
    reset,
  };
};
