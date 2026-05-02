// @domains - inventory upload
import {
  UploadDetailsState,
  UploadListingState,
  UploadMediaItem,
  UploadMediaState,
  UploadStoryState,
} from '@domains/inventory-upload/types/uploadArtwork'

type UploadValidationState = {
  media: UploadMediaState
  details: UploadDetailsState
  listing: UploadListingState
  story: UploadStoryState
}

type UploadValidationErrors = Record<string, string>

const MAX_ADDITIONAL_IMAGES = 4
const MAX_IMAGE_SIZE_MB = 25
const MAX_VIDEO_SIZE_MB = 200
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024
const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/heic',
  'image/heif',
]
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.heic', '.heif']
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm']

const IMAGE_ACCEPT = [...IMAGE_MIME_TYPES, ...IMAGE_EXTENSIONS].join(',')
const VIDEO_ACCEPT = [...VIDEO_MIME_TYPES, ...VIDEO_EXTENSIONS].join(',')

const STEP1_ERROR_PREFIXES = ['media.coverImage', 'media.additionalImages', 'details.', 'listing.']
const STEP2_ERROR_PREFIXES = ['media.momentVideo', 'story.']

export const UPLOAD_MEDIA_RULES = {
  MAX_ADDITIONAL_IMAGES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  IMAGE_ACCEPT,
  VIDEO_ACCEPT,
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
}

const getFileExtension = (fileName: string) => {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index).toLowerCase() : ''
}

const isAllowedFileType = (file: File, allowedMimeTypes: string[], allowedExtensions: string[]) => {
  if (allowedMimeTypes.includes(file.type)) {
    return true
  }
  const extension = getFileExtension(file.name)
  return extension ? allowedExtensions.includes(extension) : false
}

const validateFile = (
  file: File,
  allowedMimeTypes: string[],
  allowedExtensions: string[],
  maxSizeBytes: number,
) => {
  if (!isAllowedFileType(file, allowedMimeTypes, allowedExtensions)) {
    return 'Unsupported file type.'
  }
  if (file.size > maxSizeBytes) {
    return 'File is too large.'
  }
  return ''
}

const validateImageFile = (file: File) =>
  validateFile(file, IMAGE_MIME_TYPES, IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_BYTES)

const validateVideoFile = (file: File) =>
  validateFile(file, VIDEO_MIME_TYPES, VIDEO_EXTENSIONS, MAX_VIDEO_SIZE_BYTES)

const normalizeNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return Number.NaN
  }
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

const isNonNegativeNumber = (value: string) => {
  const parsed = normalizeNumber(value)
  return Number.isFinite(parsed) && parsed >= 0
}

const isPositiveNumber = (value: string) => {
  const parsed = normalizeNumber(value)
  return Number.isFinite(parsed) && parsed > 0
}

const validateMediaItem = (item?: UploadMediaItem | null, validator?: (file: File) => string) => {
  if (!item?.file || !validator) {
    return ''
  }
  return validator(item.file)
}

const hasUsableImage = (item?: UploadMediaItem | null) =>
  Boolean(item?.file || item?.secureUrl || item?.url || item?.previewUrl)

export const validateUploadState = (state: UploadValidationState) => {
  const errors: UploadValidationErrors = {}
  const { media, details, listing, story } = state

  if (!hasUsableImage(media.coverImage)) {
    errors['media.coverImage'] = 'Cover image is required.'
  } else {
    const coverError = validateMediaItem(media.coverImage, validateImageFile)
    if (coverError) {
      errors['media.coverImage'] = coverError
    }
  }

  if (media.additionalImages.length > MAX_ADDITIONAL_IMAGES) {
    errors['media.additionalImages'] =
      `You can add up to ${MAX_ADDITIONAL_IMAGES} additional images.`
  } else {
    const invalidAdditional = media.additionalImages.find((item) =>
      validateMediaItem(item, validateImageFile),
    )
    if (invalidAdditional?.file) {
      errors['media.additionalImages'] = validateImageFile(invalidAdditional.file)
    }
  }

  if (media.momentVideo?.file) {
    const videoError = validateMediaItem(media.momentVideo, validateVideoFile)
    if (videoError) {
      errors['media.momentVideo'] = videoError
    }
  }

  if (!details.title.trim()) {
    errors['details.title'] = 'Artwork title is required.'
  }

  if (!details.year.trim()) {
    errors['details.year'] = 'Year is required.'
  } else {
    const yearValue = normalizeNumber(details.year)
    if (!Number.isInteger(yearValue) || yearValue < 1 || yearValue > 9999) {
      errors['details.year'] = 'Year must be between 1 and 9999.'
    }
  }

  if (!details.dimensions.height.trim()) {
    errors['details.dimensions.height'] = 'Height is required.'
  } else if (!isPositiveNumber(details.dimensions.height)) {
    errors['details.dimensions.height'] = 'Height must be greater than 0.'
  }

  if (!details.dimensions.width.trim()) {
    errors['details.dimensions.width'] = 'Width is required.'
  } else if (!isPositiveNumber(details.dimensions.width)) {
    errors['details.dimensions.width'] = 'Width must be greater than 0.'
  }

  if (details.dimensions.depth.trim() && !isNonNegativeNumber(details.dimensions.depth)) {
    errors['details.dimensions.depth'] = 'Depth must be 0 or greater.'
  }

  if (details.weight.value.trim() && !isNonNegativeNumber(details.weight.value)) {
    errors['details.weight.value'] = 'Weight must be 0 or greater.'
  }

  const isForSale = listing.status === 'sale'
  if (isForSale && !listing.price.trim()) {
    errors['listing.price'] = 'Price is required.'
  } else if (listing.price.trim() && !isNonNegativeNumber(listing.price)) {
    errors['listing.price'] = 'Price must be 0 or greater.'
  }

  if (isForSale && !listing.quantity.trim()) {
    errors['listing.quantity'] = 'Quantity is required.'
  } else if (listing.quantity.trim() && !isPositiveNumber(listing.quantity)) {
    errors['listing.quantity'] = 'Quantity must be 1 or greater.'
  }

  story.trivia.forEach((trivia) => {
    if (trivia.question.trim() && !trivia.answer.trim()) {
      errors[`story.trivia.${trivia.id}.answer`] = 'Answer is required when a question is provided.'
    }
  })

  return errors
}

export const filterErrorsByStep = (errors: UploadValidationErrors, step: 1 | 2) => {
  const prefixes = step === 1 ? STEP1_ERROR_PREFIXES : STEP2_ERROR_PREFIXES
  return Object.fromEntries(
    Object.entries(errors).filter(([key]) =>
      prefixes.some((prefix) =>
        prefix.endsWith('.') ? key.startsWith(prefix) : key === prefix || key.startsWith(prefix),
      ),
    ),
  )
}

export type { UploadValidationErrors, UploadValidationState }
