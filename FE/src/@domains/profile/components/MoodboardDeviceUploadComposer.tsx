import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react'

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Film,
  ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
} from 'lucide-react'

import type { CreateMoodboardInput } from '@shared/apis/profileApis'
import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { Input } from '@shared/components/ui/input'
import { Progress } from '@shared/components/ui/progress'
import { Switch } from '@shared/components/ui/switch'
import { Textarea } from '@shared/components/ui/textarea'
import { cn } from '@shared/lib/utils'
import {
  PROFILE_MOODBOARD_ACCEPT,
  useProfileMoodboardUpload,
} from '@domains/profile/hooks/useProfileMoodboardUpload'
import { formatProfileMediaSize } from '@domains/profile/hooks/useProfileMomentUpload'
import type { ProfileMoodboardUploadItem } from '@domains/profile/hooks/useProfileMoodboardUpload'

export type MoodboardDeviceUploadComposerProps = {
  open: boolean
  submitting: boolean
  errorMessage?: string | null
  onOpenChange: (open: boolean) => void
  onCreate: (input: CreateMoodboardInput) => Promise<void> | void
}

/**
 * EMPTY_METADATA - React component
 * @returns React element
 */
const EMPTY_METADATA = {
  title: '',
  description: '',
  tags: '',
  isPrivate: false,
  isCollaborative: false,
}

const parseTags = (value: string) =>
  value
    .split(',')
/**
 * parseTags - Utility function
 * @returns void
 */
    .map((item) => item.trim())
    .filter(Boolean)

const getItemStatusLabel = (item: ProfileMoodboardUploadItem) => {
  if (item.status === 'uploaded') {
    return 'Media ready'
  }

  if (item.status === 'upload-failed' || item.status === 'validation-error') {
/**
 * getItemStatusLabel - Utility function
 * @returns void
 */
    return 'Some files need attention'
  }

  return 'Uploading media'
}

export const MoodboardDeviceUploadComposer = ({
  open,
  submitting,
  errorMessage,
  onOpenChange,
  onCreate,
}: MoodboardDeviceUploadComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const {
/**
 * MoodboardDeviceUploadComposer - React component
 * @returns React element
 */
    items,
    mediaIds,
    coverMediaId,
    coverItemId,
    isUploading,
    hasBlockingFailure,
    canCreate,
    queueErrorMessage,
    statusMessage,
    addFiles,
/**
 * fileInputRef - Utility function
 * @returns void
 */
    removeMedia,
    moveMedia,
    setCover,
    retryUpload,
  } = useProfileMoodboardUpload()
  const [title, setTitle] = useState(EMPTY_METADATA.title)
  const [description, setDescription] = useState(EMPTY_METADATA.description)
  const [tags, setTags] = useState(EMPTY_METADATA.tags)
  const [isPrivate, setIsPrivate] = useState(EMPTY_METADATA.isPrivate)
  const [isCollaborative, setIsCollaborative] = useState(EMPTY_METADATA.isCollaborative)
  const [isDragging, setIsDragging] = useState(false)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      void addFiles(event.target.files)
    }
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void addFiles(event.dataTransfer.files)
/**
 * openFilePicker - Utility function
 * @returns void
 */
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle || !coverMediaId || !canCreate || submitting) {
/**
 * handleFileInputChange - Utility function
 * @returns void
 */
      return
    }

    await onCreate({
      title: trimmedTitle,
      description: description.trim() || undefined,
      tags: parseTags(tags),
      isPrivate,
      isCollaborative,
      mediaIds,
/**
 * handleDrop - Utility function
 * @returns void
 */
      coverMediaId,
    })
  }

  const disableCreate =
    !title.trim() || !canCreate || isUploading || hasBlockingFailure || !coverMediaId || submitting
  const hasItems = items.length > 0

  return (
/**
 * handleSubmit - Utility function
 * @returns void
 */
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="5xl"
        className="max-h-[92vh] w-[95vw] overflow-hidden rounded-3xl bg-white p-0"
      >
        <form
/**
 * trimmedTitle - Utility function
 * @returns void
 */
          onSubmit={handleSubmit}
          className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]"
        >
          <section className="flex min-h-[560px] flex-col gap-6 bg-slate-50 px-6 py-8">
            <div className="space-y-2">
              <DialogTitle className="text-left text-2xl font-semibold text-slate-950">
                New moodboard
              </DialogTitle>
              <DialogDescription className="max-h-none px-0 text-left text-sm text-slate-600">
                Upload up to 10 images or videos, choose a cover, then add moodboard details.
              </DialogDescription>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={PROFILE_MOODBOARD_ACCEPT}
              className="sr-only"
