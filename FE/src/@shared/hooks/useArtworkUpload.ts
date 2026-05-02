/**
 * useArtworkUpload Hook
 * 
 * React hook for uploading artwork images with state management.
 * Provides progress tracking, error handling, and cancellation support.
 * 
 * @example
 * ```typescript
 * const { uploadImage, uploading, progress, error, reset } = useArtworkUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   const response = await uploadImage({
 *     file,
 *     sellerId: '123',
 *     artworkId: '456',
 *     altText: 'My artwork'
 *   });
 *   console.log('Uploaded:', response.secureUrl);
 * };
 * ```
 */

import { useState, useCallback, useRef } from "react";
import artworkUploadApi from "@shared/apis/artworkUploadApi";
import type {
  ArtworkImageUploadResponse,
  AvatarUploadResponse,
  UploadArtworkImageRequest,
  UploadArtworkImagesRequest,
  UploadAvatarRequest,
  UploadError,
} from "@shared/types/artwork";

// ============================================================================
// Types
// ============================================================================

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadState {
  uploading: boolean;
  progress: UploadProgress | null;
  error: UploadError | null;
}

interface UseArtworkUploadReturn {
  // State
  uploading: boolean;
  progress: UploadProgress | null;
  error: UploadError | null;

  // Actions
  uploadImage: (request: UploadArtworkImageRequest) => Promise<ArtworkImageUploadResponse>;
  uploadImages: (request: UploadArtworkImagesRequest) => Promise<ArtworkImageUploadResponse[]>;
  uploadAvatar: (request: UploadAvatarRequest) => Promise<AvatarUploadResponse>;
  cancel: () => void;
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for uploading artwork images and avatars
 */
export const useArtworkUpload = (): UseArtworkUploadReturn => {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: null,
      error: null,
    });
    abortControllerRef.current = null;
  }, []);

  /**
   * Cancel ongoing upload
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      uploading: false,
    }));
  }, []);

  /**
   * Upload single artwork image
   */
  const uploadImage = useCallback(
    async (request: UploadArtworkImageRequest): Promise<ArtworkImageUploadResponse> => {
      // Reset state
      setState({
        uploading: true,
        progress: null,
        error: null,
      });

      // Create abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await artworkUploadApi.uploadArtworkImage(request, {
          signal: abortController.signal,
          onProgress: (progress) => {
            setState((prev) => ({
              ...prev,
              progress,
            }));
          },
        });

        setState({
          uploading: false,
          progress: { loaded: 100, total: 100, percentage: 100 },
          error: null,
        });

        abortControllerRef.current = null;
        return response;
      } catch (err) {
        const error = err as UploadError;
        setState({
          uploading: false,
          progress: null,
          error,
        });
        abortControllerRef.current = null;
        throw error;
      }
    },
    [],
  );

  /**
   * Upload multiple artwork images
   */
  const uploadImages = useCallback(
    async (request: UploadArtworkImagesRequest): Promise<ArtworkImageUploadResponse[]> => {
      // Reset state
      setState({
        uploading: true,
        progress: null,
        error: null,
      });

      // Create abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await artworkUploadApi.uploadArtworkImages(request, {
          signal: abortController.signal,
          onProgress: (progress) => {
            setState((prev) => ({
              ...prev,
              progress,
            }));
          },
        });

        setState({
          uploading: false,
          progress: { loaded: 100, total: 100, percentage: 100 },
          error: null,
        });

        abortControllerRef.current = null;
        return response;
      } catch (err) {
        const error = err as UploadError;
        setState({
          uploading: false,
          progress: null,
          error,
        });
        abortControllerRef.current = null;
        throw error;
      }
    },
    [],
  );

  /**
   * Upload avatar image
   */
  const uploadAvatar = useCallback(
    async (request: UploadAvatarRequest): Promise<AvatarUploadResponse> => {
      // Reset state
      setState({
        uploading: true,
        progress: null,
        error: null,
      });

      // Create abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await artworkUploadApi.uploadAvatar(request, {
          signal: abortController.signal,
          onProgress: (progress) => {
            setState((prev) => ({
              ...prev,
              progress,
            }));
          },
        });

        setState({
          uploading: false,
          progress: { loaded: 100, total: 100, percentage: 100 },
          error: null,
        });

        abortControllerRef.current = null;
        return response;
      } catch (err) {
        const error = err as UploadError;
        setState({
          uploading: false,
          progress: null,
          error,
        });
        abortControllerRef.current = null;
        throw error;
      }
    },
    [],
  );

  return {
    uploading: state.uploading,
    progress: state.progress,
    error: state.error,
    uploadImage,
    uploadImages,
    uploadAvatar,
    cancel,
    reset,
  };
};

// ============================================================================
// Error Helper Hook
// ============================================================================

/**
 * Hook for formatting upload error messages
 */
export const useUploadErrorMessage = (error: UploadError | null): string | null => {
  if (!error) {
    return null;
  }

  // Return custom error message
  return error.message;
};
