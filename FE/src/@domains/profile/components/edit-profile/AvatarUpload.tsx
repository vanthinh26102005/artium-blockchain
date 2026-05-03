// react
import { ChangeEvent, RefObject } from 'react'

// next
import Image from 'next/image'

// third-party
import { Upload, X } from 'lucide-react'

type AvatarUploadProps = {
  avatarSrc: string
  inputRef: RefObject<HTMLInputElement | null>
  onPick: () => void
  onRemove: () => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  showError: boolean
  error?: string
}

/**
 * AvatarUpload - React component
 * @returns React element
 */
export const AvatarUpload = ({
  avatarSrc,
  inputRef,
  onPick,
  onRemove,
  onChange,
  showError,
  error,
}: AvatarUploadProps) => {
  const hasAvatar = Boolean(avatarSrc)

  return (
    /**
     * hasAvatar - Utility function
     * @returns void
     */
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Profile Picture
      </label>
      <div className="mt-3">
        <div className="relative h-40 w-40">
          <button
            type="button"
            onClick={onPick}
            className="group relative h-full w-full overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition hover:shadow-md"
            aria-label="Upload profile picture"
          >
            {hasAvatar ? (
              <Image
                src={avatarSrc}
                alt="Profile"
                fill
                sizes="160px"
                className="object-cover"
                unoptimized={avatarSrc.startsWith('blob:')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                <Upload className="h-6 w-6" />
              </div>
            )}
          </button>
          {hasAvatar ? (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              aria-label="Remove profile picture"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        {showError && error ? <p className="mt-2 text-xs text-rose-500">{error}</p> : null}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
    </div>
  )
}
