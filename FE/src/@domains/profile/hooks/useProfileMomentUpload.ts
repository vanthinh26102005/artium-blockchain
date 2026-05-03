import { useCallback, useEffect, useRef, useState } from 'react'

import {
  PROFILE_IMAGE_MIME_TYPES,
  PROFILE_MAX_IMAGE_SIZE_BYTES,
  PROFILE_MAX_VIDEO_DURATION_SECONDS,
  PROFILE_MAX_VIDEO_SIZE_BYTES,
  PROFILE_VIDEO_MIME_TYPES,
  uploadProfileMomentMedia,
} from '@shared/apis/profileMediaUploadApi'
import type { ProfileMediaUploadResponse } from '@shared/apis/profileMediaUploadApi'

export type ProfileMomentUploadStatus =
  | 'empty'
  | 'validating'
  | 'uploading'
  | 'uploaded'
  | 'validation-error'
  | 'upload-failed'
  | 'replacing'

export type ProfileMomentUploadState = {
  status: ProfileMomentUploadStatus
  file: File | null
  previewUrl: string | null
  uploadedMedia: ProfileMediaUploadResponse | null
  progress: number
  errorMessage: string | null
  durationSeconds?: number
}

/**
 * PROFILE_MOMENT_ACCEPT - React component
 * @returns React element
 */
export const PROFILE_MOMENT_ACCEPT = [
  ...PROFILE_IMAGE_MIME_TYPES,
  ...PROFILE_VIDEO_MIME_TYPES,
].join(',')

const EMPTY_UPLOAD_STATE: ProfileMomentUploadState = {
  status: 'empty',
  file: null,
/**
 * EMPTY_UPLOAD_STATE - React component
 * @returns React element
 */
  previewUrl: null,
  uploadedMedia: null,
  progress: 0,
  errorMessage: null,
}

const isProfileImageFile = (file: File) => PROFILE_IMAGE_MIME_TYPES.includes(file.type)
const isProfileVideoFile = (file: File) => PROFILE_VIDEO_MIME_TYPES.includes(file.type)

