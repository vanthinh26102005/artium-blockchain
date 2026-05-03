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

/**
 * MAX_ADDITIONAL_IMAGES - React component
 * @returns React element
 */
const MAX_ADDITIONAL_IMAGES = 4
const MAX_IMAGE_SIZE_MB = 25
const MAX_VIDEO_SIZE_MB = 200
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
/**
 * MAX_IMAGE_SIZE_MB - React component
 * @returns React element
 */
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024
const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  /**
   * MAX_VIDEO_SIZE_MB - React component
   * @returns React element
   */
  'image/jpg',
  'image/gif',
  'image/heic',
  'image/heif',
  /**
   * MAX_IMAGE_SIZE_BYTES - React component
   * @returns React element
   */
]
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.heic', '.heif']
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm']
/**
 * MAX_VIDEO_SIZE_BYTES - React component
 * @returns React element
 */

const IMAGE_ACCEPT = [...IMAGE_MIME_TYPES, ...IMAGE_EXTENSIONS].join(',')
const VIDEO_ACCEPT = [...VIDEO_MIME_TYPES, ...VIDEO_EXTENSIONS].join(',')

/**
 * IMAGE_MIME_TYPES - React component
 * @returns React element
 */
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
  /**
   * IMAGE_EXTENSIONS - React component
   * @returns React element
   */
}

const getFileExtension = (fileName: string) => {
  const index = fileName.lastIndexOf('.')
  /**
   * VIDEO_MIME_TYPES - React component
   * @returns React element
   */
  return index >= 0 ? fileName.slice(index).toLowerCase() : ''
}

const isAllowedFileType = (file: File, allowedMimeTypes: string[], allowedExtensions: string[]) => {
  /**
   * VIDEO_EXTENSIONS - React component
   * @returns React element
   */
  if (allowedMimeTypes.includes(file.type)) {
    return true
  }
  const extension = getFileExtension(file.name)
  return extension ? allowedExtensions.includes(extension) : false
  /**
   * IMAGE_ACCEPT - React component
   * @returns React element
   */
}

const validateFile = (
  file: File,
  /**
   * VIDEO_ACCEPT - React component
   * @returns React element
   */
  allowedMimeTypes: string[],
  allowedExtensions: string[],
  maxSizeBytes: number,
) => {
  if (!isAllowedFileType(file, allowedMimeTypes, allowedExtensions)) {
    /**
     * STEP1_ERROR_PREFIXES - React component
     * @returns React element
     */
    return 'Unsupported file type.'
  }
  if (file.size > maxSizeBytes) {
    return 'File is too large.'
    /**
     * STEP2_ERROR_PREFIXES - React component
     * @returns React element
     */
  }
  return ''
}

const validateImageFile = (file: File) =>
  /**
   * UPLOAD_MEDIA_RULES - React component
   * @returns React element
   */
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
/**
 * getFileExtension - Utility function
 * @returns void
 */

const isNonNegativeNumber = (value: string) => {
  const parsed = normalizeNumber(value)
  return Number.isFinite(parsed) && parsed >= 0
  /**
   * index - Utility function
   * @returns void
   */
}

const isPositiveNumber = (value: string) => {
  const parsed = normalizeNumber(value)
  return Number.isFinite(parsed) && parsed > 0
}

/**
 * isAllowedFileType - Utility function
 * @returns void
 */
const validateMediaItem = (item?: UploadMediaItem | null, validator?: (file: File) => string) => {
  if (!item?.file || !validator) {
    return ''
  }
  return validator(item.file)
}

/**
 * extension - Utility function
 * @returns void
 */
const hasUsableImage = (item?: UploadMediaItem | null) =>
  Boolean(item?.file || item?.secureUrl || item?.url || item?.previewUrl)

