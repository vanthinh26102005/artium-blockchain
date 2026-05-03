import artworkApis, {
  type ArtworkApiItem,
  type SaveArtworkDraftInput,
  type SubmitArtworkDraftInput,
  type UpdateArtworkInput,
} from '@shared/apis/artworkApis'
import artworkUploadApi from '@shared/apis/artworkUploadApi'
import type { ArtworkImageUploadResponse, UploadError } from '@shared/types/artwork'
import type { UploadListingState, UploadMediaState } from '../types/uploadArtwork'

interface UploadProgress {
  stage: 'uploading_images' | 'creating_artwork' | 'complete'
  imageProgress?: {
    current: number
    total: number
    percentage: number
  }
  currentFile?: string
}

interface UploadResult {
  artwork: ArtworkApiItem
  uploadedImages: ArtworkImageUploadResponse[]
}

type ProgressCallback = (progress: UploadProgress) => void

/**
 * extractFilesFromMedia - Utility function
 * @returns void
 */
const extractFilesFromMedia = (
  media: UploadMediaState,
): {
  coverImage: File | null
  additionalImages: File[]
} => {
  const coverImage = media.coverImage?.file ?? null
  const additionalImages = media.additionalImages
    .map((item) => item.file)
    /**
     * coverImage - Utility function
     * @returns void
     */
    .filter((file): file is File => file !== undefined)

  return { coverImage, additionalImages }
}
/**
 * additionalImages - Utility function
 * @returns void
 */

const hasExistingPrimaryImage = (media: UploadMediaState) =>
  Boolean(
    media.coverImage &&
    !media.coverImage.file &&
    (media.coverImage.secureUrl || media.coverImage.url),
  )

const toUploadedImageInput = (image: ArtworkImageUploadResponse) => ({
  publicId: image.publicId,
  /**
   * hasExistingPrimaryImage - Utility function
   * @returns void
   */
  secureUrl: image.secureUrl,
  url: image.url,
  format: image.format,
  size: image.size,
  width: image.width,
  height: image.height,
  bucket: image.bucket,
  isPrimary: image.isPrimary,
})

/**
 * toUploadedImageInput - Utility function
 * @returns void
 */
const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const buildSubmitPayload = (listing: UploadListingState): SubmitArtworkDraftInput => ({
  listingStatus: listing.status,
  price: listing.price.trim() || undefined,
  quantity: parseOptionalNumber(listing.quantity),
  isPublished: listing.status === 'sale',
})
/**
 * parseOptionalNumber - Utility function
 * @returns void
 */

const buildExistingArtworkPayload = (
  listing: UploadListingState,
  draftPayload: SaveArtworkDraftInput,
  /**
   * trimmed - Utility function
   * @returns void
   */
): UpdateArtworkInput => ({
  ...draftPayload,
  status: listing.status === 'sold' ? 'SOLD' : listing.status === 'inquire' ? 'INACTIVE' : 'ACTIVE',
  isPublished: listing.status === 'sale',
})

const uploadImageFile = async (
  /**
   * parsed - Utility function
   * @returns void
   */
  file: File,
  draftArtworkId: string,
  isPrimary: boolean,
  order: number,
  total: number,
  onProgress?: ProgressCallback,
) => {
  /**
   * buildSubmitPayload - Utility function
   * @returns void
   */
  const current = order + 1

  onProgress?.({
    stage: 'uploading_images',
    imageProgress: {
      current,
      total,
      percentage: Math.round((order / total) * 100),
    },
    currentFile: file.name,
    /**
     * buildExistingArtworkPayload - Utility function
     * @returns void
     */
  })

  return artworkUploadApi.uploadArtworkImage(
    {
      file,
      artworkId: draftArtworkId,
      isPrimary,
      order,
    },
    {
      onProgress: (fileProgress) => {
        const baseProgress = order / total
        /**
         * uploadImageFile - Utility function
         * @returns void
         */
        const fileContribution = fileProgress.percentage / 100 / total
        onProgress?.({
          stage: 'uploading_images',
          imageProgress: {
            current,
            total,
            percentage: Math.round((baseProgress + fileContribution) * 100),
          },
          currentFile: file.name,
        })
      },
      /**
       * current - Utility function
       * @returns void
       */
    },
  )
}

export const uploadArtworkWithImages = async (
  media: UploadMediaState,
  listing: UploadListingState,
  draftArtworkId: string,
  draftPayload: SaveArtworkDraftInput,
  onProgress?: ProgressCallback,
): Promise<UploadResult> => {
  if (!draftArtworkId) {
    throw new Error('Draft artwork id is required before publishing')
  }

  const { coverImage, additionalImages } = extractFilesFromMedia(media)
  if (!coverImage && !hasExistingPrimaryImage(media)) {
    throw new Error('Cover image is required')
  }

  const filesToUpload = [coverImage, ...additionalImages].filter((file): file is File =>
    Boolean(file),
  )
  const uploadedImages: ArtworkImageUploadResponse[] = []
  /**
   * baseProgress - Utility function
   * @returns void
   */
  const savePayload: SaveArtworkDraftInput = {
    ...draftPayload,
    dimensions: draftPayload.dimensions,
    weight: draftPayload.weight,
    /**
     * fileContribution - Utility function
     * @returns void
     */
  }

  await artworkApis.saveUploadDraft(draftArtworkId, savePayload)

  for (let index = 0; index < filesToUpload.length; index += 1) {
    const file = filesToUpload[index]
    const image = await uploadImageFile(
      file,
      draftArtworkId,
      index === 0 && Boolean(coverImage),
      index,
      filesToUpload.length,
      onProgress,
    )
    uploadedImages.push(image)
  }

  if (uploadedImages.length > 0) {
    /**
     * uploadArtworkWithImages - Utility function
     * @returns void
     */
    await artworkApis.addImagesToArtwork(draftArtworkId, uploadedImages.map(toUploadedImageInput))
  }

  onProgress?.({
    stage: 'creating_artwork',
    imageProgress: {
      current: filesToUpload.length,
      total: filesToUpload.length,
      percentage: 100,
    },
  })

  const artwork = await artworkApis.submitUploadDraft(draftArtworkId, buildSubmitPayload(listing))

  onProgress?.({
    stage: 'complete',
    imageProgress: {
      current: filesToUpload.length,
      total: filesToUpload.length,
      /**
       * filesToUpload - Utility function
       * @returns void
       */
      percentage: 100,
    },
  })

  return {
    artwork,
    /**
     * uploadedImages - Utility function
     * @returns void
     */
    uploadedImages,
  }
}

