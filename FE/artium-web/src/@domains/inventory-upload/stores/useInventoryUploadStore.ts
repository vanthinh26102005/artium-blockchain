// third-party
import { create } from 'zustand'

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

const createPreviewUrl = (file: File) => {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return undefined
  }
  return URL.createObjectURL(file)
}

const revokePreviewUrl = (previewUrl?: string) => {
  if (!previewUrl || typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') {
    return
  }
  URL.revokeObjectURL(previewUrl)
}

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
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

const filterErrorsByPrefix = (errors: Record<string, string>, prefix: string) => {
  return Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith(prefix)))
}

type UploadMediaFile = {
  file?: File
  previewUrl?: string
  name?: string
  size?: number
  type?: string
}

type UploadImageItem = UploadMediaFile & {
  id: string
}

type UploadTagGroup = 'vibes' | 'values' | 'mediums'

type UploadTags = {
  vibes: string[]
  values: string[]
  mediums: string[]
}

type UploadTrivia = {
  id: string
  question: string
  answer: string
}

type UploadDetailsDraft = {
  tags: UploadTags
  trivias: UploadTrivia[]
}

type InventoryUploadState = {
  draftArtworkId: string | null
  step: number
  isHydrated: boolean
  coverImage: UploadMediaFile
  images: UploadImageItem[]
  video?: UploadMediaFile
  detailsDraft: UploadDetailsDraft
  errors: Record<string, string>
  setDraftArtworkId: (draftArtworkId: string) => void
  setIsHydrated: (isHydrated: boolean) => void
  setCoverImage: (file?: File | null) => void
  addImages: (files: File[]) => void
  removeImage: (id: string) => void
  setVideo: (file?: File | null) => void
  clearMedia: () => void
  setDetailField: (
    field: keyof UploadDetailsDraft,
    value: UploadDetailsDraft[keyof UploadDetailsDraft],
  ) => void
  addTag: (group: UploadTagGroup, value: string) => void
  removeTag: (group: UploadTagGroup, value: string) => void
  addTrivia: () => void
  updateTrivia: (id: string, field: 'question' | 'answer', value: string) => void
  removeTrivia: (id: string) => void
  validateStep1: () => boolean
  validateStep2: () => boolean
  goToStep: (step: number) => void
  nextStep: () => boolean
  prevStep: () => void
  reset: () => void
}

export const UPLOAD_MEDIA_RULES = {
  MAX_ADDITIONAL_IMAGES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  IMAGE_ACCEPT,
  VIDEO_ACCEPT,
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
}

const createEmptyTrivia = (): UploadTrivia => ({
  id: createLocalId(),
  question: '',
  answer: '',
})

