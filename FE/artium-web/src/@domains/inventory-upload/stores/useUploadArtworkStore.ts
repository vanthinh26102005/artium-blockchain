// third-party
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// @domains - inventory upload
import {
  UploadDetailsState,
  UploadListingState,
  UploadMediaItem,
  UploadMediaState,
  UploadLocation,
  UploadLocationDraft,
  UploadStep,
  UploadStoryState,
  UploadTagGroup,
  UploadTrivia,
} from '@domains/inventory-upload/types/uploadArtwork'
import {
  UPLOAD_MEDIA_RULES,
  UploadValidationErrors,
  filterErrorsByStep,
  validateUploadState,
} from '@domains/inventory-upload/utils/validation'
import {
  clearStoredFiles,
  getStoredFile,
  removeStoredFile,
  saveStoredFile,
} from '@domains/inventory-upload/utils/fileStorage'

type UploadArtworkState = {
  step: UploadStep
  draftId: string | null
  media: UploadMediaState
  details: UploadDetailsState
  locations: UploadLocation[]
  listing: UploadListingState
  story: UploadStoryState
  isDirty: boolean
  isSaving: boolean
  isHydrated: boolean
  errors: UploadValidationErrors
  touched: Record<string, boolean>
  setStep: (step: UploadStep) => void
  nextStep: () => boolean
  prevStep: () => void
  setField: (path: string, value: string | number | boolean) => void
  setCoverImage: (file?: File | null) => void
  addAdditionalImages: (files: File[]) => void
  replaceAdditionalImage: (id: string, file: File) => void
  removeAdditionalImage: (id: string) => void
  setMomentVideo: (file?: File | null) => void
  addTag: (group: UploadTagGroup, value: string) => void
  removeTag: (group: UploadTagGroup, value: string) => void
  toggleTag: (group: UploadTagGroup, value: string) => void
  addLocation: () => void
  removeLocation: (id: string) => void
  clearLocationDraft: () => void
  addCustomTag: (value?: string) => void
  removeCustomTag: (value: string) => void
  clearCustomTags: () => void
  addTrivia: () => void
  updateTrivia: (id: string, field: 'question' | 'answer', value: string) => void
  removeTrivia: (id: string) => void
  resetDraft: () => void
  hydrateFromQuery: (draftId?: string | null) => void
  markDirty: () => void
  clearDirty: () => void
  validateStep: (step: UploadStep) => boolean
  validateAll: () => boolean
  getStepStatus: (step: UploadStep) => {
    isValid: boolean
    errors: UploadValidationErrors
  }
  rehydrateMediaFiles: () => void
  revokeMediaPreviews: () => void
}

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

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

const createEmptyListing = (): UploadListingState => ({
  status: 'sale',
  price: '',
  quantity: '',
  allowOffers: true,
  hidePricePublic: false,
})

const createEmptyStory = (): UploadStoryState => ({
  tags: {
    vibes: [],
    values: [],
    mediums: [],
  },
  trivia: [
    {
      id: createLocalId(),
      question: '',
      answer: '',
    },
  ],
  moment: {
    caption: '',
    type: '',
  },
})

const createEmptyMedia = (): UploadMediaState => ({
  coverImage: null,
  additionalImages: [],
  momentVideo: null,
})

const createEmptyLocationDraft = (): UploadLocationDraft => ({
  name: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
})

const createEmptyDetails = (): UploadDetailsState => ({
  title: '',
  description: '',
  year: '',
  editionRun: '',
  dimensions: {
    height: '',
    width: '',
    depth: '',
    unit: 'in',
  },
  weight: {
    value: '',
    unit: 'lbs',
  },
  materials: '',
  locationId: '',
  locationDraft: createEmptyLocationDraft(),
  customTags: [],
  customTagInput: '',
  deliveryNote: '',
})

const createMediaItem = (file: File, id = createLocalId()): UploadMediaItem => ({
  id,
  file,
  previewUrl: createPreviewUrl(file),
  name: file.name,
  size: file.size,
  type: file.type,
  lastModified: file.lastModified,
})

const buildValidationState = (state: UploadArtworkState) => ({
  media: state.media,
  details: state.details,
  listing: state.listing,
  story: state.story,
})

const buildTouchedFromErrors = (errors: UploadValidationErrors) =>
  Object.keys(errors).reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = true
    return acc
  }, {})

const setNestedValue = <T extends Record<string, unknown>>(
  target: T,
  path: string[],
  value: string | number | boolean,
): T => {
  if (path.length === 0) {
    return target
  }
  const [key, ...rest] = path
  const next = { ...target } as Record<string, unknown>
  if (rest.length === 0) {
    next[key] = value
    return next as T
  }
  const currentChild = (target[key] ?? {}) as Record<string, unknown>
  next[key] = setNestedValue(currentChild, rest, value)
  return next as T
}

