import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from 'react'

import {
  AlertCircle,
  CheckCircle2,
  Film,
  ImageIcon,
  RefreshCw,
  UploadCloud,
} from 'lucide-react'

import type { CreateMomentInput } from '@shared/apis/profileApis'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Progress } from '@shared/components/ui/progress'
import { Switch } from '@shared/components/ui/switch'
import { Textarea } from '@shared/components/ui/textarea'
import { cn } from '@shared/lib/utils'
import {
  PROFILE_MOMENT_ACCEPT,
  formatProfileMediaSize,
  useProfileMomentUpload,
} from '@domains/profile/hooks/useProfileMomentUpload'

export type MomentDeviceUploadComposerProps = {
  open: boolean
  submitting: boolean
  errorMessage?: string | null
  onOpenChange: (open: boolean) => void
  onPublish: (input: CreateMomentInput) => Promise<void> | void
}

const emptyMetadata = {
  caption: '',
  location: '',
  hashtags: '',
  isPinned: false,
}

const parseHashtags = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith('#') ? item.slice(1) : item))

export const MomentDeviceUploadComposer = ({
  open,
  submitting,
  errorMessage,
  onOpenChange,
  onPublish,
}: MomentDeviceUploadComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { state, mediaId, isUploading, canPublish, selectFile, retryUpload, resetUpload } =
    useProfileMomentUpload()
  const [caption, setCaption] = useState(emptyMetadata.caption)
  const [location, setLocation] = useState(emptyMetadata.location)
  const [hashtags, setHashtags] = useState(emptyMetadata.hashtags)
  const [isPinned, setIsPinned] = useState(emptyMetadata.isPinned)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (open) {
      return
    }

    resetUpload()
    setCaption(emptyMetadata.caption)
    setLocation(emptyMetadata.location)
    setHashtags(emptyMetadata.hashtags)
    setIsPinned(emptyMetadata.isPinned)
    setIsDragging(false)
  }, [open, resetUpload])

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleSelectedFile = (file?: File) => {
    if (!file) {
      return
    }

    void selectFile(file)
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSelectedFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleSelectedFile(event.dataTransfer.files?.[0])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!mediaId || !canPublish || submitting) {
      return
    }

    await onPublish({
      mediaId,
      caption: caption.trim() || undefined,
      location: location.trim() || undefined,
      hashtags: parseHashtags(hashtags),
      isPinned,
      durationSeconds: state.uploadedMedia?.durationSeconds ?? state.durationSeconds,
    })
  }

  const isVideoPreview = state.file?.type.startsWith('video/')
  const showProgress = state.status === 'uploading' || state.status === 'replacing'
  const showFailure = state.status === 'upload-failed' || state.status === 'validation-error'
  const statusLabel =
    state.status === 'uploaded'
      ? 'Upload complete'
      : state.status === 'replacing'
        ? 'Replacing media'
        : showFailure
          ? 'Upload failed'
          : 'Uploading media'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="4xl"
        className="max-h-[92vh] w-[95vw] overflow-hidden rounded-3xl bg-white p-0"
      >
        <form onSubmit={handleSubmit} className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex min-h-[520px] flex-col gap-6 bg-slate-50 px-6 py-8">
            <div className="space-y-2">
              <DialogTitle className="text-left text-2xl font-semibold text-slate-950">
                New moment
              </DialogTitle>
              <DialogDescription className="max-h-none px-0 text-left text-sm text-slate-600">
                Upload one image or one video, then add any details you want before publishing.
              </DialogDescription>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={PROFILE_MOMENT_ACCEPT}
              className="sr-only"
              onChange={handleFileInputChange}
            />

            <div
              className={cn(
                'flex flex-1 flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-6 transition',
                isDragging && 'border-slate-900 bg-slate-100',
              )}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {state.previewUrl ? (
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                    {isVideoPreview ? (
                      <video
                        src={state.previewUrl}
                        className="h-72 w-full object-contain"
                        controls
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={state.previewUrl}
                        alt="Selected moment preview"
                        className="h-72 w-full object-contain"
                      />
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          state.status === 'uploaded'
                            ? 'bg-emerald-50 text-emerald-600'
                            : showFailure
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {state.status === 'uploaded' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : showFailure ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : isVideoPreview ? (
                          <Film className="h-5 w-5" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{statusLabel}</p>
                            <p className="truncate text-xs text-slate-500">
                              {state.file?.name}
                              {state.file ? ` · ${formatProfileMediaSize(state.file.size)}` : ''}
                            </p>
                          </div>
                          {showProgress ? (
                            <span className="text-xs font-semibold text-slate-500">
                              {Math.round(state.progress)}%
                            </span>
                          ) : null}
                        </div>

                        {showProgress ? <Progress value={state.progress} className="h-2" /> : null}

                        {state.errorMessage ? (
                          <p className="text-sm text-rose-600">{state.errorMessage}</p>
                        ) : null}

                        <div className="flex flex-wrap gap-2 pt-1">
                          {showFailure ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void retryUpload()}
                            >
                              <RefreshCw className="h-4 w-4" />
                              Retry upload
                            </Button>
                          ) : null}
                          {state.status === 'uploaded' || showFailure ? (
                            <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
                              <UploadCloud className="h-4 w-4" />
                              Replace file
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-950">Drop one image or video</p>
                    <p className="text-sm text-slate-600">
                      Choose a file from your device to start uploading now.
                    </p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG, WEBP, GIF up to 10 MB, or MP4, WEBM up to 100 MB and 60 seconds.
                    </p>
                  </div>
                  <Button type="button" onClick={openFilePicker}>
                    <UploadCloud className="h-4 w-4" />
                    Choose file
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-5 px-6 py-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="moment-caption">
                Caption
              </label>
              <Textarea
                id="moment-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Share the story behind the piece..."
                className="min-h-32 rounded-2xl bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="moment-location">
                Location
              </label>
              <Input
                id="moment-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, Country"
                className="h-11 rounded-full bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="moment-hashtags">
                Hashtags
              </label>
              <Input
                id="moment-hashtags"
                value={hashtags}
                onChange={(event) => setHashtags(event.target.value)}
                placeholder="studio, oil, sketch"
                className="h-11 rounded-full bg-white"
              />
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Pin to profile
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canPublish || isUploading || submitting} loading={submitting}>
                Publish moment
              </Button>
            </div>
          </section>
        </form>
      </DialogContent>
    </Dialog>
  )
}
