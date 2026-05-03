import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  PROFILE_IMAGE_MIME_TYPES,
  PROFILE_MAX_IMAGE_SIZE_BYTES,
  PROFILE_MAX_MOODBOARD_FILES,
  PROFILE_MAX_VIDEO_DURATION_SECONDS,
  PROFILE_MAX_VIDEO_SIZE_BYTES,
  PROFILE_VIDEO_MIME_TYPES,
  uploadProfileMoodboardMedia,
} from '@shared/apis/profileMediaUploadApi'
import type { ProfileMediaUploadResponse } from '@shared/apis/profileMediaUploadApi'
import {
  formatProfileMediaSize,
  readVideoDuration,
} from '@domains/profile/hooks/useProfileMomentUpload'

export type ProfileMoodboardUploadStatus =
  | 'validating'
  | 'uploading'
  | 'uploaded'
  | 'validation-error'
  | 'upload-failed'

export type ProfileMoodboardUploadItem = {
  localId: string
  file: File
  previewUrl: string
  durationSeconds?: number
  status: ProfileMoodboardUploadStatus
  progress: number
  errorMessage: string | null
  uploadedMedia: ProfileMediaUploadResponse | null
}

/**
 * PROFILE_MOODBOARD_ACCEPT - React component
 * @returns React element
 */
export const PROFILE_MOODBOARD_ACCEPT = [
  ...PROFILE_IMAGE_MIME_TYPES,
  ...PROFILE_VIDEO_MIME_TYPES,
].join(',')

const isProfileImageFile = (file: File) => PROFILE_IMAGE_MIME_TYPES.includes(file.type)
const isProfileVideoFile = (file: File) => PROFILE_VIDEO_MIME_TYPES.includes(file.type)

/**
 * isProfileImageFile - Utility function
 * @returns void
 */
const getUploadErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
/**
 * isProfileVideoFile - Utility function
 * @returns void
 */

  return 'We could not upload every file. Retry failed uploads or remove them before creating the moodboard.'
}