const serializeMediaItem = (item: UploadMediaItem | null) => {
  if (!item) {
    return null
  }
  return {
    id: item.id,
    name: item.name,
    size: item.size,
    type: item.type,
    lastModified: item.lastModified,
  }
}

export const useUploadArtworkStore = create<UploadArtworkState>()(
  persist(
    (set, get) => ({
      step: 1,
      draftId: null,
      media: createEmptyMedia(),
      details: createEmptyDetails(),
      locations: [],
      listing: createEmptyListing(),
      story: createEmptyStory(),
      isDirty: false,
      isSaving: false,
      isHydrated: false,
      errors: {},
      touched: {},
      setStep: (step) => set({ step: Math.max(1, Math.min(2, step)) as UploadStep }),
      nextStep: () => {
        const { step } = get()
        const isValid = get().validateStep(step)
        if (!isValid) {
          return false
        }
        if (step < 2) {
          set({ step: 2 })
          return true
        }
        get().clearDirty()
        return true
      },
      prevStep: () =>
        set((state) => ({
          step: Math.max(1, state.step - 1) as UploadStep,
        })),
      setField: (path, value) =>
        set((state) => {
          const [scope, ...rest] = path.split('.')
          let nextDetails = state.details
          let nextListing = state.listing
          let nextStory = state.story

          if (scope === 'details') {
            nextDetails = setNestedValue(state.details, rest, value) as UploadDetailsState
          }
          if (scope === 'listing') {
            nextListing = setNestedValue(state.listing, rest, value) as UploadListingState
          }
          if (scope === 'story') {
            nextStory = setNestedValue(state.story, rest, value) as UploadStoryState
          }

          const nextState = {
            ...state,
            details: nextDetails,
            listing: nextListing,
            story: nextStory,
          }
          const errors = validateUploadState(buildValidationState(nextState))

          return {
            details: nextDetails,
            listing: nextListing,
            story: nextStory,
            errors,
            touched: { ...state.touched, [path]: true },
            isDirty: true,
          }
        }),
      setCoverImage: (file) =>
        set((state) => {
          if (!file) {
            revokePreviewUrl(state.media.coverImage?.previewUrl)
            if (state.media.coverImage?.id) {
              removeStoredFile(state.media.coverImage.id).catch(() => {})
            }
            const nextMedia = { ...state.media, coverImage: null }
            const nextState = { ...state, media: nextMedia }
            const errors = validateUploadState(buildValidationState(nextState))
            return {
              media: nextMedia,
              errors,
              touched: { ...state.touched, 'media.coverImage': true },
              isDirty: true,
            }
          }

          const nextId = state.media.coverImage?.id ?? createLocalId()
          const validationError = validateUploadState({
            media: {
              ...state.media,
              coverImage: {
                id: nextId,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
              },
            },
            details: state.details,
            listing: state.listing,
            story: state.story,
          })['media.coverImage']

          if (validationError) {
            return {
              errors: { ...state.errors, 'media.coverImage': validationError },
              touched: { ...state.touched, 'media.coverImage': true },
            }
          }

          revokePreviewUrl(state.media.coverImage?.previewUrl)
          const nextItem = createMediaItem(file, nextId)
          saveStoredFile(nextItem.id, file).catch(() => {})

          const nextMedia = { ...state.media, coverImage: nextItem }
          const nextState = { ...state, media: nextMedia }
          const errors = validateUploadState(buildValidationState(nextState))

          return {
            media: nextMedia,
            errors,
            touched: { ...state.touched, 'media.coverImage': true },
            isDirty: true,
          }
        }),
      addAdditionalImages: (files) =>
        set((state) => {
          const remainingSlots =
            UPLOAD_MEDIA_RULES.MAX_ADDITIONAL_IMAGES - state.media.additionalImages.length
          if (remainingSlots <= 0) {
            return {
              errors: {
                ...state.errors,
                'media.additionalImages': `You can add up to ${UPLOAD_MEDIA_RULES.MAX_ADDITIONAL_IMAGES} additional images.`,
              },
              touched: { ...state.touched, 'media.additionalImages': true },
            }
          }

          const acceptedFiles = files.slice(0, remainingSlots)
          const newItems: UploadMediaItem[] = []
          let validationError = ''

          acceptedFiles.forEach((file) => {
            const mediaItem = createMediaItem(file)
            const nextState = {
              ...state,
              media: {
                ...state.media,
                additionalImages: [...state.media.additionalImages, mediaItem],
              },
            }
            const error = validateUploadState(buildValidationState(nextState))[
              'media.additionalImages'
            ]
            if (error) {
              validationError = error
              revokePreviewUrl(mediaItem.previewUrl)
              return
            }
            saveStoredFile(mediaItem.id, file).catch(() => {})
            newItems.push(mediaItem)
          })

          if (newItems.length === 0 && validationError) {
            return {
              errors: { ...state.errors, 'media.additionalImages': validationError },
              touched: { ...state.touched, 'media.additionalImages': true },
            }
          }

          const nextMedia = {
            ...state.media,
            additionalImages: [...state.media.additionalImages, ...newItems],
          }
          const nextState = { ...state, media: nextMedia }
          const errors = {
            ...validateUploadState(buildValidationState(nextState)),
            ...(validationError ? { 'media.additionalImages': validationError } : {}),
          }

          return {
            media: nextMedia,
            errors,
            touched: { ...state.touched, 'media.additionalImages': true },
            isDirty: true,
          }
        }),
      replaceAdditionalImage: (id, file) =>
        set((state) => {
          const targetIndex = state.media.additionalImages.findIndex((item) => item.id === id)
          if (targetIndex === -1) {
            return {}
          }

          const existing = state.media.additionalImages[targetIndex]
          const nextAdditionalImages = [...state.media.additionalImages]
          nextAdditionalImages[targetIndex] = {
            id,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          }

          const validationError = validateUploadState({
            media: {
              ...state.media,
              additionalImages: nextAdditionalImages,
            },
            details: state.details,
            listing: state.listing,
            story: state.story,
          })['media.additionalImages']

          if (validationError) {
            return {
              errors: { ...state.errors, 'media.additionalImages': validationError },
              touched: { ...state.touched, 'media.additionalImages': true },
            }
          }

          revokePreviewUrl(existing.previewUrl)
          saveStoredFile(id, file).catch(() => {})

          const nextItem = createMediaItem(file, id)
          nextAdditionalImages[targetIndex] = nextItem
          const nextMedia = {
            ...state.media,
            additionalImages: nextAdditionalImages,
          }
          const nextState = { ...state, media: nextMedia }
          const errors = validateUploadState(buildValidationState(nextState))

          return {
            media: nextMedia,
            errors,
            touched: { ...state.touched, 'media.additionalImages': true },
            isDirty: true,
          }
        }),
      removeAdditionalImage: (id) =>
        set((state) => {
          const target = state.media.additionalImages.find((item) => item.id === id)
          if (target?.previewUrl) {
            revokePreviewUrl(target.previewUrl)
          }
          removeStoredFile(id).catch(() => {})
          const nextMedia = {
            ...state.media,
            additionalImages: state.media.additionalImages.filter((item) => item.id !== id),
          }
          const nextState = { ...state, media: nextMedia }
          const errors = validateUploadState(buildValidationState(nextState))
          return {
            media: nextMedia,
            errors,
            touched: { ...state.touched, 'media.additionalImages': true },
            isDirty: true,
          }
        }),
      setMomentVideo: (file) =>
        set((state) => {
          if (!file) {
            revokePreviewUrl(state.media.momentVideo?.previewUrl)
            if (state.media.momentVideo?.id) {
              removeStoredFile(state.media.momentVideo.id).catch(() => {})
            }
            const nextMedia = { ...state.media, momentVideo: null }
            const nextState = { ...state, media: nextMedia }
            const errors = validateUploadState(buildValidationState(nextState))
            return {
              media: nextMedia,
              errors,
              touched: { ...state.touched, 'media.momentVideo': true },
              isDirty: true,
            }
          }

          const nextId = state.media.momentVideo?.id ?? createLocalId()
          const validationError = validateUploadState({
            media: {
              ...state.media,
              momentVideo: {
                id: nextId,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
              },
            },
            details: state.details,
            listing: state.listing,
            story: state.story,
          })['media.momentVideo']

          if (validationError) {
            return {
              errors: { ...state.errors, 'media.momentVideo': validationError },
              touched: { ...state.touched, 'media.momentVideo': true },
            }
          }

          revokePreviewUrl(state.media.momentVideo?.previewUrl)
          const nextItem = createMediaItem(file, nextId)
          saveStoredFile(nextItem.id, file).catch(() => {})
          const nextMedia = { ...state.media, momentVideo: nextItem }
          const nextState = { ...state, media: nextMedia }
          const errors = validateUploadState(buildValidationState(nextState))

          return {
            media: nextMedia,
            errors,
            touched: { ...state.touched, 'media.momentVideo': true },
            isDirty: true,
          }
        }),
      addTag: (group, value) =>
        set((state) => {
          const trimmed = value.trim()
          if (!trimmed || state.story.tags[group].includes(trimmed)) {
            return {}
          }
          const nextTags = {
            ...state.story.tags,
            [group]: [...state.story.tags[group], trimmed],
          }
          const nextStory = {
            ...state.story,
            tags: nextTags,
          }
          const nextState = { ...state, story: nextStory }
          const errors = validateUploadState(buildValidationState(nextState))
          return {
            story: nextStory,
            errors,
            isDirty: true,
          }
        }),
      removeTag: (group, value) =>
        set((state) => {
          const nextTags = {
            ...state.story.tags,
            [group]: state.story.tags[group].filter((tag) => tag !== value),
          }
          const nextStory = {
            ...state.story,
            tags: nextTags,
          }
          const nextState = { ...state, story: nextStory }
          const errors = validateUploadState(buildValidationState(nextState))
          return {
            story: nextStory,
            errors,
            isDirty: true,
          }
        }),
      toggleTag: (group, value) => {
        const { addTag, removeTag, story } = get()
        if (story.tags[group].includes(value)) {
          removeTag(group, value)
          return
        }
        addTag(group, value)
      },
      addLocation: () =>
        set((state) => {
          const rawDraft = state.details.locationDraft ?? {}
          const draft = {
            name: rawDraft.name ?? '',
            address1: rawDraft.address1 ?? '',
            address2: rawDraft.address2 ?? '',
            city: rawDraft.city ?? '',
            state: rawDraft.state ?? '',
            country: rawDraft.country ?? '',
            postalCode: rawDraft.postalCode ?? '',
          }
          const name = draft.name.trim()
          if (!name) {
            return {}
          }
          const nextLocation: UploadLocation = {
            id: createLocalId(),
            name,
            address1: draft.address1.trim(),
            address2: draft.address2.trim(),
            city: draft.city.trim(),
            state: draft.state.trim(),
            country: draft.country.trim(),
            postalCode: draft.postalCode.trim(),
          }
          const nextDetails = {
            ...state.details,
            locationId: nextLocation.id,
            locationDraft: createEmptyLocationDraft(),
          }
          return {
            locations: [...state.locations, nextLocation],
            details: nextDetails,
            isDirty: true,
          }
        }),
      removeLocation: (id) =>
        set((state) => {
          const nextLocations = state.locations.filter((location) => location.id !== id)
          const nextDetails = {
            ...state.details,
            locationId: state.details.locationId === id ? '' : state.details.locationId,
          }
          return {
            locations: nextLocations,
            details: nextDetails,
            isDirty: true,
          }
        }),
      clearLocationDraft: () =>
        set((state) => ({
          details: {
            ...state.details,
            locationDraft: createEmptyLocationDraft(),
          },
        })),
      addCustomTag: (value) =>
        set((state) => {
          const customTags = state.details.customTags ?? []
          const customTagInput = state.details.customTagInput ?? ''
          const nextValue = (value ?? customTagInput).trim()
          if (!nextValue || customTags.includes(nextValue)) {
            return {
              details: {
                ...state.details,
                customTagInput: '',
              },
            }
          }
          return {
            details: {
              ...state.details,
              customTags: [...customTags, nextValue],
              customTagInput: '',
            },
            isDirty: true,
          }
        }),
      removeCustomTag: (value) =>
        set((state) => {
          const customTags = state.details.customTags ?? []
          return {
            details: {
              ...state.details,
              customTags: customTags.filter((tag) => tag !== value),
            },
            isDirty: true,
          }
        }),
      clearCustomTags: () =>
        set((state) => ({
          details: {
            ...state.details,
            customTags: [],
          },
          isDirty: true,
        })),
      addTrivia: () =>
        set((state) => {
          const nextTrivia: UploadTrivia = {
            id: createLocalId(),
            question: '',
            answer: '',
          }
          const nextStory = {
            ...state.story,
            trivia: [...state.story.trivia, nextTrivia],
          }
          const nextState = { ...state, story: nextStory }
          const errors = validateUploadState(buildValidationState(nextState))
          return {
            story: nextStory,
            errors,
            isDirty: true,
          }
        }),
      updateTrivia: (id, field, value) =>
        set((state) => {
          const nextTrivia = state.story.trivia.map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          )
          const nextStory = {
            ...state.story,
            trivia: nextTrivia,
          }
          const nextState = { ...state, story: nextStory }
          const errors = validateUploadState(buildValidationState(nextState))
          return {
            story: nextStory,
            errors,
            touched: { ...state.touched, [`story.trivia.${id}.${field}`]: true },
            isDirty: true,
          }
        }),
      removeTrivia: (id) =>
        set((state) => {
          const nextTrivia = state.story.trivia.filter((item) => item.id !== id)
          const nextStory = {
            ...state.story,
            trivia: nextTrivia.length > 0 ? nextTrivia : createEmptyStory().trivia,
          }
          const nextState = { ...state, story: nextStory }
          const errors = validateUploadState(buildValidationState(nextState))
          const nextTouched = { ...state.touched }
          delete nextTouched[`story.trivia.${id}.answer`]
          delete nextTouched[`story.trivia.${id}.question`]
          return {
            story: nextStory,
            errors,
            touched: nextTouched,
            isDirty: true,
          }
        }),
      resetDraft: () => {
        const { media } = get()
        revokePreviewUrl(media.coverImage?.previewUrl)
        revokePreviewUrl(media.momentVideo?.previewUrl)
        media.additionalImages.forEach((item) => revokePreviewUrl(item.previewUrl))
        clearStoredFiles().catch(() => {})
        set({
          step: 1,
          draftId: null,
          media: createEmptyMedia(),
          details: createEmptyDetails(),
          locations: [],
          listing: createEmptyListing(),
          story: createEmptyStory(),
          isDirty: false,
          isSaving: false,
          errors: {},
          touched: {},
        })
      },
      hydrateFromQuery: (draftId) =>
        set({
          draftId: draftId ?? null,
          isHydrated: true,
        }),
      markDirty: () => set({ isDirty: true }),
      clearDirty: () => set({ isDirty: false }),
      validateStep: (step) => {
        const errors = validateUploadState(buildValidationState(get()))
        const stepErrors = filterErrorsByStep(errors, step)
        set((state) => ({
          errors,
          touched: { ...state.touched, ...buildTouchedFromErrors(stepErrors) },
        }))
        return Object.keys(stepErrors).length === 0
      },
      validateAll: () => {
        const errors = validateUploadState(buildValidationState(get()))
        set((state) => ({
          errors,
          touched: { ...state.touched, ...buildTouchedFromErrors(errors) },
        }))
        return Object.keys(errors).length === 0
      },
      getStepStatus: (step) => {
        const errors = validateUploadState(buildValidationState(get()))
        const stepErrors = filterErrorsByStep(errors, step)
        return {
          isValid: Object.keys(stepErrors).length === 0,
          errors: stepErrors,
        }
      },
      rehydrateMediaFiles: () => {
        const hydrateItem = async (item: UploadMediaItem | null) => {
          if (!item?.id) {
            return item
          }
          const file = await getStoredFile(item.id).catch(() => undefined)
          if (!file) {
            return item
          }
          return {
            ...item,
            file,
            previewUrl: createPreviewUrl(file),
            name: item.name ?? file.name,
            size: item.size ?? file.size,
            type: item.type ?? file.type,
            lastModified: item.lastModified ?? file.lastModified,
          }
        }

        const { media } = get()

        Promise.all([
          hydrateItem(media.coverImage),
          Promise.all(media.additionalImages.map((item) => hydrateItem(item))),
          hydrateItem(media.momentVideo),
        ]).then(([coverImage, additionalImages, momentVideo]) => {
          const nextMedia = {
            coverImage: coverImage ?? null,
            additionalImages: additionalImages as UploadMediaItem[],
            momentVideo: momentVideo ?? null,
          }
          const nextState = { ...get(), media: nextMedia }
          const errors = validateUploadState(buildValidationState(nextState))
          set({
            media: nextMedia,
            errors,
            isHydrated: true,
          })
        })
      },
      revokeMediaPreviews: () => {
        const { media } = get()
        revokePreviewUrl(media.coverImage?.previewUrl)
        revokePreviewUrl(media.momentVideo?.previewUrl)
        media.additionalImages.forEach((item) => revokePreviewUrl(item.previewUrl))
      },
    }),
    {
      name: 'artium.inventoryUpload.state',
      partialize: (state) => ({
        step: state.step,
        draftId: state.draftId,
        media: {
          coverImage: serializeMediaItem(state.media.coverImage),
          additionalImages: state.media.additionalImages.map((item) => serializeMediaItem(item)),
          momentVideo: serializeMediaItem(state.media.momentVideo),
        },
        details: state.details,
        locations: state.locations,
        listing: state.listing,
        story: state.story,
        isDirty: state.isDirty,
      }),
      onRehydrateStorage: () => (state) => {
        state?.rehydrateMediaFiles()
      },
    },
  ),
)

export { UPLOAD_MEDIA_RULES }
