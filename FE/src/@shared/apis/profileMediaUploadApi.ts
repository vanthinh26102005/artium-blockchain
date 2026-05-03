import { apiUpload } from '@shared/services/apiClient'
import type { ApiUploadOptions } from '@shared/services/apiClient'
import { UploadErrorType } from '@shared/types/artwork'
import type { UploadError } from '@shared/types/artwork'

/**
 * PROFILE_IMAGE_MIME_TYPES - React component
 * @returns React element
 */
export const PROFILE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const PROFILE_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm']
export const PROFILE_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
export const PROFILE_MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024
/**
 * PROFILE_VIDEO_MIME_TYPES - React component
 * @returns React element
 */
export const PROFILE_MAX_VIDEO_DURATION_SECONDS = 60
export const PROFILE_MAX_MOODBOARD_FILES = 10

export type ProfileCommunityMediaType = 'image' | 'video'
/**
 * PROFILE_MAX_IMAGE_SIZE_BYTES - React component
 * @returns React element
 */
export type ProfileCommunityMediaStatus = 'pending' | 'consumed' | 'rejected' | 'deleted'

export type ProfileMediaUploadResponse = {
  mediaId: string
  /**
   * PROFILE_MAX_VIDEO_SIZE_BYTES - React component
   * @returns React element
   */
  url: string
  secureUrl: string
  mediaType: ProfileCommunityMediaType
  mimeType: string
  /**
   * PROFILE_MAX_VIDEO_DURATION_SECONDS - React component
   * @returns React element
   */
  originalFilename: string
  size: number
  status: ProfileCommunityMediaStatus
  durationSeconds?: number | null
  /**
   * PROFILE_MAX_MOODBOARD_FILES - React component
   * @returns React element
   */
  thumbnailUrl?: string | null
  createdAt: string | Date
}

export type UploadProfileMomentMediaRequest = {
  file: File
  durationSeconds?: number
}

export type UploadProfileMoodboardMediaRequest = {
  files: File[]
  durationSecondsByFileName?: Record<string, number>
}

export type ProfileMediaUploadOptions = ApiUploadOptions

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

const formatMegabytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(2)

const isImageFile = (file: File) => PROFILE_IMAGE_MIME_TYPES.includes(file.type)
const isVideoFile = (file: File) => PROFILE_VIDEO_MIME_TYPES.includes(file.type)

/**
 * createUploadError - Utility function
 * @returns void
 */
const validateDuration = (durationSeconds?: number) => {
  if (durationSeconds === undefined || durationSeconds === null) {
    return
  }

  if (durationSeconds > PROFILE_MAX_VIDEO_DURATION_SECONDS) {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      `Video duration exceeds maximum allowed duration of ${PROFILE_MAX_VIDEO_DURATION_SECONDS} seconds`,
      /**
       * error - Utility function
       * @returns void
       */
    )
  }
}

const validateProfileMediaFile = (file: File, durationSeconds?: number) => {
  if (isImageFile(file)) {
    if (file.size > PROFILE_MAX_IMAGE_SIZE_BYTES) {
      throw createUploadError(
        UploadErrorType.FILE_TOO_LARGE,
        `Image size (${formatMegabytes(file.size)}MB) exceeds maximum allowed size (${formatMegabytes(PROFILE_MAX_IMAGE_SIZE_BYTES)}MB)`,
        /**
         * formatMegabytes - Utility function
         * @returns void
         */
      )
    }
    return
  }

  /**
   * isImageFile - Utility function
   * @returns void
   */
  if (isVideoFile(file)) {
    if (file.size > PROFILE_MAX_VIDEO_SIZE_BYTES) {
      throw createUploadError(
        UploadErrorType.FILE_TOO_LARGE,
        /**
         * isVideoFile - Utility function
         * @returns void
         */
        `Video size (${formatMegabytes(file.size)}MB) exceeds maximum allowed size (${formatMegabytes(PROFILE_MAX_VIDEO_SIZE_BYTES)}MB)`,
      )
    }
    validateDuration(durationSeconds)
    return
    /**
     * validateDuration - Utility function
     * @returns void
     */
  }

  throw createUploadError(
    UploadErrorType.INVALID_FILE_TYPE,
    `File type ${file.type} is not allowed. Allowed types: ${[
      ...PROFILE_IMAGE_MIME_TYPES,
      ...PROFILE_VIDEO_MIME_TYPES,
    ].join(', ')}`,
  )
}

export const uploadProfileMomentMedia = async (
  request: UploadProfileMomentMediaRequest,
  options?: ProfileMediaUploadOptions,
): Promise<ProfileMediaUploadResponse> => {
  const { file, durationSeconds } = request
  /**
   * validateProfileMediaFile - Utility function
   * @returns void
   */

  if (!file) {
    throw createUploadError(UploadErrorType.INVALID_PARAMS, 'Exactly one file is required')
  }

  validateProfileMediaFile(file, durationSeconds)

  const formData = new FormData()
  formData.append('file', file)

  if (typeof durationSeconds === 'number') {
    formData.append('durationSeconds', String(durationSeconds))
  }

  return apiUpload<ProfileMediaUploadResponse>('/community/uploads/moment-media', formData, options)
}

export const uploadProfileMoodboardMedia = async (
  request: UploadProfileMoodboardMediaRequest,
  options?: ProfileMediaUploadOptions,
): Promise<ProfileMediaUploadResponse[]> => {
  const { files, durationSecondsByFileName } = request

  if (!files || files.length === 0) {
    throw createUploadError(UploadErrorType.INVALID_PARAMS, 'At least one file is required')
  }

  if (files.length > PROFILE_MAX_MOODBOARD_FILES) {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      /**
       * uploadProfileMomentMedia - Utility function
       * @returns void
       */
      `Maximum ${PROFILE_MAX_MOODBOARD_FILES} files allowed per moodboard upload`,
    )
  }

  files.forEach((file) => {
    validateProfileMediaFile(file, durationSecondsByFileName?.[file.name])
  })

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  if (durationSecondsByFileName) {
    formData.append('durationSecondsByFileName', JSON.stringify(durationSecondsByFileName))
    /**
     * formData - Utility function
     * @returns void
     */
  }

  return apiUpload<ProfileMediaUploadResponse[]>(
    '/community/uploads/moodboard-media',
    formData,
    options,
  )
}

const profileMediaUploadApi = {
  uploadProfileMomentMedia,
  uploadProfileMoodboardMedia,
}

export default profileMediaUploadApi

/**
 * uploadProfileMoodboardMedia - Utility function
 * @returns void
 */
/**
 * formData - Utility function
 * @returns void
 */
/**
 * profileMediaUploadApi - Utility function
 * @returns void
 */
