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
/**
 * handleUpload - Utility function
 * @returns void
 */
 * const handleUpload = async (file: File) => {
 *   const response = await uploadImage({
 *     file,
 *     sellerId: '123',
/**
 * response - Utility function
 * @returns void
 */
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
/**
 * useArtworkUpload - Custom React hook
 * @returns void
 */

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: null,
/**
 * abortControllerRef - Utility function
 * @returns void
 */
      error: null,
    });
    abortControllerRef.current = null;
  }, []);

  /**
   * Cancel ongoing upload
   */
/**
 * reset - Utility function
 * @returns void
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
/**
 * cancel - Utility function
 * @returns void
 */
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
/**
 * uploadImage - Utility function
 * @returns void
 */
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
/**
 * abortController - Utility function
 * @returns void
 */
        return response;
      } catch (err) {
        const error = err as UploadError;
        setState({
          uploading: false,
          progress: null,
          error,
/**
 * response - Utility function
 * @returns void
 */
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
/**
 * error - Utility function
 * @returns void
 */
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

/**
 * uploadImages - Utility function
 * @returns void
 */
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
/**
 * abortController - Utility function
 * @returns void
 */
    [],
  );

  /**
   * Upload avatar image
   */
  const uploadAvatar = useCallback(
/**
 * response - Utility function
 * @returns void
 */
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
/**
 * error - Utility function
 * @returns void
 */

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
/**
 * uploadAvatar - Utility function
 * @returns void
 */
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
/**
 * abortController - Utility function
 * @returns void
 */
  };
};

// ============================================================================
// Error Helper Hook
// ============================================================================

/**
 * response - Utility function
 * @returns void
 */
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

/**
 * error - Utility function
 * @returns void
 */
/**
 * useUploadErrorMessage - Custom React hook
 * @returns void
 */