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

export const PROFILE_MOMENT_ACCEPT = [
  ...PROFILE_IMAGE_MIME_TYPES,
  ...PROFILE_VIDEO_MIME_TYPES,
].join(',')

const EMPTY_UPLOAD_STATE: ProfileMomentUploadState = {
  status: 'empty',
  file: null,
  previewUrl: null,
  uploadedMedia: null,
  progress: 0,
  errorMessage: null,
}

const isProfileImageFile = (file: File) => PROFILE_IMAGE_MIME_TYPES.includes(file.type)
const isProfileVideoFile = (file: File) => PROFILE_VIDEO_MIME_TYPES.includes(file.type)

export const formatProfileMediaSize = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`

export const readVideoDuration = (file: File): Promise<number | undefined> => {
  if (typeof document === 'undefined') {
    return Promise.resolve(undefined)
  }

  return new Promise((resolve) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      URL.revokeObjectURL(objectUrl)
    }

    const settle = (durationSeconds?: number) => {
      cleanup()
      resolve(durationSeconds)
    }

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : undefined
      settle(duration)
    }

    const handleError = () => {
      settle(undefined)
    }

    video.preload = 'metadata'
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    video.src = objectUrl
  })
}

const getUploadErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'We could not upload this file. Try again or choose a different file.'
}

const validateProfileMomentFile = (file: File, durationSeconds?: number) => {
  if (isProfileImageFile(file)) {
    if (file.size > PROFILE_MAX_IMAGE_SIZE_BYTES) {
      return `Image files must be ${formatProfileMediaSize(PROFILE_MAX_IMAGE_SIZE_BYTES)} or smaller.`
    }

    return null
  }

  if (isProfileVideoFile(file)) {
    if (file.size > PROFILE_MAX_VIDEO_SIZE_BYTES) {
      return `Video files must be ${formatProfileMediaSize(PROFILE_MAX_VIDEO_SIZE_BYTES)} or smaller.`
    }

    if (
      typeof durationSeconds === 'number' &&
      durationSeconds > PROFILE_MAX_VIDEO_DURATION_SECONDS
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
  const previewUrlRef = useRef<string | null>(null)
  const uploadRunRef = useRef(0)

  const setUploadState = useCallback((nextState: ProfileMomentUploadState) => {
    stateRef.current = nextState
    previewUrlRef.current = nextState.previewUrl
    setState(nextState)
  }, [])

  const abortActiveUpload = useCallback(() => {
    abortControllerRef.current?.abort()
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
    async (file: File) => {
      const runId = uploadRunRef.current + 1
      uploadRunRef.current = runId
      const isReplacing = stateRef.current.status === 'uploaded'

      abortActiveUpload()
      revokeActivePreview()

      const previewUrl = URL.createObjectURL(file)
      const baseState: ProfileMomentUploadState = {
        status: 'validating',
        file,
        previewUrl,
        uploadedMedia: null,
        progress: 0,
        errorMessage: null,
      }

      setUploadState(baseState)

      const durationSeconds = isProfileVideoFile(file) ? await readVideoDuration(file) : undefined

      if (uploadRunRef.current !== runId) {
        return
      }

      const validationError = validateProfileMomentFile(file, durationSeconds)

      if (validationError) {
        setUploadState({
          ...baseState,
          status: 'validation-error',
          errorMessage: validationError,
          durationSeconds,
        })
        return
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setUploadState({
        ...baseState,
        status: isReplacing ? 'replacing' : 'uploading',
        durationSeconds,
      })

      try {
        const uploadedMedia = await uploadProfileMomentMedia(
          { file, durationSeconds },
          {
            signal: abortController.signal,
            onProgress: ({ percentage }) => {
              if (uploadRunRef.current !== runId || abortController.signal.aborted) {
                return
              }

              setUploadState({
                ...stateRef.current,
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
          progress: 100,
          errorMessage: null,
          durationSeconds: uploadedMedia.durationSeconds ?? durationSeconds,
        })
      } catch (error) {
        if (uploadRunRef.current !== runId || abortController.signal.aborted) {
          return
        }

        abortControllerRef.current = null
        setUploadState({
          ...stateRef.current,
          status: 'upload-failed',
          uploadedMedia: null,
          progress: 0,
          errorMessage: getUploadErrorMessage(error),
          durationSeconds,
        })
      }
    },
    [abortActiveUpload, revokeActivePreview, setUploadState],
  )

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
  const canPublish = state.status === 'uploaded' && Boolean(mediaId) && !isUploading

  return {
    state,
    mediaId,
    isUploading,
    canPublish,
    selectFile,
    retryUpload,
    resetUpload,
    cancelUpload,
  }
}