/**
 * disableCreate - Utility function
 * @returns void
 */
              onChange={handleFileInputChange}
            />

            <div
              className={cn(
/**
 * hasItems - Utility function
 * @returns void
 */
                'rounded-3xl border border-dashed border-slate-300 bg-white p-5 transition',
                isDragging && 'border-blue-600 bg-blue-50',
              )}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {!hasItems ? (
                <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-950">Drop images or videos</p>
                    <p className="text-sm text-slate-600">
                      Choose up to 10 files from your device to start uploading.
                    </p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG, WEBP, GIF up to 10 MB, or MP4, WEBM up to 100 MB and 60 seconds each.
                    </p>
                  </div>
                  <Button type="button" onClick={openFilePicker}>
                    <UploadCloud className="h-4 w-4" />
                    Choose files
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {statusMessage ?? 'Media ready'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {items.length} selected media item{items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
                      <UploadCloud className="h-4 w-4" />
                      Add files
                    </Button>
                  </div>
                  {queueErrorMessage ? (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      {queueErrorMessage}
                    </p>
                  ) : null}
                  <p className="text-xs font-semibold text-slate-500">Drag to reorder</p>
                  <div className="grid gap-3">
                    {items.map((item, index) => (
                      <MoodboardQueueItem
                        key={item.localId}
                        item={item}
                        index={index}
                        isCover={coverItemId === item.localId}
                        canMoveUp={index > 0}
                        canMoveDown={index < items.length - 1}
                        onSetCover={setCover}
                        onRemove={removeMedia}
                        onRetry={retryUpload}
                        onMove={moveMedia}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-5 px-6 py-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="moodboard-title">
                Title
              </label>
              <Input
                id="moodboard-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Moodboard title"
                className="h-11 rounded-full bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="moodboard-description">
                Description
              </label>
              <Textarea
                id="moodboard-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the mood, references, or story..."
                className="min-h-32 rounded-2xl bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="moodboard-tags">
                Tags
              </label>
              <Input
                id="moodboard-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="minimal, sculptural, warm light"
                className="h-11 rounded-full bg-white"
              />
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <span>Private board</span>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <span>Allow collaborators</span>
              <Switch checked={isCollaborative} onCheckedChange={setIsCollaborative} />
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </p>
            ) : null}

            <p className="text-xs text-slate-500">
              {disableCreate
                ? 'Add a title, wait for media to finish uploading, and resolve any failed files before creating.'
                : 'Media ready'}
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={disableCreate} loading={submitting}>
                {submitting ? 'Creating...' : 'Create moodboard'}
              </Button>
            </div>
          </section>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type MoodboardQueueItemProps = {
  item: ProfileMoodboardUploadItem
  index: number
  isCover: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onSetCover: (localId: string) => void
  onRemove: (localId: string) => void
  onRetry: (localId: string) => void
  onMove: (localId: string, direction: 'up' | 'down') => void
}

const MoodboardQueueItem = ({
  item,
  index,
  isCover,
  canMoveUp,
  canMoveDown,
  onSetCover,
  onRemove,
  onRetry,
  onMove,
}: MoodboardQueueItemProps) => {
  const isUploaded = item.status === 'uploaded'
  const isFailure = item.status === 'upload-failed' || item.status === 'validation-error'
  const isVideo = item.file.type.startsWith('video/')
  const statusLabel = getItemStatusLabel(item)

  return (
    <div
      className={cn(
        'grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-2xl border bg-white p-3',
        isCover ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200',
      )}
    >
      <div className="relative h-[72px] w-[72px] overflow-hidden rounded-xl bg-slate-100">
        {isVideo ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
            <Film className="h-6 w-6" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-full w-full object-cover"
          />
        )}
/**
 * MoodboardQueueItem - React component
 * @returns React element
 */
        {isCover ? (
          <span className="absolute top-1 left-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            Cover
          </span>
        ) : null}
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{item.file.name}</p>
            <p className="text-xs text-slate-500">
              {isVideo ? 'Video' : 'Image'} · {formatProfileMediaSize(item.file.size)}
            </p>
          </div>
/**
 * isUploaded - Utility function
 * @returns void
 */
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold',
              isUploaded
/**
 * isFailure - Utility function
 * @returns void
 */
                ? 'bg-emerald-50 text-emerald-700'
                : isFailure
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600',
/**
 * isVideo - Utility function
 * @returns void
 */
            )}
          >
            {isUploaded ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
/**
 * statusLabel - Utility function
 * @returns void
 */
            ) : isFailure ? (
              <AlertCircle className="h-3.5 w-3.5" />
            ) : isVideo ? (
              <Film className="h-3.5 w-3.5" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            {statusLabel}
          </span>
        </div>

        {item.status === 'uploading' ? <Progress value={item.progress} className="h-2" /> : null}

        {item.errorMessage ? <p className="text-xs text-rose-600">{item.errorMessage}</p> : null}

        <div className="flex flex-wrap items-center gap-2">
          {isUploaded && !isCover ? (
            <Button type="button" variant="outline" size="xs" onClick={() => onSetCover(item.localId)}>
              Set as cover
            </Button>
          ) : null}
          {isFailure ? (
            <Button type="button" variant="outline" size="xs" onClick={() => onRetry(item.localId)}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry upload
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canMoveUp || item.status === 'uploading'}
            onClick={() => onMove(item.localId, 'up')}
            aria-label={`Move media ${index + 1} up`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canMoveDown || item.status === 'uploading'}
            onClick={() => onMove(item.localId, 'down')}
            aria-label={`Move media ${index + 1} down`}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onRemove(item.localId)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