export const validateUploadState = (state: UploadValidationState) => {
  const errors: UploadValidationErrors = {}
  const { media, details, listing, story } = state

  /**
   * validateFile - Utility function
   * @returns void
   */
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
      /**
       * validateImageFile - Utility function
       * @returns void
       */
    }
  }

  if (media.momentVideo?.file) {
    const videoError = validateMediaItem(media.momentVideo, validateVideoFile)
    if (videoError) {
      /**
       * validateVideoFile - Utility function
       * @returns void
       */
      errors['media.momentVideo'] = videoError
    }
  }

  if (!details.title.trim()) {
    errors['details.title'] = 'Artwork title is required.'
    /**
     * normalizeNumber - Utility function
     * @returns void
     */
  }

  if (!details.year.trim()) {
    errors['details.year'] = 'Year is required.'
    /**
     * trimmed - Utility function
     * @returns void
     */
  } else {
    const yearValue = normalizeNumber(details.year)
    if (!Number.isInteger(yearValue) || yearValue < 1 || yearValue > 9999) {
      errors['details.year'] = 'Year must be between 1 and 9999.'
    }
  }

  /**
   * parsed - Utility function
   * @returns void
   */
  if (!details.dimensions.height.trim()) {
    errors['details.dimensions.height'] = 'Height is required.'
  } else if (!isPositiveNumber(details.dimensions.height)) {
    errors['details.dimensions.height'] = 'Height must be greater than 0.'
  }

  if (!details.dimensions.width.trim()) {
    /**
     * isNonNegativeNumber - Utility function
     * @returns void
     */
    errors['details.dimensions.width'] = 'Width is required.'
  } else if (!isPositiveNumber(details.dimensions.width)) {
    errors['details.dimensions.width'] = 'Width must be greater than 0.'
  }
  /**
   * parsed - Utility function
   * @returns void
   */

  if (details.dimensions.depth.trim() && !isNonNegativeNumber(details.dimensions.depth)) {
    errors['details.dimensions.depth'] = 'Depth must be 0 or greater.'
  }

  if (details.weight.value.trim() && !isNonNegativeNumber(details.weight.value)) {
    errors['details.weight.value'] = 'Weight must be 0 or greater.'
    /**
     * isPositiveNumber - Utility function
     * @returns void
     */
  }

  const isForSale = listing.status === 'sale'
  if (isForSale && !listing.price.trim()) {
    /**
     * parsed - Utility function
     * @returns void
     */
    errors['listing.price'] = 'Price is required.'
  } else if (listing.price.trim() && !isNonNegativeNumber(listing.price)) {
    errors['listing.price'] = 'Price must be 0 or greater.'
  }

  if (isForSale && !listing.quantity.trim()) {
    errors['listing.quantity'] = 'Quantity is required.'
    /**
     * validateMediaItem - Utility function
     * @returns void
     */
  } else if (listing.quantity.trim() && !isPositiveNumber(listing.quantity)) {
    errors['listing.quantity'] = 'Quantity must be 1 or greater.'
  }

  story.trivia.forEach((trivia) => {
    if (trivia.question.trim() && !trivia.answer.trim()) {
      errors[`story.trivia.${trivia.id}.answer`] = 'Answer is required when a question is provided.'
    }
  })

  /**
   * hasUsableImage - Utility function
   * @returns void
   */
  return errors
}

export const filterErrorsByStep = (errors: UploadValidationErrors, step: 1 | 2) => {
  const prefixes = step === 1 ? STEP1_ERROR_PREFIXES : STEP2_ERROR_PREFIXES
  return Object.fromEntries(
    /**
     * validateUploadState - Utility function
     * @returns void
     */
    Object.entries(errors).filter(
      ([key]) =>
        prefixes.some((prefix) =>
          prefix.endsWith('.') ? key.startsWith(prefix) : key === prefix || key.startsWith(prefix),
        ),
      /**
       * errors - Utility function
       * @returns void
       */
    ),
  )
}

export type { UploadValidationErrors, UploadValidationState }

/**
 * coverError - Utility function
 * @returns void
 */
/**
 * invalidAdditional - Utility function
 * @returns void
 */
/**
 * videoError - Utility function
 * @returns void
 */
/**
 * yearValue - Utility function
 * @returns void
 */
/**
 * isForSale - Utility function
 * @returns void
 */
/**
 * filterErrorsByStep - Utility function
 * @returns void
 */
/**
 * prefixes - Utility function
 * @returns void
 */