export const useInventoryUploadStore = create<InventoryUploadState>((set, get) => ({
  draftArtworkId: null,
  step: 1,
  isHydrated: false,
  coverImage: {},
  images: [],
  video: undefined,
  detailsDraft: {
    tags: {
      vibes: [],
      values: [],
      mediums: [],
    },
    trivias: [createEmptyTrivia()],
  },
  errors: {},
  setDraftArtworkId: (draftArtworkId) => set({ draftArtworkId }),
  setIsHydrated: (isHydrated) => set({ isHydrated }),
  setCoverImage: (file) =>
    set((state) => {
      const nextErrors = { ...state.errors }
      if (!file) {
        revokePreviewUrl(state.coverImage.previewUrl)
        delete nextErrors.coverImage
        return { coverImage: {}, errors: nextErrors }
      }

      const validationError = validateFile(
        file,
        IMAGE_MIME_TYPES,
        IMAGE_EXTENSIONS,
        MAX_IMAGE_SIZE_BYTES,
      )
      if (validationError) {
        return { errors: { ...nextErrors, coverImage: validationError } }
      }

      revokePreviewUrl(state.coverImage.previewUrl)
      delete nextErrors.coverImage
      return {
        coverImage: {
          file,
          previewUrl: createPreviewUrl(file),
          name: file.name,
          size: file.size,
          type: file.type,
        },
        errors: nextErrors,
      }
    }),
  addImages: (files) =>
    set((state) => {
      const nextErrors = { ...state.errors }
      const remainingSlots = MAX_ADDITIONAL_IMAGES - state.images.length
      if (remainingSlots <= 0) {
        return {
          errors: {
            ...nextErrors,
            images: `You can add up to ${MAX_ADDITIONAL_IMAGES} additional images.`,
          },
        }
      }

      const acceptedFiles = files.slice(0, remainingSlots)
      const newImages: UploadImageItem[] = []

      for (const file of acceptedFiles) {
        const validationError = validateFile(
          file,
          IMAGE_MIME_TYPES,
          IMAGE_EXTENSIONS,
          MAX_IMAGE_SIZE_BYTES,
        )
        if (validationError) {
          nextErrors.images = validationError
          continue
        }
        newImages.push({
          id: createLocalId(),
          file,
          previewUrl: createPreviewUrl(file),
          name: file.name,
          size: file.size,
          type: file.type,
        })
      }

      if (newImages.length === 0) {
        return { errors: nextErrors }
      }

      delete nextErrors.images
      return {
        images: [...state.images, ...newImages],
        errors: nextErrors,
      }
    }),
  removeImage: (id) =>
    set((state) => {
      const target = state.images.find((image) => image.id === id)
      const nextErrors = { ...state.errors }
      revokePreviewUrl(target?.previewUrl)
      delete nextErrors.images
      return {
        images: state.images.filter((image) => image.id !== id),
        errors: nextErrors,
      }
    }),
  setVideo: (file) =>
    set((state) => {
      const nextErrors = { ...state.errors }
      if (!file) {
        revokePreviewUrl(state.video?.previewUrl)
        delete nextErrors.video
        return { video: undefined, errors: nextErrors }
      }

      const validationError = validateFile(
        file,
        VIDEO_MIME_TYPES,
        VIDEO_EXTENSIONS,
        MAX_VIDEO_SIZE_BYTES,
      )
      if (validationError) {
        return { errors: { ...nextErrors, video: validationError } }
      }

      revokePreviewUrl(state.video?.previewUrl)
      delete nextErrors.video
      return {
        video: {
          file,
          previewUrl: createPreviewUrl(file),
          name: file.name,
          size: file.size,
          type: file.type,
        },
        errors: nextErrors,
      }
    }),
  clearMedia: () =>
    set((state) => {
      revokePreviewUrl(state.coverImage.previewUrl)
      state.images.forEach((image) => revokePreviewUrl(image.previewUrl))
      revokePreviewUrl(state.video?.previewUrl)
      return {
        coverImage: {},
        images: [],
        video: undefined,
        errors: {},
      }
    }),
  setDetailField: (field, value) =>
    set((state) => ({
      detailsDraft: {
        ...state.detailsDraft,
        [field]: value,
      },
    })),
  addTag: (group, value) =>
    set((state) => {
      const trimmed = value.trim()
      if (!trimmed) {
        return {}
      }
      const groupValues = state.detailsDraft.tags[group]
      if (groupValues.includes(trimmed)) {
        return {}
      }
      return {
        detailsDraft: {
          ...state.detailsDraft,
          tags: {
            ...state.detailsDraft.tags,
            [group]: [...groupValues, trimmed],
          },
        },
      }
    }),
  removeTag: (group, value) =>
    set((state) => ({
      detailsDraft: {
        ...state.detailsDraft,
        tags: {
          ...state.detailsDraft.tags,
          [group]: state.detailsDraft.tags[group].filter((tag) => tag !== value),
        },
      },
    })),
  addTrivia: () =>
    set((state) => ({
      detailsDraft: {
        ...state.detailsDraft,
        trivias: [...state.detailsDraft.trivias, createEmptyTrivia()],
      },
    })),
  updateTrivia: (id, field, value) =>
    set((state) => {
      const nextErrors = { ...state.errors }
      const errorKey = `trivia-${id}-answer`
      if (field === 'answer') {
        delete nextErrors[errorKey]
      }
      if (field === 'question' && !value.trim()) {
        delete nextErrors[errorKey]
      }
      return {
        detailsDraft: {
          ...state.detailsDraft,
          trivias: state.detailsDraft.trivias.map((trivia) =>
            trivia.id === id ? { ...trivia, [field]: value } : trivia,
          ),
        },
        errors: nextErrors,
      }
    }),
  removeTrivia: (id) =>
    set((state) => {
      const nextErrors = { ...state.errors }
      delete nextErrors[`trivia-${id}-answer`]
      const nextTrivias = state.detailsDraft.trivias.filter((trivia) => trivia.id !== id)
      return {
        detailsDraft: {
          ...state.detailsDraft,
          trivias: nextTrivias.length > 0 ? nextTrivias : [createEmptyTrivia()],
        },
        errors: nextErrors,
      }
    }),
  validateStep1: () => {
    let isValid = true
    set((state) => {
      const nextErrors: Record<string, string> = { ...state.errors }
      delete nextErrors.coverImage
      delete nextErrors.images
      delete nextErrors.video

      if (!state.coverImage.file) {
        nextErrors.coverImage = 'Cover image is required.'
        isValid = false
      } else {
        const error = validateFile(
          state.coverImage.file,
          IMAGE_MIME_TYPES,
          IMAGE_EXTENSIONS,
          MAX_IMAGE_SIZE_BYTES,
        )
        if (error) {
          nextErrors.coverImage = error
          isValid = false
        }
      }

      if (state.images.length > MAX_ADDITIONAL_IMAGES) {
        nextErrors.images = `You can add up to ${MAX_ADDITIONAL_IMAGES} additional images.`
        isValid = false
      } else {
        for (const image of state.images) {
          if (!image.file) {
            continue
          }
          const error = validateFile(
            image.file,
            IMAGE_MIME_TYPES,
            IMAGE_EXTENSIONS,
            MAX_IMAGE_SIZE_BYTES,
          )
          if (error) {
            nextErrors.images = error
            isValid = false
            break
          }
        }
      }

      if (state.video?.file) {
        const error = validateFile(
          state.video.file,
          VIDEO_MIME_TYPES,
          VIDEO_EXTENSIONS,
          MAX_VIDEO_SIZE_BYTES,
        )
        if (error) {
          nextErrors.video = error
          isValid = false
        }
      }

      return { errors: nextErrors }
    })

    return isValid
  },
  validateStep2: () => {
    let isValid = true
    set((state) => {
      const nextErrors = filterErrorsByPrefix(state.errors, 'trivia-')

      state.detailsDraft.trivias.forEach((trivia) => {
        if (trivia.question.trim() && !trivia.answer.trim()) {
          nextErrors[`trivia-${trivia.id}-answer`] =
            'Answer is required when a question is provided.'
          isValid = false
        }
      })

      return { errors: nextErrors }
    })

    return isValid
  },
  goToStep: (step) =>
    set({
      step: Math.max(1, Math.min(2, step)),
    }),
  nextStep: () => {
    const { step } = get()
    const totalSteps = 2
    if (step === 1) {
      const isValid = get().validateStep1()
      if (!isValid) {
        return false
      }
    }
    if (step === 2) {
      const isValid = get().validateStep2()
      if (!isValid) {
        return false
      }
    }
    set({ step: Math.min(totalSteps, step + 1) })
    return true
  },
  prevStep: () =>
    set((state) => ({
      step: Math.max(1, state.step - 1),
    })),
  reset: () =>
    set((state) => {
      revokePreviewUrl(state.coverImage.previewUrl)
      state.images.forEach((image) => revokePreviewUrl(image.previewUrl))
      revokePreviewUrl(state.video?.previewUrl)
      return {
        draftArtworkId: null,
        step: 1,
        isHydrated: false,
        coverImage: {},
        images: [],
        video: undefined,
        detailsDraft: {
          tags: {
            vibes: [],
            values: [],
            mediums: [],
          },
          trivias: [createEmptyTrivia()],
        },
        errors: {},
      }
    }),
}))
