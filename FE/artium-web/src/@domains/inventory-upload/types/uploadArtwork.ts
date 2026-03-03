type UploadStep = 1 | 2

type UploadMediaItem = {
  id: string
  file?: File
  previewUrl?: string
  name?: string
  size?: number
  type?: string
  lastModified?: number
}

type UploadMediaState = {
  coverImage: UploadMediaItem | null
  additionalImages: UploadMediaItem[]
  momentVideo: UploadMediaItem | null
}

type UploadDimensions = {
  height: string
  width: string
  depth: string
  unit: 'in' | 'cm'
}

type UploadWeight = {
  value: string
  unit: 'lbs' | 'kg'
}

type UploadDetailsState = {
  title: string
  description: string
  year: string
  editionRun: string
  dimensions: UploadDimensions
  weight: UploadWeight
  materials: string
  locationId: string
  locationDraft: UploadLocationDraft
  customTags: string[]
  customTagInput: string
  deliveryNote: string
}

type UploadListingStatus = 'sale' | 'inquire' | 'sold'

type UploadListingState = {
  status: UploadListingStatus
  price: string
  quantity: string
  allowOffers: boolean
  hidePricePublic: boolean
}

type UploadTrivia = {
  id: string
  question: string
  answer: string
}

type UploadLocationDraft = {
  name: string
  address1: string
  address2: string
  city: string
  state: string
  country: string
  postalCode: string
}

type UploadLocation = UploadLocationDraft & {
  id: string
}

type UploadTagGroup = 'vibes' | 'values' | 'mediums'

type UploadTags = {
  vibes: string[]
  values: string[]
  mediums: string[]
}

type UploadMomentStory = {
  caption: string
  type: string
}

type UploadStoryState = {
  tags: UploadTags
  trivia: UploadTrivia[]
  moment: UploadMomentStory
}

export type {
  UploadStep,
  UploadMediaItem,
  UploadMediaState,
  UploadDimensions,
  UploadWeight,
  UploadDetailsState,
  UploadLocationDraft,
  UploadLocation,
  UploadListingStatus,
  UploadListingState,
  UploadTrivia,
  UploadTagGroup,
  UploadTags,
  UploadMomentStory,
  UploadStoryState,
}