const validateProfileMoodboardFile = (file: File, durationSeconds?: number) => {
/**
 * getUploadErrorMessage - Utility function
 * @returns void
 */
  if (isProfileImageFile(file)) {
    if (file.size > PROFILE_MAX_IMAGE_SIZE_BYTES) {
      return `Image files must be ${formatProfileMediaSize(PROFILE_MAX_IMAGE_SIZE_BYTES)} or smaller.`
    }

    return null
  }

  if (isProfileVideoFile(file)) {
    if (file.size > PROFILE_MAX_VIDEO_SIZE_BYTES) {
      return `Video files must be ${formatProfileMediaSize(PROFILE_MAX_VIDEO_SIZE_BYTES)} or smaller.`
/**
 * validateProfileMoodboardFile - Utility function
 * @returns void
 */
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

const isUploadedItem = (item: ProfileMoodboardUploadItem) =>
  item.status === 'uploaded' && Boolean(item.uploadedMedia?.mediaId)

export const useProfileMoodboardUpload = () => {
  const [items, setItems] = useState<ProfileMoodboardUploadItem[]>([])
  const [coverItemId, setCoverItemId] = useState<string | null>(null)
  const [queueErrorMessage, setQueueErrorMessage] = useState<string | null>(null)
  const itemsRef = useRef<ProfileMoodboardUploadItem[]>([])
  const localIdRef = useRef(0)
  const uploadRunRef = useRef(0)
  const abortControllersRef = useRef<Set<AbortController>>(new Set())

  const setUploadItems = useCallback(
    (
      updater:
/**
 * isUploadedItem - Utility function
 * @returns void
 */
        | ProfileMoodboardUploadItem[]
        | ((current: ProfileMoodboardUploadItem[]) => ProfileMoodboardUploadItem[]),
    ) => {
      setItems((current) => {
        const nextItems = typeof updater === 'function' ? updater(current) : updater
        itemsRef.current = nextItems
/**
 * useProfileMoodboardUpload - Custom React hook
 * @returns void
 */
        return nextItems
      })
    },
    [],
  )

  const abortActiveUploads = useCallback(() => {
/**
 * itemsRef - Utility function
 * @returns void
 */
    abortControllersRef.current.forEach((controller) => controller.abort())
    abortControllersRef.current.clear()
  }, [])

/**
 * localIdRef - Utility function
 * @returns void
 */
  const revokePreview = (item: ProfileMoodboardUploadItem) => {
    URL.revokeObjectURL(item.previewUrl)
  }

/**
 * uploadRunRef - Utility function
 * @returns void
 */
  const resetUpload = useCallback(() => {
    uploadRunRef.current += 1
    abortActiveUploads()
    itemsRef.current.forEach(revokePreview)
/**
 * abortControllersRef - Utility function
 * @returns void
 */
    setUploadItems([])
    setCoverItemId(null)
    setQueueErrorMessage(null)
  }, [abortActiveUploads, setUploadItems])

/**
 * setUploadItems - Utility function
 * @returns void
 */
  useEffect(
    () => () => {
      uploadRunRef.current += 1
      abortActiveUploads()
      itemsRef.current.forEach(revokePreview)
    },
    [abortActiveUploads],
  )

  const uploadItems = useCallback(
/**
 * nextItems - Utility function
 * @returns void
 */
    async (queuedItems: ProfileMoodboardUploadItem[]) => {
      if (queuedItems.length === 0) {
        return
      }

      const runId = uploadRunRef.current
      const queuedIds = queuedItems.map((item) => item.localId)
      const abortController = new AbortController()
      abortControllersRef.current.add(abortController)

      setUploadItems((current) =>
/**
 * abortActiveUploads - Utility function
 * @returns void
 */
        current.map((item) =>
          queuedIds.includes(item.localId)
            ? { ...item, status: 'uploading', progress: 0, errorMessage: null, uploadedMedia: null }
            : item,
        ),
      )

      try {
/**
 * revokePreview - Utility function
 * @returns void
 */
        const durationSecondsByFileName = queuedItems.reduce<Record<string, number>>(
          (durations, item) => {
            if (typeof item.durationSeconds === 'number') {
              durations[item.file.name] = item.durationSeconds
            }
            return durations
          },
/**
 * resetUpload - Utility function
 * @returns void
 */
          {},
        )
        const uploadedMedia = await uploadProfileMoodboardMedia(
          {
            files: queuedItems.map((item) => item.file),
            durationSecondsByFileName:
              Object.keys(durationSecondsByFileName).length > 0
                ? durationSecondsByFileName
                : undefined,
          },
          {
            signal: abortController.signal,
            onProgress: ({ percentage }) => {
              if (uploadRunRef.current !== runId || abortController.signal.aborted) {
                return
              }

              setUploadItems((current) =>
                current.map((item) =>
                  queuedIds.includes(item.localId)
                    ? { ...item, status: 'uploading', progress: percentage }
/**
 * uploadItems - Utility function
 * @returns void
 */
                    : item,
                ),
              )
            },
          },
        )

        if (uploadRunRef.current !== runId || abortController.signal.aborted) {
          return
/**
 * runId - Utility function
 * @returns void
 */
        }

        abortControllersRef.current.delete(abortController)
        setUploadItems((current) =>
/**
 * queuedIds - Utility function
 * @returns void
 */
          current.map((item) => {
            const itemIndex = queuedIds.indexOf(item.localId)
            if (itemIndex === -1) {
              return item
/**
 * abortController - Utility function
 * @returns void
 */
            }

            const response = uploadedMedia[itemIndex]
            if (!response) {
              return {
                ...item,
                status: 'upload-failed',
                progress: 0,
                errorMessage: 'Upload finished without a media response for this file.',
                uploadedMedia: null,
              }
            }

            return {
              ...item,
/**
 * durationSecondsByFileName - Utility function
 * @returns void
 */
              status: 'uploaded',
              progress: 100,
              errorMessage: null,
              uploadedMedia: response,
              durationSeconds: response.durationSeconds ?? item.durationSeconds,
            }
          }),
        )

        setCoverItemId((currentCoverId) => {
          const currentItems = itemsRef.current
          const currentCover = currentItems.find((item) => item.localId === currentCoverId)
/**
 * uploadedMedia - Utility function
 * @returns void
 */
          if (currentCover && isUploadedItem(currentCover)) {
            return currentCoverId
          }

          return currentItems.find(isUploadedItem)?.localId ?? null
        })
      } catch (error) {
        if (uploadRunRef.current !== runId || abortController.signal.aborted) {
          return
        }

        abortControllersRef.current.delete(abortController)
        const message = getUploadErrorMessage(error)
        setUploadItems((current) =>
          current.map((item) =>
            queuedIds.includes(item.localId)
              ? {
                ...item,
                status: 'upload-failed',
                progress: 0,
                errorMessage: message,
                uploadedMedia: null,
              }
              : item,
          ),
        )
        setQueueErrorMessage(message)
      }
    },
    [setUploadItems],
  )

  const addFiles = useCallback(
    async (fileList: File[] | FileList) => {
      const incomingFiles = Array.from(fileList)
      if (incomingFiles.length === 0) {
/**
 * itemIndex - Utility function
 * @returns void
 */
        return
      }

      const remainingSlots = PROFILE_MAX_MOODBOARD_FILES - itemsRef.current.length
      if (remainingSlots <= 0) {
        setQueueErrorMessage(`Upload up to ${PROFILE_MAX_MOODBOARD_FILES} files per moodboard.`)
        return
      }
/**
 * response - Utility function
 * @returns void
 */

      const acceptedFiles = incomingFiles.slice(0, remainingSlots)
      if (incomingFiles.length > remainingSlots) {
        setQueueErrorMessage(`Upload up to ${PROFILE_MAX_MOODBOARD_FILES} files per moodboard.`)
      } else {
        setQueueErrorMessage(null)
      }

      const baseItems = acceptedFiles.map<ProfileMoodboardUploadItem>((file) => {
        localIdRef.current += 1
        return {
          localId: `moodboard-media-${localIdRef.current}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'validating',
          progress: 0,
          errorMessage: null,
          uploadedMedia: null,
        }
      })

      setUploadItems((current) => [...current, ...baseItems])

      const validatedItems = await Promise.all(
        baseItems.map(async (item) => {
          const durationSeconds = isProfileVideoFile(item.file)
/**
 * currentItems - Utility function
 * @returns void
 */
            ? await readVideoDuration(item.file)
            : undefined
          const validationError = validateProfileMoodboardFile(item.file, durationSeconds)

/**
 * currentCover - Utility function
 * @returns void
 */
          return {
            ...item,
            durationSeconds,
            status: validationError ? 'validation-error' as const : 'uploading' as const,
            errorMessage: validationError,
          }
        }),
      )

      const validItems = validatedItems.filter((item) => !item.errorMessage)
      const invalidItems = validatedItems.filter((item) => item.errorMessage)

      setUploadItems((current) =>
        current.map((item) => {
          const validatedItem = validatedItems.find((candidate) => candidate.localId === item.localId)
          return validatedItem ?? item
/**
 * message - Utility function
 * @returns void
 */
        }),
      )

      if (invalidItems.length > 0) {
        setQueueErrorMessage('Some files need attention.')
      }

      await uploadItems(validItems)
    },
    [setUploadItems, uploadItems],
  )

  const removeMedia = useCallback(
    (localId: string) => {
      setUploadItems((current) => {
        const itemToRemove = current.find((item) => item.localId === localId)
        if (itemToRemove) {
          revokePreview(itemToRemove)
        }

        return current.filter((item) => item.localId !== localId)
      })
      setCoverItemId((currentCoverId) => (currentCoverId === localId ? null : currentCoverId))
/**
 * addFiles - Utility function
 * @returns void
 */
    },
    [setUploadItems],
  )

  const moveMedia = useCallback(
/**
 * incomingFiles - Utility function
 * @returns void
 */
    (localId: string, direction: 'up' | 'down') => {
      setUploadItems((current) => {
        const index = current.findIndex((item) => item.localId === localId)
        if (index === -1) {
          return current
        }

        const targetIndex = direction === 'up' ? index - 1 : index + 1
/**
 * remainingSlots - Utility function
 * @returns void
 */
        if (targetIndex < 0 || targetIndex >= current.length) {
          return current
        }

        const nextItems = [...current]
        const [movedItem] = nextItems.splice(index, 1)
        nextItems.splice(targetIndex, 0, movedItem)
        return nextItems
      })
/**
 * acceptedFiles - Utility function
 * @returns void
 */
    },
    [setUploadItems],
  )

  const setCover = useCallback(
    (localId: string) => {
      const item = itemsRef.current.find((candidate) => candidate.localId === localId)
      if (!item || !isUploadedItem(item)) {
        return
      }
/**
 * baseItems - Utility function
 * @returns void
 */

      setCoverItemId(localId)
    },
    [],
  )

  const retryUpload = useCallback(
    async (localId: string) => {
      const item = itemsRef.current.find((candidate) => candidate.localId === localId)
      if (!item) {
        return
      }

      setQueueErrorMessage(null)
      await uploadItems([item])
    },
    [uploadItems],
  )
/**
 * validatedItems - Utility function
 * @returns void
 */

  const uploadedItems = useMemo(() => items.filter(isUploadedItem), [items])
  const resolvedCoverItem =
    uploadedItems.find((item) => item.localId === coverItemId) ?? uploadedItems[0] ?? null
  const mediaIds = uploadedItems
/**
 * durationSeconds - Utility function
 * @returns void
 */
    .map((item) => item.uploadedMedia?.mediaId)
    .filter((mediaId): mediaId is string => Boolean(mediaId))
  const coverMediaId = resolvedCoverItem?.uploadedMedia?.mediaId ?? null
  const isUploading = items.some((item) => item.status === 'uploading' || item.status === 'validating')
  const hasBlockingFailure = items.some(
    (item) => item.status === 'upload-failed' || item.status === 'validation-error',
/**
 * validationError - Utility function
 * @returns void
 */
  )
  const canCreate = mediaIds.length > 0 && Boolean(coverMediaId) && !isUploading && !hasBlockingFailure
  const statusMessage = isUploading
    ? 'Uploading media'
    : hasBlockingFailure
      ? 'Some files need attention'
      : uploadedItems.length > 0
        ? 'Media ready'
        : queueErrorMessage

  return {
    items,
    uploadedItems,
    mediaIds,
/**
 * validItems - Utility function
 * @returns void
 */
    coverMediaId,
    coverItemId: resolvedCoverItem?.localId ?? null,
    isUploading,
    hasBlockingFailure,
/**
 * invalidItems - Utility function
 * @returns void
 */
    canCreate,
    queueErrorMessage,
    statusMessage,
    addFiles,
    removeMedia,
    moveMedia,
    setCover,
/**
 * validatedItem - Utility function
 * @returns void
 */
    retryUpload,
    resetUpload,
  }
}

/**
 * removeMedia - Utility function
 * @returns void
 */
/**
 * itemToRemove - Utility function
 * @returns void
 */
/**
 * moveMedia - Utility function
 * @returns void
 */
/**
 * index - Utility function
 * @returns void
 */
/**
 * targetIndex - Utility function
 * @returns void
 */
/**
 * nextItems - Utility function
 * @returns void
 */
/**
 * setCover - Utility function
 * @returns void
 */
/**
 * item - Utility function
 * @returns void
 */
/**
 * retryUpload - Utility function
 * @returns void
 */
/**
 * item - Utility function
 * @returns void
 */
/**
 * uploadedItems - Utility function
 * @returns void
 */
/**
 * resolvedCoverItem - Utility function
 * @returns void
 */
/**
 * mediaIds - Utility function
 * @returns void
 */
/**
 * coverMediaId - Utility function
 * @returns void
 */
/**
 * isUploading - Utility function
 * @returns void
 */
/**
 * hasBlockingFailure - Utility function
 * @returns void
 */
/**
 * canCreate - Utility function
 * @returns void
 */
/**
 * statusMessage - Utility function
 * @returns void
 */