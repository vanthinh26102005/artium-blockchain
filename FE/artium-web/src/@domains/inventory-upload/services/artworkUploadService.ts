import artworkApis, {
  type ArtworkApiItem,
  type SaveArtworkDraftInput,
  type SubmitArtworkDraftInput,
} from '@shared/apis/artworkApis'
import artworkUploadApi from '@shared/apis/artworkUploadApi'
import type {
  ArtworkImageUploadResponse,
  UploadError,
} from '@shared/types/artwork'
import type {
  UploadListingState,
  UploadMediaState,
} from '../types/uploadArtwork'

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

const extractFilesFromMedia = (media: UploadMediaState): {
  coverImage: File | null
  additionalImages: File[]
} => {
  const coverImage = media.coverImage?.file ?? null
  const additionalImages = media.additionalImages
    .map((item) => item.file)
    .filter((file): file is File => file !== undefined)

  return { coverImage, additionalImages }
}

const hasExistingPrimaryImage = (media: UploadMediaState) =>
  Boolean(media.coverImage && !media.coverImage.file && (media.coverImage.secureUrl || media.coverImage.url))

const toUploadedImageInput = (image: ArtworkImageUploadResponse) => ({
  publicId: image.publicId,
  secureUrl: image.secureUrl,
  url: image.url,
  format: image.format,
  size: image.size,
  width: image.width,
  height: image.height,
  bucket: image.bucket,
  isPrimary: image.isPrimary,
})

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

const uploadImageFile = async (
  file: File,
  draftArtworkId: string,
  isPrimary: boolean,
  order: number,
  total: number,
  onProgress?: ProgressCallback,
) => {
  const current = order + 1

  onProgress?.({
    stage: 'uploading_images',
    imageProgress: {
      current,
      total,
      percentage: Math.round((order / total) * 100),
    },
    currentFile: file.name,
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

  const filesToUpload = [coverImage, ...additionalImages].filter(
    (file): file is File => Boolean(file),
  )
  const uploadedImages: ArtworkImageUploadResponse[] = []
  const savePayload: SaveArtworkDraftInput = {
    ...draftPayload,
    dimensions: draftPayload.dimensions,
    weight: draftPayload.weight,
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
    await artworkApis.addImagesToArtwork(
      draftArtworkId,
      uploadedImages.map(toUploadedImageInput),
    )
  }

  onProgress?.({
    stage: 'creating_artwork',
    imageProgress: {
      current: filesToUpload.length,
      total: filesToUpload.length,
      percentage: 100,
    },
  })

  const artwork = await artworkApis.submitUploadDraft(
    draftArtworkId,
    buildSubmitPayload(listing),
  )

  onProgress?.({
    stage: 'complete',
    imageProgress: {
      current: filesToUpload.length,
      total: filesToUpload.length,
      percentage: 100,
    },
  })

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

  const allFiles = [
    media.coverImage?.file,
    ...media.additionalImages.map((img) => img.file),
  ].filter((file): file is File => file !== undefined)

  const maxSize = 25 * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']

  allFiles.forEach((file) => {
    if (file.size > maxSize) {
      errors.push(`File "${file.name}" exceeds the 25MB limit`)
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File "${file.name}" has an unsupported type`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

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
