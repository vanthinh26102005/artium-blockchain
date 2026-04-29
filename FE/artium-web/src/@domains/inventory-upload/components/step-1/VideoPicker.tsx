// react
import { useState } from 'react'

// third-party
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'
import { Textarea } from '@shared/components/ui/textarea'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - inventory upload
import { DropzoneBase } from '@domains/inventory-upload/components/shared/DropzoneBase'
import { MediaPreviewCard } from '@domains/inventory-upload/components/shared/MediaPreviewCard'

type VideoPickerProps = {
  video?: {
    previewUrl?: string
    name?: string
    size?: number
    type?: string
  }
  error?: string
  accept: string
  maxSizeLabel: string
  disabled?: boolean
  title?: string
  description?: string
  helperText?: string
  variant?: 'card' | 'inline'
  mode?: 'default' | 'moments'
  containerClassName?: string
  dropzoneClassName?: string
  caption?: string
  videoType?: string
  onCaptionChange?: (value: string) => void
  onVideoTypeChange?: (value: string) => void
  onSelect: (file: File) => void
  onRemove: () => void
}

export const VideoPicker = ({
  video,
  error,
  accept,
  maxSizeLabel,
  disabled = false,
  title = 'Moment video',
  description = 'Add a short behind-the-scenes clip.',
  helperText,
  variant,
  mode = 'default',
  containerClassName,
  dropzoneClassName,
  caption,
  videoType,
  onCaptionChange,
  onVideoTypeChange,
  onSelect,
  onRemove,
}: VideoPickerProps) => {
  const isMoments = mode === 'moments'
  const titleLabelClassName =
    'text-[13px] font-extrabold uppercase tracking-[0.05em] text-black/50 lg:text-[17px]'
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)
  const [localCaption, setLocalCaption] = useState('')
  const [localVideoType, setLocalVideoType] = useState('')
  const videoTypePlaceholderValue = '__placeholder__'
  const videoTypePlaceholderLabel = 'Select a video type from the dropdown'
  const videoTypeOptions = [
    'Behind-the-Scenes / Making of',
    'Artist Annotations / Storyline',
    'Thoughts behind the Piece / Inspirations',
    'Installation/Exhibitions / Out in the Wild',
    'Testimony / Review',
  ]

  const currentCaption = caption ?? localCaption
  const currentVideoType = videoType ?? localVideoType

  const handleCaptionChange = (value: string) => {
    if (onCaptionChange) {
      onCaptionChange(value)
      return
    }
    setLocalCaption(value)
  }

  const handleVideoTypeChange = (value: string) => {
    if (onVideoTypeChange) {
      onVideoTypeChange(value)
      return
    }
    setLocalVideoType(value)
  }

  const handleSelectFile = (file: File) => {
    onSelect(file)
    if (isMoments) {
      setIsEditOpen(true)
    }
  }

  const handleRemove = () => {
    onRemove()
    handleCaptionChange('')
    handleVideoTypeChange('')
    setIsEditOpen(false)
  }

  const handleEditOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setIsEditOpen(true)
      return
    }
    setIsDiscardOpen(true)
  }

  const handleDiscardVideo = () => {
    setIsDiscardOpen(false)
    handleRemove()
  }

  return (
    <>
      <DropzoneBase
        title={title}
        description={isMoments ? undefined : description}
        helperText={
          isMoments
            ? undefined
            : (helperText ??
              (disabled
                ? 'Video uploads are available in Step 2.'
                : `Supported MP4, MOV, WEBM. ${maxSizeLabel}`))
        }
        accept={accept}
        multiple={false}
        disabled={disabled}
        variant={isMoments ? 'inline' : variant}
        hideHeader={isMoments}
        containerClassName={containerClassName}
        dropzoneClassName={cn(
          isMoments &&
          'min-h-[320px] items-stretch justify-start rounded-4xl border-black/20 bg-white px-0 py-0 text-left lg:min-h-[420px]',
          isMoments && 'border-dashed',
          isMoments && '!mt-0',
          isMoments && '!text-[#191414]',
          isMoments && '!items-stretch !justify-start !text-left',
          dropzoneClassName,
        )}
        renderDropzoneContent={
          isMoments
            ? (inputId) => {
              if (!video?.previewUrl) {
                return (
                  <div className="flex h-full w-full flex-col">
                    <div className="px-6 pt-6">
                      <p className={titleLabelClassName}>Artwork moments</p>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
                      <img
                        src="/images/upload-inventory/upload-and-drag.svg"
                        alt=""
                        className="mt-3 h-24 w-24 lg:h-30 lg:w-30 2xl:h-40 2xl:w-40"
                      />
                      <p className="mt-6 text-[18px] font-semibold text-[#191414] lg:text-[20px]">
                        {description ?? 'Upload moments of your artwork'}
                      </p>
                      <p className="mt-4 text-sm text-[#898788]">
                        Supported formats: MOV, MP4, QT. Maximum file duration: 60 seconds.
                      </p>
                      <p className="text-sm text-[#898788]">Maximum file size: {maxSizeLabel}</p>
                      <p className="mt-3 text-sm text-[#898788]">
                        View our{' '}
                        <a href="#" className="font-semibold text-[#0F6BFF] underline">
                          Share and Engage with Moments Guidelines
                        </a>{' '}
                        for more details.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-6 rounded-full px-6 text-[13px] font-semibold"
                      >
                        <label htmlFor={inputId} onClick={(event) => event.stopPropagation()}>
                          Upload moments
                        </label>
                      </Button>
                    </div>
                  </div>
                )
              }

              return (
                <div className="flex h-full w-full flex-col">
                  <div className="px-6 pt-6">
                    <p className={titleLabelClassName}>Artwork moments</p>
                  </div>
                  <div className="flex flex-1 flex-wrap items-start gap-6 px-6 py-6">
                    <div
                      className="relative h-[240px] w-[180px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <video
                        src={video.previewUrl}
                        className="h-full w-full object-cover"
                        controls
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setIsEditOpen(true)
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black/70 shadow-sm transition hover:text-black"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleRemove()
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black/70 shadow-sm transition hover:text-black"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <label
                      htmlFor={inputId}
                      onClick={(event) => event.stopPropagation()}
                      className="flex h-[240px] w-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 bg-white text-[15px] font-semibold text-[#191414]"
                    >
                      <span className="text-2xl font-semibold">+</span>
                      Add another video
                    </label>
                  </div>
                  <div className="mt-auto border-t border-black/10 bg-[#F5F5F5] px-6 py-3 text-sm text-[#898788]">
                    Drag and drop videos to change the order of your artwork videos
                  </div>
                </div>
              )
            }
            : undefined
        }
        error={error}
        onFiles={(files) => {
          if (files[0]) {
            handleSelectFile(files[0])
          }
        }}
      >
        {video?.previewUrl ? (
          isMoments ? null : (
            <MediaPreviewCard
              previewUrl={video.previewUrl}
              name={video.name}
              size={video.size}
              type={video.type}
              variant="video"
              onRemove={handleRemove}
            />
          )
        ) : isMoments ? null : (
          <p className="text-[15px] text-[#898788]">
            Optional: share a quick story about this work.
          </p>
        )}
      </DropzoneBase>

      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
          <div className="border-b border-black/10 px-8 py-6">
            <h2 className="text-[22px] font-bold text-[#191414]">Edit Video</h2>
          </div>
          <div className="grid gap-6 px-8 pt-6 pb-8 lg:grid-cols-[280px_1fr]">
            <div className="rounded-3xl border border-black/10 bg-white p-4">
              <p className="text-[12px] font-semibold tracking-[0.2em] text-black/50 uppercase">
                Preview
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black">
                {video?.previewUrl ? (
                  <video
                    src={video.previewUrl}
                    className="h-[360px] w-full object-cover"
                    controls
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center text-sm text-white/70">
                    No preview
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-black/10 bg-white p-4">
                <p className="text-[12px] font-semibold tracking-[0.2em] text-[#0F6BFF] uppercase">
                  Caption <span className="text-emerald-500">*</span>
                </p>
                <Textarea
                  value={currentCaption}
                  maxLength={120}
                  onChange={(event) => handleCaptionChange(event.target.value)}
                  placeholder="Tell the audience a little more about this video"
                  className="mt-3 min-h-[140px] text-[15px]"
                />
                <p className="mt-2 text-right text-[11px] tracking-[0.2em] text-black/30 uppercase">
                  {currentCaption.length}/120 characters
                </p>
              </div>
              <div className="rounded-3xl border border-black/10 bg-white p-4">
                <p className="text-[12px] font-semibold tracking-[0.2em] text-black/50 uppercase">
                  Video type
                </p>
                <Select
                  value={currentVideoType || videoTypePlaceholderValue}
                  onValueChange={(value) =>
                    handleVideoTypeChange(value === videoTypePlaceholderValue ? '' : value)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      'mt-3 h-14 rounded-[18px] border-black/10 px-5 text-[16px] !text-[#191414] data-[placeholder]:text-[#9A9A9A]',
                      !currentVideoType && '!text-[#9A9A9A]',
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[220] rounded-[18px] border border-black/10 bg-white p-0 text-[#191414] shadow-[0_16px_40px_rgba(0,0,0,0.08)] [&_[data-radix-select-viewport]]:h-auto [&_[data-radix-select-viewport]]:max-h-[320px] [&_[data-radix-select-viewport]]:overflow-y-auto [&_[data-radix-select-viewport]]:p-0">
                    <SelectItem
                      value={videoTypePlaceholderValue}
                      className="rounded-none border-b border-black/10 px-5 py-4 text-[16px] !text-[#9A9A9A] focus:bg-[#F5F5F5] focus:!text-[#9A9A9A] data-[state=checked]:!text-[#9A9A9A] [&>span:first-child]:hidden"
                    >
                      {videoTypePlaceholderLabel}
                    </SelectItem>
                    {videoTypeOptions.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="rounded-none border-b border-black/10 px-5 py-4 text-[16px] last:border-b-0 focus:bg-[#F5F5F5] focus:!text-[#191414] data-[state=checked]:!text-[#191414] [&>span:first-child]:hidden"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="h-[44px] rounded-full border border-emerald-200 bg-emerald-100 px-10 text-[14px] font-semibold text-emerald-700 hover:bg-emerald-200"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDiscardOpen} onOpenChange={setIsDiscardOpen}>
        <DialogContent size="2xl" className="overflow-hidden rounded-4xl bg-white p-0">
          <div className="px-8 py-6">
            <h2 className="text-[20px] font-bold text-[#191414] uppercase">
              Are you sure you want to exit?
            </h2>
            <p className="mt-4 text-[16px] text-[#191414]">
              This video will be discarded and your information won&apos;t be saved.
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-black/10 text-[16px] font-semibold">
            <button
              type="button"
              onClick={() => setIsDiscardOpen(false)}
              className="px-6 py-5 text-center text-[#191414] transition hover:bg-black/5"
            >
              Take me back
            </button>
            <button
              type="button"
              onClick={handleDiscardVideo}
              className="border-l border-black/10 px-6 py-5 text-center text-red-500 transition hover:bg-red-50"
            >
              Yes, discard video
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
