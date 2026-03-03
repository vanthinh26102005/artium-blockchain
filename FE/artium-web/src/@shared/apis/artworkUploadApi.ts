/**
 * Artwork Upload API Service
 * 
 * Provides functions for uploading artwork images and avatars.
 * Handles multipart/form-data uploads with progress tracking.
 * 
 * Backend endpoints:
 * - POST /artwork/uploads/artwork-image
 * - POST /artwork/uploads/artwork-images
 * - POST /artwork/uploads/avatar
 */

import { useAuthStore } from "@domains/auth/stores/useAuthStore";
import { UploadErrorType } from "@shared/types/artwork";
import type {
  ArtworkImageUploadResponse,
  AvatarUploadResponse,
  UploadArtworkImageRequest,
  UploadArtworkImagesRequest,
  UploadAvatarRequest,
  UploadOptions,
  UploadError,
} from "@shared/types/artwork";

// ============================================================================
// Configuration
// ============================================================================

const UPLOAD_BASE_URL = (
  process.env.NEXT_PUBLIC_ARTWORK_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).replace(/\/$/, "");

const DEFAULT_TIMEOUT = 60000; // 60 seconds for uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build full URL for upload endpoint
 */
const buildUploadUrl = (path: string): string => {
  const base = UPLOAD_BASE_URL.replace(/\/artwork$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/artwork/uploads${normalizedPath}`;
};

/**
 * Create upload error with proper typing
 */
const createUploadError = (
  type: UploadErrorType,
  message: string,
  statusCode?: number,
  details?: any,
): UploadError => {
  const error = new Error(message) as UploadError;
  error.type = type;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

/**
 * Validate file before upload
 */
const validateFile = (file: File, maxSize = MAX_FILE_SIZE): void => {
  if (file.size > maxSize) {
    throw createUploadError(
      UploadErrorType.FILE_TOO_LARGE,
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw createUploadError(
      UploadErrorType.INVALID_FILE_TYPE,
      `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    );
  }
};

/**
 * Extract error message from API response
 */
const extractErrorMessage = (data: any, fallback: string): string => {
  if (data && typeof data === "object") {
    if ("message" in data) {
      const message = data.message;
      if (Array.isArray(message)) {
        return message.join(", ");
      }
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
  }
  return fallback;
};

/**
 * Upload with XMLHttpRequest for progress tracking
 */
const uploadWithProgress = <T>(
  url: string,
  formData: FormData,
  options?: UploadOptions,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Setup abort signal
    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(
          createUploadError(UploadErrorType.NETWORK_ERROR, "Upload cancelled by user"),
        );
      });
    }

    // Setup timeout
    xhr.timeout = DEFAULT_TIMEOUT;

    // Track upload progress
    if (options?.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          options.onProgress?.({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }

    // Handle completion
    xhr.addEventListener("load", () => {
      const contentType = xhr.getResponseHeader("content-type") ?? "";
      const isJson = contentType.includes("application/json");

      let data: any;
      try {
        data = isJson ? JSON.parse(xhr.responseText) : xhr.responseText;
      } catch {
        data = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        const message = extractErrorMessage(data, `Upload failed with status ${xhr.status}`);
        reject(
          createUploadError(UploadErrorType.UPLOAD_FAILED, message, xhr.status, data),
        );
      }
    });

    // Handle network errors
    xhr.addEventListener("error", () => {
      reject(
        createUploadError(UploadErrorType.NETWORK_ERROR, "Network error occurred during upload"),
      );
    });

    // Handle timeout
    xhr.addEventListener("timeout", () => {
      reject(
        createUploadError(UploadErrorType.NETWORK_ERROR, "Upload request timed out"),
      );
    });

    // Handle abort
    xhr.addEventListener("abort", () => {
      reject(
        createUploadError(UploadErrorType.NETWORK_ERROR, "Upload was aborted"),
      );
    });

    // Setup request
    xhr.open("POST", url);

    // Add auth token if available
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    // Send request
    xhr.send(formData);
  });
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Upload a single artwork image
 * 
 * @param request - Upload request parameters
 * @param options - Upload options (progress, abort signal)
 * @returns Promise with upload response
 * 
 * @example
 * ```typescript
 * const response = await uploadArtworkImage({
 *   file: imageFile,
 *   sellerId: '123',
 *   artworkId: '456',
 *   altText: 'Beautiful artwork',
 *   isPrimary: true
 * }, {
 *   onProgress: ({ percentage }) => console.log(`${percentage}%`)
 * });
 * ```
 */