export const formatProfileMediaSize = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`

/**
 * isProfileImageFile - Utility function
 * @returns void
 */
export const readVideoDuration = (file: File): Promise<number | undefined> => {
  if (typeof document === 'undefined') {
    return Promise.resolve(undefined)
  }
/**
 * isProfileVideoFile - Utility function
 * @returns void
 */

  return new Promise((resolve) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

/**
 * formatProfileMediaSize - Utility function
 * @returns void
 */
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      URL.revokeObjectURL(objectUrl)
    }

/**
 * readVideoDuration - Utility function
 * @returns void
 */
    const settle = (durationSeconds?: number) => {
      cleanup()
      resolve(durationSeconds)
    }

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : undefined
      settle(duration)
    }
/**
 * video - Utility function
 * @returns void
 */

    const handleError = () => {
      settle(undefined)
    }
/**
 * objectUrl - Utility function
 * @returns void
 */

    video.preload = 'metadata'
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    video.src = objectUrl
/**
 * cleanup - Utility function
 * @returns void
 */
  })
}

const getUploadErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'We could not upload this file. Try again or choose a different file.'
/**
 * settle - Utility function
 * @returns void
 */
}

const validateProfileMomentFile = (file: File, durationSeconds?: number) => {
  if (isProfileImageFile(file)) {
    if (file.size > PROFILE_MAX_IMAGE_SIZE_BYTES) {
      return `Image files must be ${formatProfileMediaSize(PROFILE_MAX_IMAGE_SIZE_BYTES)} or smaller.`
    }

/**
 * handleLoadedMetadata - Utility function
 * @returns void
 */
    return null
  }

  if (isProfileVideoFile(file)) {
/**
 * duration - Utility function
 * @returns void
 */
    if (file.size > PROFILE_MAX_VIDEO_SIZE_BYTES) {
      return `Video files must be ${formatProfileMediaSize(PROFILE_MAX_VIDEO_SIZE_BYTES)} or smaller.`
    }

    if (
      typeof durationSeconds === 'number' &&
      durationSeconds > PROFILE_MAX_VIDEO_DURATION_SECONDS
/**
 * handleError - Utility function
 * @returns void
 */
    ) {
      return `Videos must be ${PROFILE_MAX_VIDEO_DURATION_SECONDS} seconds or shorter.`
    }

    return null
  }

  return 'Choose a JPG, PNG, WEBP, GIF, MP4, or WEBM file.'
}

export const useProfileMomentUpload = () => {
  const [state, setState] = useState<ProfileMomentUploadState>(EMPTY_UPLOAD_STATE)
  const stateRef = useRef<ProfileMomentUploadState>(EMPTY_UPLOAD_STATE)
  const abortControllerRef = useRef<AbortController | null>(null)
/**
 * getUploadErrorMessage - Utility function
 * @returns void
 */
  const previewUrlRef = useRef<string | null>(null)
  const uploadRunRef = useRef(0)

  const setUploadState = useCallback((nextState: ProfileMomentUploadState) => {
    stateRef.current = nextState
    previewUrlRef.current = nextState.previewUrl
    setState(nextState)
  }, [])

  const abortActiveUpload = useCallback(() => {
    abortControllerRef.current?.abort()
/**
 * validateProfileMomentFile - Utility function
 * @returns void
 */
    abortControllerRef.current = null
  }, [])

  const revokeActivePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const resetUpload = useCallback(() => {
    uploadRunRef.current += 1
    abortActiveUpload()
    revokeActivePreview()
    setUploadState(EMPTY_UPLOAD_STATE)
  }, [abortActiveUpload, revokeActivePreview, setUploadState])

  const cancelUpload = useCallback(() => {
    uploadRunRef.current += 1
    abortActiveUpload()
    setUploadState({
      ...stateRef.current,
      status: stateRef.current.file ? 'upload-failed' : 'empty',
      uploadedMedia: null,
      progress: 0,
      errorMessage: stateRef.current.file ? 'Upload was cancelled.' : null,
    })
  }, [abortActiveUpload, setUploadState])

  const selectFile = useCallback(
/**
 * useProfileMomentUpload - Custom React hook
 * @returns void
 */
    async (file: File) => {
      const runId = uploadRunRef.current + 1
      uploadRunRef.current = runId
      const isReplacing = stateRef.current.status === 'uploaded'

/**
 * stateRef - Utility function
 * @returns void
 */
      abortActiveUpload()
      revokeActivePreview()

      const previewUrl = URL.createObjectURL(file)
/**
 * abortControllerRef - Utility function
 * @returns void
 */
      const baseState: ProfileMomentUploadState = {
        status: 'validating',
        file,
        previewUrl,
/**
 * previewUrlRef - Utility function
 * @returns void
 */
        uploadedMedia: null,
        progress: 0,
        errorMessage: null,
      }
/**
 * uploadRunRef - Utility function
 * @returns void
 */

      setUploadState(baseState)

      const durationSeconds = isProfileVideoFile(file) ? await readVideoDuration(file) : undefined

/**
 * setUploadState - Utility function
 * @returns void
 */
      if (uploadRunRef.current !== runId) {
        return
      }

      const validationError = validateProfileMomentFile(file, durationSeconds)

      if (validationError) {
        setUploadState({
          ...baseState,
/**
 * abortActiveUpload - Utility function
 * @returns void
 */
          status: 'validation-error',
          errorMessage: validationError,
          durationSeconds,
        })
        return
      }

      const abortController = new AbortController()
/**
 * revokeActivePreview - Utility function
 * @returns void
 */
      abortControllerRef.current = abortController

      setUploadState({
        ...baseState,
        status: isReplacing ? 'replacing' : 'uploading',
        durationSeconds,
      })

      try {
        const uploadedMedia = await uploadProfileMomentMedia(
/**
 * resetUpload - Utility function
 * @returns void
 */
          { file, durationSeconds },
          {
            signal: abortController.signal,
            onProgress: ({ percentage }) => {
              if (uploadRunRef.current !== runId || abortController.signal.aborted) {
                return
              }

              setUploadState({
                ...stateRef.current,
/**
 * cancelUpload - Utility function
 * @returns void
 */
                progress: percentage,
              })
            },
          },
        )

        if (uploadRunRef.current !== runId || abortController.signal.aborted) {
          return
        }

        abortControllerRef.current = null
        setUploadState({
          ...stateRef.current,
          status: 'uploaded',
          uploadedMedia,
/**
 * selectFile - Utility function
 * @returns void
 */
          progress: 100,
          errorMessage: null,
          durationSeconds: uploadedMedia.durationSeconds ?? durationSeconds,
        })
      } catch (error) {
/**
 * runId - Utility function
 * @returns void
 */
        if (uploadRunRef.current !== runId || abortController.signal.aborted) {
          return
        }

        abortControllerRef.current = null
/**
 * isReplacing - Utility function
 * @returns void
 */
        setUploadState({
          ...stateRef.current,
          status: 'upload-failed',
          uploadedMedia: null,
          progress: 0,
          errorMessage: getUploadErrorMessage(error),
          durationSeconds,
        })
/**
 * previewUrl - Utility function
 * @returns void
 */
      }
    },
    [abortActiveUpload, revokeActivePreview, setUploadState],
  )
/**
 * baseState - Utility function
 * @returns void
 */

  const retryUpload = useCallback(async () => {
    const currentFile = stateRef.current.file
    if (!currentFile) {
      return
    }

    await selectFile(currentFile)
  }, [selectFile])

  useEffect(() => resetUpload, [resetUpload])

  const mediaId = state.uploadedMedia?.mediaId ?? null
  const isUploading = state.status === 'uploading' || state.status === 'replacing'
/**
 * durationSeconds - Utility function
 * @returns void
 */
  const canPublish = state.status === 'uploaded' && Boolean(mediaId) && !isUploading

  return {
    state,
    mediaId,
    isUploading,
    canPublish,
    selectFile,
    retryUpload,
/**
 * validationError - Utility function
 * @returns void
 */
    resetUpload,
    cancelUpload,
  }
}

/**
 * abortController - Utility function
 * @returns void
 */
/**
 * uploadedMedia - Utility function
 * @returns void
 */
/**
 * retryUpload - Utility function
 * @returns void
 */
/**
 * currentFile - Utility function
 * @returns void
 */
/**
 * mediaId - Utility function
 * @returns void
 */
/**
 * isUploading - Utility function
 * @returns void
 */
/**
 * canPublish - Utility function
 * @returns void
 */