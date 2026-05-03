// third-party
import { XMarkIcon } from '@heroicons/react/24/outline'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @shared - utils
import { cn } from '@shared/lib/utils'

type MediaPreviewCardProps = {
  previewUrl?: string
  name?: string
  size?: number
  type?: string
  variant?: 'image' | 'video'
  onRemove?: () => void
}

/**
 * formatBytes - Utility function
 * @returns void
 */
const formatBytes = (bytes?: number) => {
  if (!bytes) {
    return ''
  }
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  /**
   * units - Utility function
   * @returns void
   */
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

export const MediaPreviewCard = ({
  previewUrl,
  name,
  size,
  type,
  variant = 'image',
  /**
   * MediaPreviewCard - React component
   * @returns React element
   */
  onRemove,
}: MediaPreviewCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden bg-[#F5F5F5]',
          variant === 'video' ? 'aspect-video' : 'aspect-[4/3]',
        )}
      >
        {previewUrl ? (
          variant === 'video' ? (
            <video src={previewUrl} className="h-full w-full object-cover" controls />
          ) : (
            <img src={previewUrl} alt={name ?? 'Preview'} className="h-full w-full object-cover" />
          )
        ) : (
          <span className="text-xs text-[#898788]">No preview</span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 py-2">
        <p className="truncate text-sm font-semibold text-[#191414]">{name ?? 'Untitled'}</p>
        <p className="text-xs text-[#898788]">
          {[type, formatBytes(size)].filter(Boolean).join(' • ')}
        </p>
      </div>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
