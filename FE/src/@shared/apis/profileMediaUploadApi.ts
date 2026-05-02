import { apiUpload } from '@shared/services/apiClient'
import type { ApiUploadOptions } from '@shared/services/apiClient'
import { UploadErrorType } from '@shared/types/artwork'
import type { UploadError } from '@shared/types/artwork'

export const PROFILE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const PROFILE_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm']
export const PROFILE_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
export const PROFILE_MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024
export const PROFILE_MAX_VIDEO_DURATION_SECONDS = 60
export const PROFILE_MAX_MOODBOARD_FILES = 10

export type ProfileCommunityMediaType = 'image' | 'video'
export type ProfileCommunityMediaStatus = 'pending' | 'consumed' | 'rejected' | 'deleted'

export type ProfileMediaUploadResponse = {
  mediaId: string
  url: string
  secureUrl: string
  mediaType: ProfileCommunityMediaType
  mimeType: string
  originalFilename: string
  size: number
  status: ProfileCommunityMediaStatus
  durationSeconds?: number | null
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

const validateDuration = (durationSeconds?: number) => {
  if (durationSeconds === undefined || durationSeconds === null) {
    return
  }

  if (durationSeconds > PROFILE_MAX_VIDEO_DURATION_SECONDS) {
    throw createUploadError(
      UploadErrorType.INVALID_PARAMS,
      `Video duration exceeds maximum allowed duration of ${PROFILE_MAX_VIDEO_DURATION_SECONDS} seconds`,
    )
  }
}

const validateProfileMediaFile = (file: File, durationSeconds?: number) => {
  if (isImageFile(file)) {
    if (file.size > PROFILE_MAX_IMAGE_SIZE_BYTES) {
      throw createUploadError(
        UploadErrorType.FILE_TOO_LARGE,
        `Image size (${formatMegabytes(file.size)}MB) exceeds maximum allowed size (${formatMegabytes(PROFILE_MAX_IMAGE_SIZE_BYTES)}MB)`,
      )
    }
    return
  }

  if (isVideoFile(file)) {
    if (file.size > PROFILE_MAX_VIDEO_SIZE_BYTES) {
      throw createUploadError(
        UploadErrorType.FILE_TOO_LARGE,
        `Video size (${formatMegabytes(file.size)}MB) exceeds maximum allowed size (${formatMegabytes(PROFILE_MAX_VIDEO_SIZE_BYTES)}MB)`,
      )
    }
    validateDuration(durationSeconds)
    return
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

  if (!file) {
    throw createUploadError(UploadErrorType.INVALID_PARAMS, 'Exactly one file is required')
  }

  validateProfileMediaFile(file, durationSeconds)

  const formData = new FormData()
  formData.append('file', file)

  if (typeof durationSeconds === 'number') {
    formData.append('durationSeconds', String(durationSeconds))
  }

  return apiUpload<ProfileMediaUploadResponse>(
    '/community/uploads/moment-media',
    formData,
    options,
  )
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