export const uploadArtworkImage = async (
  request: UploadArtworkImageRequest,
  options?: UploadOptions,
): Promise<ArtworkImageUploadResponse> => {
  const { file, sellerId, artworkId, altText, isPrimary, order } = request;

  // Validate inputs
  if (!sellerId || sellerId === "undefined") {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "sellerId is required and must not be 'undefined'",
    );
  }

  if (!artworkId || artworkId === "undefined") {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "artworkId is required and must not be 'undefined'",
    );
  }

  validateFile(file);

  // Build FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sellerId", sellerId);
  formData.append("artworkId", artworkId);

  if (altText) {
    formData.append("altText", altText);
  }

  if (typeof isPrimary === "boolean") {
    formData.append("isPrimary", String(isPrimary));
  }

  if (typeof order === "number") {
    formData.append("order", String(order));
  }

  // Upload with progress
  const url = buildUploadUrl("/artwork-image");
  return uploadWithProgress<ArtworkImageUploadResponse>(url, formData, options);
};

/**
 * Upload multiple artwork images (max 10)
 * 
 * @param request - Upload request parameters
 * @param options - Upload options (progress, abort signal)
 * @returns Promise with array of upload responses
 * 
 * @example
 * ```typescript
 * const responses = await uploadArtworkImages({
 *   files: [file1, file2, file3],
 *   sellerId: '123',
 *   artworkId: '456'
 * }, {
 *   onProgress: ({ percentage }) => console.log(`${percentage}%`)
 * });
 * ```
 */
export const uploadArtworkImages = async (
  request: UploadArtworkImagesRequest,
  options?: UploadOptions,
): Promise<ArtworkImageUploadResponse[]> => {
  const { files, sellerId, artworkId } = request;

  // Validate inputs
  if (!sellerId || sellerId === "undefined") {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "sellerId is required and must not be 'undefined'",
    );
  }

  if (!artworkId || artworkId === "undefined") {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "artworkId is required and must not be 'undefined'",
    );
  }

  if (!files || files.length === 0) {
    throw createUploadError(UploadErrorType.INVALID_PARAMS, "At least one file is required");
  }

  if (files.length > 10) {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "Maximum 10 files allowed per upload",
    );
  }

  // Validate all files
  files.forEach((file) => validateFile(file));

  // Build FormData
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("sellerId", sellerId);
  formData.append("artworkId", artworkId);

  // Upload with progress
  const url = buildUploadUrl("/artwork-images");
  return uploadWithProgress<ArtworkImageUploadResponse[]>(url, formData, options);
};

/**
 * Upload user avatar image
 * 
 * @param request - Upload request parameters
 * @param options - Upload options (progress, abort signal)
 * @returns Promise with avatar URLs
 * 
 * @example
 * ```typescript
 * const response = await uploadAvatar({
 *   file: avatarFile,
 *   userId: '123'
 * }, {
 *   onProgress: ({ percentage }) => console.log(`${percentage}%`)
 * });
 * ```
 */
export const uploadAvatar = async (
  request: UploadAvatarRequest,
  options?: UploadOptions,
): Promise<AvatarUploadResponse> => {
  const { file, userId } = request;

  // Validate inputs
  if (!userId || userId === "undefined") {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "userId is required and must not be 'undefined'",
    );
  }

  validateFile(file);

  // Build FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);

  // Upload with progress
  const url = buildUploadUrl("/avatar");
  return uploadWithProgress<AvatarUploadResponse>(url, formData, options);
};

// ============================================================================
// Exports
// ============================================================================

const artworkUploadApi = {
  uploadArtworkImage,
  uploadArtworkImages,
  uploadAvatar,
};

export default artworkUploadApi;
