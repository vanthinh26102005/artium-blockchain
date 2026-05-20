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

import { apiUpload } from '@shared/services/apiClient'
import { UploadErrorType } from '@shared/types/artwork'
import type {
  ArtworkImageUploadResponse,
  AvatarUploadResponse,
  UploadArtworkImageRequest,
  UploadArtworkImagesRequest,
  UploadEventCoverImageRequest,
  UploadAvatarRequest,
  UploadOptions,
  UploadError,
} from '@shared/types/artwork'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB default
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create upload error with proper typing
 */
const createUploadError = (
  type: UploadErrorType,
  message: string,
  statusCode?: number,
  details?: unknown,
): UploadError => {
  const error = new Error(message) as UploadError
  error.type = type
  error.statusCode = statusCode
  error.details = details
  return error
}

/**
 * Validate file before upload
 */
const validateFile = (file: File, maxSize = MAX_FILE_SIZE): void => {
  if (file.size > maxSize) {
    throw createUploadError(
      UploadErrorType.FILE_TOO_LARGE,
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
    )
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw createUploadError(
      UploadErrorType.INVALID_FILE_TYPE,
      `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    )
  }
}

/**
 * Build artwork upload service path.
 */
const buildUploadPath = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `/artwork/uploads${normalizedPath}`
}

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
  const { file, artworkId, altText, isPrimary, order } = request

  // Validate inputs
  if (!artworkId || artworkId === 'undefined') {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "artworkId is required and must not be 'undefined'",
    )
  }

  validateFile(file)

  // Build FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('artworkId', artworkId)

  if (altText) {
    formData.append('altText', altText)
  }

  if (typeof isPrimary === 'boolean') {
    formData.append('isPrimary', String(isPrimary))
  }

  if (typeof order === 'number') {
    formData.append('order', String(order))
  }

  return apiUpload<ArtworkImageUploadResponse>(buildUploadPath('/artwork-image'), formData, {
    ...options,
  })
}

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
  const { files, artworkId } = request

  // Validate inputs
  if (!artworkId || artworkId === 'undefined') {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "artworkId is required and must not be 'undefined'",
    )
  }

  if (!files || files.length === 0) {
    throw createUploadError(UploadErrorType.INVALID_PARAMS, 'At least one file is required')
  }

  if (files.length > 10) {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      'Maximum 10 files allowed per upload',
    )
  }

  // Validate all files
  files.forEach((file) => validateFile(file))

  // Build FormData
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('artworkId', artworkId)

  return apiUpload<ArtworkImageUploadResponse[]>(buildUploadPath('/artwork-images'), formData, {
    ...options,
  })
}

/**
 * Upload an event cover image.
 */
export const uploadEventCoverImage = async (
  request: UploadEventCoverImageRequest,
  options?: UploadOptions,
): Promise<ArtworkImageUploadResponse> => {
  const { file, eventId, altText } = request

  if (!eventId || eventId === 'undefined' || eventId === 'null') {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "eventId is required and must not be 'undefined' or 'null'",
    )
  }

  validateFile(file)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('eventId', eventId)

  if (altText) {
    formData.append('altText', altText)
  }

  return apiUpload<ArtworkImageUploadResponse>(buildUploadPath('/event-cover-image'), formData, {
    ...options,
  })
}

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
  const { file, userId } = request

  // Validate inputs
  if (!userId || userId === 'undefined') {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      "userId is required and must not be 'undefined'",
    )
  }

  validateFile(file)

  // Build FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  return apiUpload<AvatarUploadResponse>(buildUploadPath('/avatar'), formData, {
    ...options,
  })
}

// ============================================================================
// Exports
// ============================================================================

const artworkUploadApi = {
  uploadArtworkImage,
  uploadArtworkImages,
  uploadEventCoverImage,
  uploadAvatar,
}

export default artworkUploadApi
