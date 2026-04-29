// react
import React, { useRef, useState } from 'react'

// third-party
import { ChevronDownIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar'
import { Checkbox } from '@shared/components/ui/checkbox'
import { Input } from '@shared/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Textarea } from '@shared/components/ui/textarea'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@shared/components/ui/command'
import type { SellerProfilePayload } from '@shared/apis/profileApis'
import type { UserPayload } from '@shared/types/auth'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - inventory upload
import {
  UPLOAD_MEDIA_RULES,
  useUploadArtworkStore,
} from '@domains/inventory-upload/stores/useUploadArtworkStore'
import {
  getUploadArtistInitials,
  resolveUploadArtistAvatarUrl,
  resolveUploadArtistName,
} from '@domains/inventory-upload/utils/artistIdentity'

type Step1LayoutProps = {
  className?: string
  currentUser?: UserPayload | null
  sellerProfile?: SellerProfilePayload | null
}

type Step1ColumnProps = {
  className?: string
  currentUser?: UserPayload | null
  sellerProfile?: SellerProfilePayload | null
}

const Step1LeftColumn = ({ className, currentUser, sellerProfile }: Step1ColumnProps) => {
  // -- state --
  const media = useUploadArtworkStore((state) => state.media)
  const errors = useUploadArtworkStore((state) => state.errors)
  const setCoverImage = useUploadArtworkStore((state) => state.setCoverImage)
  const addImages = useUploadArtworkStore((state) => state.addAdditionalImages)
  const removeImage = useUploadArtworkStore((state) => state.removeAdditionalImage)

  // -- refs --
  const coverInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)
  const emptyInputRef = useRef<HTMLInputElement>(null)

  // -- handlers --
  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCoverImage(file)
    }
    event.target.value = ''
  }

  const handleAdditionalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) {
      addImages(files)
    }
    event.target.value = ''
  }

  const handleEmptyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }
    const [coverFile, ...additionalFiles] = files
    if (coverFile) {
      setCoverImage(coverFile)
    }
    if (additionalFiles.length > 0) {
      addImages(additionalFiles)
    }
    event.target.value = ''
  }

  const handleEmptyKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      emptyInputRef.current?.click()
    }
  }

  const canAddMore = media.additionalImages.length < UPLOAD_MEDIA_RULES.MAX_ADDITIONAL_IMAGES
  const isEmptyState = !media.coverImage && media.additionalImages.length === 0
  const artistName = resolveUploadArtistName(currentUser, sellerProfile)
  const artistAvatarUrl = resolveUploadArtistAvatarUrl(currentUser, sellerProfile)
  const artistInitials = getUploadArtistInitials(artistName)
  const artistSourceLabel = sellerProfile ? 'Seller profile' : 'Account'

  return (
    <div className={cn('space-y-4 lg:space-y-8', className)}>
      <div className="rounded-3xl border border-black/10 bg-white p-4 lg:p-6">
        <p className="text-[12px] font-extrabold tracking-[0.05em] text-black/50 uppercase lg:text-[13px]">
          Artist name <span className="text-red-500">*</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-10 w-10 border border-black/10 bg-[#F5F5F5]">
              {artistAvatarUrl ? (
                <AvatarImage src={artistAvatarUrl} alt={artistName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-[#F5F5F5] text-sm font-semibold text-[#191414]">
                {artistInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#191414] lg:text-base">
                {artistName}
              </p>
              <p className="truncate text-sm text-[#898788]">
                {currentUser?.email ?? 'Signed-in account'}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold text-black/50">
            {artistSourceLabel}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-4 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-extrabold tracking-[0.05em] text-black/50 uppercase lg:text-[13px]">
            Artwork images <span className="text-red-500">*</span>
          </p>
          <span className="text-sm text-[#898788]">Upload up to 5 images.</span>
        </div>
        {isEmptyState ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => emptyInputRef.current?.click()}
            onKeyDown={handleEmptyKeyDown}
            className="mt-4 rounded-3xl border border-dashed border-black/10 bg-white p-6 text-center lg:p-10"
          >
            <div className="mx-auto flex min-h-[320px] max-w-[460px] flex-col items-center justify-center">
              <img
                src="/images/upload-inventory/upload-and-drag.svg"
                alt=""
                className="h-24 w-24 lg:h-40 lg:w-40 2xl:h-50 2xl:w-50"
              />
              <p className="mt-6 text-[18px] font-semibold text-[#191414] lg:text-[20px]">
                Drag images of your artwork here,
                <br />
                or upload from your device
              </p>
              <p className="mt-4 text-sm text-[#898788]">
                Supported formats: GIF, PNG, JPG, JPEG, HEIC.
              </p>
              <p className="text-sm text-[#898788]">
                Maximum file size: {UPLOAD_MEDIA_RULES.MAX_IMAGE_SIZE_MB}MB
              </p>
              <p className="mt-3 text-sm text-[#898788]">
                View our{' '}
                <a href="#" className="font-semibold text-[#0F6BFF] underline">
                  Uploading Guidelines
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-[#0F6BFF] underline">
                  Shipping Guidelines
                </a>{' '}
                for more details.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  emptyInputRef.current?.click()
                }}
                className="mt-6 rounded-full px-6 text-[13px] font-semibold"
              >
                Upload Images
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-black/10 bg-[#FDFDFD] p-4 lg:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className={cn(
                  'relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#F5F5F5]',
                  media.coverImage ? 'border-solid' : 'border-dashed',
                )}
              >
                {media.coverImage?.previewUrl ? (
                  <img
                    src={media.coverImage.previewUrl}
                    alt={media.coverImage.name ?? 'Cover image'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-[#191414] lg:text-base">
                    Main image
                  </span>
                )}
                <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-black/60 uppercase">
                  Main image
                </span>
                {media.coverImage ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setCoverImage(null)
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black/60 shadow-sm transition hover:text-black"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </button>
              {media.additionalImages.map((image) => (
                <div
                  key={image.id}
                  className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#F5F5F5]"
                >
                  {image.previewUrl ? (
                    <img
                      src={image.previewUrl}
                      alt={image.name ?? 'Artwork image'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-[#898788]">Preview</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black/60 shadow-sm transition hover:text-black"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {canAddMore ? (
                <button
                  type="button"
                  onClick={() => additionalInputRef.current?.click()}
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white text-sm font-semibold text-[#191414]"
                >
                  <span className="text-lg font-semibold">+</span>
                  Add image
                </button>
              ) : null}
            </div>
          </div>
        )}
        {errors['media.coverImage'] ? (
          <p className="mt-3 text-sm text-red-600">{errors['media.coverImage']}</p>
        ) : null}
        {errors['media.additionalImages'] ? (
          <p className="mt-2 text-sm text-red-600">{errors['media.additionalImages']}</p>
        ) : null}
        <p className="mt-3 text-sm text-[#898788]">
          Additional images will maintain their original aspect ratio.
        </p>
        <input
          ref={emptyInputRef}
          type="file"
          accept={UPLOAD_MEDIA_RULES.IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={handleEmptyChange}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept={UPLOAD_MEDIA_RULES.IMAGE_ACCEPT}
          className="hidden"
          onChange={handleCoverChange}
        />
        <input
          ref={additionalInputRef}
          type="file"
          accept={UPLOAD_MEDIA_RULES.IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={handleAdditionalChange}
        />
      </div>
    </div>
  )
}

const Step1RightColumn = ({ className }: Step1ColumnProps) => {
  // -- state --
  const details = useUploadArtworkStore((state) => state.details)
  const listing = useUploadArtworkStore((state) => state.listing)
  const locations = useUploadArtworkStore((state) => state.locations)
  const errors = useUploadArtworkStore((state) => state.errors)
  const setField = useUploadArtworkStore((state) => state.setField)
  const addLocation = useUploadArtworkStore((state) => state.addLocation)
  const clearLocationDraft = useUploadArtworkStore((state) => state.clearLocationDraft)
  const addCustomTag = useUploadArtworkStore((state) => state.addCustomTag)
  const removeCustomTag = useUploadArtworkStore((state) => state.removeCustomTag)
  const clearCustomTags = useUploadArtworkStore((state) => state.clearCustomTags)
  const [locationSearch, setLocationSearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isTagOpen, setIsTagOpen] = useState(false)
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false)
  const [isTagFormOpen, setIsTagFormOpen] = useState(false)
  const locationNameRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const inputBaseClassName = 'h-[52px] text-[15px] lg:h-14 lg:text-[16px]'
  const textareaBaseClassName = 'min-h-[140px] text-[15px] lg:min-h-[160px] lg:text-[16px]'
  const labelClassName =
    'text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50 lg:text-[12px] rounded-2xl!'
  const sectionTitleClassName =
    'text-[13px] font-extrabold uppercase tracking-[0.05em] text-black/50 lg:text-[17px]'
  const selectedLocation = locations.find((location) => location.id === details.locationId)
  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(locationSearch.toLowerCase()),
  )
  const locationDraft = {
    name: details.locationDraft?.name ?? '',
    address1: details.locationDraft?.address1 ?? '',
    address2: details.locationDraft?.address2 ?? '',
    city: details.locationDraft?.city ?? '',
    state: details.locationDraft?.state ?? '',
    country: details.locationDraft?.country ?? '',
    postalCode: details.locationDraft?.postalCode ?? '',
  }
  const customTags = details.customTags ?? []
  const customTagInput = details.customTagInput ?? ''
  const shouldShowLocationForm = isLocationFormOpen
  const shouldShowTagForm = isTagFormOpen
  const filteredTags = customTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase()),
  )

  return (
    <div className={cn('mt-4 space-y-4 lg:space-y-8', className)}>
      <div className="rounded-4xl border border-black/10 bg-white p-4 lg:p-6">
        <p className={sectionTitleClassName}>Artwork details</p>
        <div className="mt-4 space-y-4 lg:space-y-6">
          <div>
            <label className={labelClassName}>
              Artwork title <span className="text-red-500">*</span>
            </label>
            <Input
              value={details.title}
              onChange={(event) => setField('details.title', event.target.value)}
              placeholder="Enter a title"
              className={cn('mt-2', inputBaseClassName)}
            />
            {errors['details.title'] ? (
              <p className="mt-2 text-sm text-red-600">{errors['details.title']}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClassName}>Description</label>
            <Textarea
              value={details.description}
              onChange={(event) => setField('details.description', event.target.value)}
              placeholder="Share a brief description"
              className={cn('mt-2', textareaBaseClassName)}
            />
            <p className="mt-1 text-right text-[11px] tracking-[0.2em] text-black/30 uppercase">
              {details.description.length}/5000 characters
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClassName}>
                Year <span className="text-red-500">*</span>
              </label>
              <Input
                value={details.year}
                onChange={(event) => setField('details.year', event.target.value)}
                placeholder="2024"
                className={cn('mt-2', inputBaseClassName)}
              />
              {errors['details.year'] ? (
                <p className="mt-2 text-sm text-red-600">{errors['details.year']}</p>
              ) : null}
            </div>
            <div>
              <label className={labelClassName}>Total edition run</label>
              <Input
                value={details.editionRun}
                onChange={(event) => setField('details.editionRun', event.target.value)}
                placeholder="1 of 12"
                className={cn('mt-2', inputBaseClassName)}
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <label className={labelClassName}>
                Dimensions <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex items-center gap-3 text-sm">
                {['in', 'cm'].map((unit) => (
                  <Button
                    key={unit}
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setField('details.dimensions.unit', unit)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase',
                      details.dimensions.unit === unit
                        ? 'border-[#0F6BFF] text-[#0F6BFF]'
                        : 'border-black/10 text-black/60',
                    )}
                  >
                    {unit}
                  </Button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
                <Input
                  value={details.dimensions.height}
                  onChange={(event) => setField('details.dimensions.height', event.target.value)}
                  placeholder="Height"
                  className={inputBaseClassName}
                />
                <span className="text-xs text-black/40">x</span>
                <Input
                  value={details.dimensions.width}
                  onChange={(event) => setField('details.dimensions.width', event.target.value)}
                  placeholder="Width"
                  className={inputBaseClassName}
                />
                <span className="text-xs text-black/40">x</span>
                <Input
                  value={details.dimensions.depth}
                  onChange={(event) => setField('details.dimensions.depth', event.target.value)}
                  placeholder="Depth"
                  className={inputBaseClassName}
                />
              </div>
              {errors['details.dimensions.height'] ||
                errors['details.dimensions.width'] ||
                errors['details.dimensions.depth'] ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors['details.dimensions.height'] ||
                    errors['details.dimensions.width'] ||
                    errors['details.dimensions.depth']}
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelClassName}>Weight</label>
              <div className="mt-2 flex items-center gap-3 text-sm">
                {['lbs', 'kg'].map((unit) => (
                  <Button
                    key={unit}
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setField('details.weight.unit', unit)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase',
                      details.weight.unit === unit
                        ? 'border-[#0F6BFF] text-[#0F6BFF]'
                        : 'border-black/10 text-black/60',
                    )}
                  >
                    {unit}
                  </Button>
                ))}
              </div>
              <Input
                value={details.weight.value}
                onChange={(event) => setField('details.weight.value', event.target.value)}
                placeholder={`Weight (${details.weight.unit})`}
                className={cn('mt-3', inputBaseClassName)}
              />
              {errors['details.weight.value'] ? (
                <p className="mt-2 text-sm text-red-600">{errors['details.weight.value']}</p>
              ) : null}
            </div>
          </div>
          <div>
            <label className={labelClassName}>Materials</label>
            <Input
              value={details.materials}
              onChange={(event) => setField('details.materials', event.target.value)}
              placeholder="Oil on canvas"
              className={cn('mt-2', inputBaseClassName)}
            />
          </div>
          <div>
            <label className={labelClassName}>Artwork location</label>
            <Popover
              open={isLocationOpen}
              onOpenChange={(nextOpen) => {
                setIsLocationOpen(nextOpen)
                if (!nextOpen) {
                  setLocationSearch('')
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'mt-2 flex h-14 w-full items-center justify-between rounded-[18px] border border-black/10 bg-white px-5 text-[16px] text-[#191414]',
                    !selectedLocation && 'text-[#9A9A9A]',
                  )}
                >
                  <span className="truncate">
                    {selectedLocation?.name ?? 'Select artwork location'}
                  </span>
                  <ChevronDownIcon className="h-5 w-5 text-black/40" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="z-[220] w-[360px] rounded-[18px] border border-black/10 bg-white p-0 text-[#191414] shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    value={locationSearch}
                    onValueChange={setLocationSearch}
                    placeholder="Search locations"
                    className="text-[15px] text-[#191414] placeholder:text-[#9A9A9A]"
                  />
                  <CommandList>
                    {filteredLocations.length > 0 ? (
                      <CommandGroup className="p-2">
                        {filteredLocations.map((location) => (
                          <CommandItem
                            key={location.id}
                            value={location.name}
                            onSelect={() => {
                              setField('details.locationId', location.id)
                              setLocationSearch('')
                              setIsLocationOpen(false)
                              setIsLocationFormOpen(false)
                            }}
                            className="cursor-pointer rounded-none px-4 py-3 text-[16px] text-[#191414] data-[selected='true']:bg-[#F5F5F5]"
                          >
                            {location.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <div className="px-4 py-5 text-center text-sm text-[#191414]">
                        No results found.
                      </div>
                    )}
                    <CommandSeparator className="my-1 bg-black/10" />
                    <CommandGroup className="p-2">
                      <CommandItem
                        value="add-location"
                        onSelect={() => {
                          setLocationSearch('')
                          setIsLocationOpen(false)
                          setIsLocationFormOpen(true)
                          locationNameRef.current?.focus()
                        }}
                        className="cursor-pointer gap-3 px-4 py-3 text-[16px] text-[#191414] data-[selected='true']:bg-[#F5F5F5]"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add new location
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {shouldShowLocationForm ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-black/20 bg-white p-4 lg:p-6">
            <p className={labelClassName}>
              Location name <span className="text-red-500">*</span>
            </p>
            <Input
              ref={locationNameRef}
              value={locationDraft.name}
              onChange={(event) => setField('details.locationDraft.name', event.target.value)}
              placeholder="e.g. Vietnam Gallery 1, My Home in KL, etc."
              className={cn('mt-2', inputBaseClassName)}
            />
            <p className={cn('mt-4', labelClassName)}>Address line 1</p>
            <Input
              value={locationDraft.address1}
              onChange={(event) => setField('details.locationDraft.address1', event.target.value)}
              placeholder="Start typing your address..."
              className={cn('mt-2', inputBaseClassName)}
            />
            <p className={cn('mt-4', labelClassName)}>Address line 2 (optional)</p>
            <Input
              value={locationDraft.address2}
              onChange={(event) => setField('details.locationDraft.address2', event.target.value)}
              placeholder="Apartment, suite, building number"
              className={cn('mt-2', inputBaseClassName)}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className={labelClassName}>City</p>
                <Input
                  value={locationDraft.city}
                  onChange={(event) => setField('details.locationDraft.city', event.target.value)}
                  placeholder="Enter City"
                  className={cn('mt-2', inputBaseClassName)}
                />
              </div>
              <div>
                <p className={labelClassName}>State / District / Province</p>
                <Input
                  value={locationDraft.state}
                  onChange={(event) => setField('details.locationDraft.state', event.target.value)}
                  placeholder="Enter State/Province/Region"
                  className={cn('mt-2', inputBaseClassName)}
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className={labelClassName}>Country</p>
                <Input
                  value={locationDraft.country}
                  onChange={(event) =>
                    setField('details.locationDraft.country', event.target.value)
                  }
                  placeholder="Enter Country"
                  className={cn('mt-2', inputBaseClassName)}
                />
              </div>
              <div>
                <p className={labelClassName}>Postal/Zip Code</p>
                <Input
                  value={locationDraft.postalCode}
                  onChange={(event) =>
                    setField('details.locationDraft.postalCode', event.target.value)
                  }
                  placeholder="Enter Postal Code/ZIP"
                  className={cn('mt-2', inputBaseClassName)}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearLocationDraft()
                  setIsLocationFormOpen(false)
                }}
                className="h-[44px] flex-1 rounded-full border-black/10 text-[14px] font-semibold text-[#191414]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!locationDraft.name.trim()) {
                    setIsLocationFormOpen(true)
                    return
                  }
                  addLocation()
                  setIsLocationFormOpen(false)
                }}
                className="h-[44px] flex-1 rounded-full bg-[#0F6BFF] text-[14px] font-semibold text-white hover:bg-[#0F6BFF]/90"
              >
                Save and add location
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-4xl border border-black/10 bg-white p-4 lg:p-6">
        <p className={sectionTitleClassName}>Listing information</p>
        <p className="mt-2 text-[15px] text-[#898788]">
          Choose whether to list this artwork&apos;s availability status for sale, allow for inquiry
          to purchase, or mark it as sold.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[
            { id: 'sale', label: 'For Sale' },
            { id: 'inquire', label: 'Inquire to Purchase' },
            { id: 'sold', label: 'Sold' },
          ].map((option) => {
            const isActive = listing.status === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setField('listing.status', option.id)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-[15px] font-semibold transition',
                  isActive
                    ? 'border-[#0F6BFF] text-[#0F6BFF]'
                    : 'border-black/10 text-black/60 hover:border-[#0F6BFF] hover:text-[#0F6BFF]',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    isActive ? 'border-[#0F6BFF]' : 'border-black/20 bg-white',
                  )}
                >
                  {isActive ? <span className="h-2 w-2 rounded-full bg-[#0F6BFF]" /> : null}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
        <div className="mt-4 rounded-2xl border border-black/10 bg-[#FDFDFD] p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClassName}>
                Artwork price <span className="text-red-500">*</span>
              </label>
              <Input
                value={listing.price}
                onChange={(event) => setField('listing.price', event.target.value)}
                placeholder="US$"
                className={cn('mt-2', inputBaseClassName)}
              />
              {errors['listing.price'] ? (
                <p className="mt-2 text-sm text-red-600">{errors['listing.price']}</p>
              ) : null}
            </div>
            <div>
              <label className={labelClassName}>
                Quantity available <span className="text-red-500">*</span>
              </label>
              <Input
                value={listing.quantity}
                onChange={(event) => setField('listing.quantity', event.target.value)}
                placeholder="1"
                className={cn('mt-2', inputBaseClassName)}
              />
              {errors['listing.quantity'] ? (
                <p className="mt-2 text-sm text-red-600">{errors['listing.quantity']}</p>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm text-[#898788]">
            For your reference only. Price and quantity will appear in your Inventory but won&apos;t
            be visible to buyers.
          </p>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 text-[15px] text-[#191414]">
              <Checkbox
                checked={listing.allowOffers}
                onCheckedChange={(checked) => setField('listing.allowOffers', Boolean(checked))}
              />
              <span>
                Allow offers
                <span className="mt-1 block text-sm text-[#898788]">
                  Buyers interested in your item can make you offers.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-[15px] text-[#191414]">
              <Checkbox
                checked={listing.hidePricePublic}
                onCheckedChange={(checked) => setField('listing.hidePricePublic', Boolean(checked))}
              />
              <span>
                Hide price from public view
                <span className="mt-1 block text-sm text-[#898788]">
                  Price remains visible to you until checkout.
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-black/10 bg-white p-4 lg:p-6">
        <p className={sectionTitleClassName}>Custom tag</p>
        <p className="mt-2 text-[15px] text-[#898788]">
          Add a personal status or note for this artwork. Tags don&apos;t affect checkout but help
          you organize and filter in Inventory.
        </p>
        <p className={cn('mt-4', labelClassName)}>Artwork tags</p>
        <Popover
          open={isTagOpen}
          onOpenChange={(nextOpen) => {
            setIsTagOpen(nextOpen)
            if (!nextOpen) {
              setTagSearch('')
            }
          }}
        >
          <PopoverTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              className="mt-3 flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-2 text-left"
            >
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {customTags.length > 0 ? (
                  customTags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[14px] font-semibold text-[#191414]"
                    >
                      {tag}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          removeCustomTag(tag)
                        }}
                        className="rounded-full p-0.5 text-black/40 transition hover:text-black"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-[15px] text-black/40">Add tags</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-black/40">
                {customTags.length > 0 ? (
                  <>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation()
                        clearCustomTags()
                      }}
                      className="rounded-full p-1 transition hover:text-black"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </span>
                    <span className="h-5 w-px bg-black/10" />
                  </>
                ) : null}
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="z-[220] w-[360px] rounded-[18px] border border-black/10 bg-white p-0 text-[#191414] shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
          >
            <Command shouldFilter={false}>
              <CommandInput
                value={tagSearch}
                onValueChange={setTagSearch}
                placeholder="Search tags"
                className="text-[15px] text-[#191414] placeholder:text-[#9A9A9A]"
              />
              <CommandList>
                {filteredTags.length > 0 ? (
                  <CommandGroup className="p-2">
                    {filteredTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => {
                          setTagSearch('')
                          setIsTagOpen(false)
                        }}
                        className="cursor-pointer rounded-none px-4 py-3 text-[16px] text-[#191414] data-[selected='true']:bg-[#F5F5F5]"
                      >
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <div className="px-4 py-5 text-center text-sm text-[#191414]">
                    No results found.
                  </div>
                )}
                <CommandSeparator className="my-1 bg-black/10" />
                <CommandGroup className="p-2">
                  <CommandItem
                    value="add-tag"
                    onSelect={() => {
                      setTagSearch('')
                      setIsTagOpen(false)
                      setIsTagFormOpen(true)
                      tagInputRef.current?.focus()
                    }}
                    className="cursor-pointer gap-3 px-4 py-3 text-[16px] text-[#191414] data-[selected='true']:bg-[#F5F5F5]"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add new tag
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {shouldShowTagForm ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-black/20 bg-white p-4 lg:p-6">
            <p className={labelClassName}>Tag name</p>
            <Input
              ref={tagInputRef}
              value={customTagInput}
              onChange={(event) => setField('details.customTagInput', event.target.value)}
              placeholder="e.g., Reserved, Consigned, On Loan"
              className={cn('mt-2', inputBaseClassName)}
            />
            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setField('details.customTagInput', '')
                  setIsTagFormOpen(false)
                }}
                className="h-[44px] flex-1 rounded-full border-black/10 text-[14px] font-semibold text-[#191414]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!customTagInput.trim()) {
                    setIsTagFormOpen(true)
                    return
                  }
                  addCustomTag(customTagInput)
                  setIsTagFormOpen(false)
                }}
                className="h-[44px] flex-1 rounded-full bg-[#0F6BFF] text-[14px] font-semibold text-white hover:bg-[#0F6BFF]/90"
              >
                Save and add tag
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-4xl border border-black/10 bg-white p-4 lg:p-6">
        <p className={sectionTitleClassName}>Custom delivery note</p>
        <p className="mt-2 text-[15px] text-[#898788]">
          Add a personal message to include with this artwork shipment. This note is for buyers and
          does not affect pricing or checkout.
        </p>
        <Textarea
          value={details.deliveryNote}
          onChange={(event) => setField('details.deliveryNote', event.target.value)}
          placeholder="Share a note..."
          className={cn('mt-4', textareaBaseClassName)}
        />
        <p className="mt-2 text-right text-[11px] tracking-[0.2em] text-black/30 uppercase">
          {details.deliveryNote.length}/5000 characters
        </p>
      </div>
    </div>
  )
}

export const Step1Layout = ({ className, currentUser, sellerProfile }: Step1LayoutProps) => {
  return (
    <section
      className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-8', className)}
    >
      <Step1LeftColumn
        className="lg:sticky lg:top-[96px] lg:self-start"
        currentUser={currentUser}
        sellerProfile={sellerProfile}
      />
      <Step1RightColumn className="lg:self-start" />
    </section>
  )
}

export { Step1LeftColumn, Step1RightColumn }