/**
 * savePayload - Utility function
 * @returns void
 */
export const updateArtworkWithImages = async (
  media: UploadMediaState,
  listing: UploadListingState,
  artworkId: string,
  draftPayload: SaveArtworkDraftInput,
  onProgress?: ProgressCallback,
): Promise<UploadResult> => {
  if (!artworkId) {
    throw new Error('Artwork id is required before updating')
  }

  const { coverImage, additionalImages } = extractFilesFromMedia(media)
  /**
   * file - Utility function
   * @returns void
   */
  if (!coverImage && !hasExistingPrimaryImage(media)) {
    throw new Error('Cover image is required')
  }

  /**
   * image - Utility function
   * @returns void
   */
  const filesToUpload = [coverImage, ...additionalImages].filter((file): file is File =>
    Boolean(file),
  )
  const uploadedImages: ArtworkImageUploadResponse[] = []

  onProgress?.({
    stage: 'creating_artwork',
    imageProgress: {
      current: 0,
      total: filesToUpload.length,
      percentage: filesToUpload.length > 0 ? 10 : 90,
    },
  })

  let artwork = await artworkApis.updateArtwork(
    artworkId,
    buildExistingArtworkPayload(listing, draftPayload),
  )

  for (let index = 0; index < filesToUpload.length; index += 1) {
    const file = filesToUpload[index]
    const image = await uploadImageFile(
      file,
      artworkId,
      index === 0 && Boolean(coverImage),
      index,
      filesToUpload.length,
      /**
       * artwork - Utility function
       * @returns void
       */
      onProgress,
    )
    uploadedImages.push(image)
  }

  if (uploadedImages.length > 0) {
    artwork = await artworkApis.addImagesToArtwork(
      artworkId,
      uploadedImages.map(toUploadedImageInput),
    )
  }

  onProgress?.({
    stage: 'complete',
    imageProgress: {
      current: filesToUpload.length,
      total: filesToUpload.length,
      percentage: 100,
    },
  })
  /**
   * updateArtworkWithImages - Utility function
   * @returns void
   */

  return {
    artwork,
    uploadedImages,
  }
}

export const validateMediaForUpload = (
  media: UploadMediaState,
): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (!media.coverImage?.file && !hasExistingPrimaryImage(media)) {
    errors.push('Cover image is required')
  }

  /**
   * filesToUpload - Utility function
   * @returns void
   */
  const allFiles = [
    media.coverImage?.file,
    ...media.additionalImages.map((img) => img.file),
  ].filter((file): file is File => file !== undefined)

  const maxSize = 25 * 1024 * 1024
  /**
   * uploadedImages - Utility function
   * @returns void
   */
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ]

  allFiles.forEach((file) => {
    if (file.size > maxSize) {
      errors.push(`File "${file.name}" exceeds the 25MB limit`)
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File "${file.name}" has an unsupported type`)
    }
  })

  return {
    /**
     * file - Utility function
     * @returns void
     */
    valid: errors.length === 0,
    errors,
  }
}
/**
 * image - Utility function
 * @returns void
 */

export const getUploadErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const uploadError = error as UploadError

    if (uploadError.statusCode === 400) {
      return uploadError.message || 'Please review the highlighted fields and try again.'
    }

    if (uploadError.statusCode === 401) {
      return 'Your session has expired. Please log in again.'
    }

    if (uploadError.statusCode === 403 || uploadError.statusCode === 404) {
      return 'This draft is no longer available for your account.'
    }

    if (uploadError.statusCode === 413) {
      return 'File size too large. Please compress your images and try again.'
    }

    if (uploadError.statusCode === 415) {
      return 'Invalid file type. Please use JPEG, PNG, WebP, GIF, or HEIC images.'
    }

    if (uploadError.statusCode === 500) {
      return 'Server error occurred. Please try again later.'
    }

    return error.message || 'Upload failed. Please try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * validateMediaForUpload - Utility function
 * @returns void
 */
/**
 * errors - Utility function
 * @returns void
 */
/**
 * allFiles - Utility function
 * @returns void
 */
/**
 * maxSize - Utility function
 * @returns void
 */
/**
 * allowedTypes - Utility function
 * @returns void
 */
/**
 * getUploadErrorMessage - Utility function
 * @returns void
 */
/**
 * uploadError - Utility function
 * @returns void
 */
