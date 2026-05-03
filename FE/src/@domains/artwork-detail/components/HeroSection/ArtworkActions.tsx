'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  LayoutGrid,
  Lock,
  Plus,
  Upload,
} from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Checkbox } from '@shared/components/ui/checkbox'
import {
  ArtworkMoodboardOption,
  ArtworkMoodboardToggleResult,
  useArtworkMoodboardSave,
} from '@domains/artwork-detail/hooks/useArtworkMoodboardSave'
import { CreateMoodboardModal } from './CreateMoodboardModal'

type ArtworkActionsProps = {
  likesCount: number
  isLiked?: boolean
  artworkId?: string
  artworkTitle?: string
  artworkPrice?: number
  artworkSellerId?: string
  artworkThumbnailUrl?: string
  onLike?: (liked: boolean) => void | Promise<void>
  onSave?: () => void
  onShare?: () => void
}

type ToastState = {
  message: string
  variant: 'success' | 'error'
}

/**
 * getMoodboardToastMessage - Utility function
 * @returns void
 */
const getMoodboardToastMessage = (result: ArtworkMoodboardToggleResult) => {
  switch (result) {
    case 'saved':
      return { message: 'Saved to moodboard', variant: 'success' as const, withSkeleton: true }
    case 'removed':
      return { message: 'Removed from moodboard', variant: 'success' as const, withSkeleton: false }
    case 'already-saved':
      return {
        message: 'Already saved to moodboard',
        variant: 'success' as const,
        withSkeleton: false,
      }
    case 'already-removed':
      return {
        message: 'Artwork was already removed from moodboard',
        variant: 'success' as const,
        withSkeleton: false,
      }
  }
}

export const ArtworkActions = ({
  likesCount,
  isLiked = false,
  /**
   * ArtworkActions - React component
   * @returns React element
   */
  onLike,
  onSave,
  onShare,
  artworkThumbnailUrl,
  artworkId,
  artworkTitle,
  artworkPrice,
  artworkSellerId,
}: ArtworkActionsProps) => {
  const [liked, setLiked] = useState(isLiked)
  const [currentLikes, setCurrentLikes] = useState(likesCount)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const {
    isAuthenticated,
    moodboards,
    isLoading: moodboardsLoading,
    errorMessage: moodboardError,
    pendingMoodboardIds,
    saved,
    toggleMoodboard,
    createMoodboardAndSave,
  } = useArtworkMoodboardSave({
    artworkId,
    artworkTitle,
    artworkPrice,
    artworkSellerId,
    artworkThumbnailUrl,
  })

  const [toastState, setToastState] = useState<ToastState | null>(null)
  const [toastLoading, setToastLoading] = useState(false)
  const [pendingToastMessage, setPendingToastMessage] = useState<string | null>(null)
  const toastSkeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastAutoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLiked(isLiked)
  }, [isLiked])
  /**
   * toastSkeletonTimer - Utility function
   * @returns void
   */

  useEffect(() => {
    setCurrentLikes(Math.max(0, likesCount))
  }, [likesCount])
  /**
   * toastAutoHideTimer - Utility function
   * @returns void
   */

  const clearToastTimers = () => {
    if (toastSkeletonTimer.current) {
      clearTimeout(toastSkeletonTimer.current)
      toastSkeletonTimer.current = null
    }
    if (toastAutoHideTimer.current) {
      clearTimeout(toastAutoHideTimer.current)
      toastAutoHideTimer.current = null
    }
  }

  const queueToast = (message: string, variant: 'success' | 'error', withSkeleton: boolean) => {
    /**
     * clearToastTimers - Utility function
     * @returns void
     */
    clearToastTimers()
    setToastState(null)
    setToastLoading(false)
    setPendingToastMessage(null)

    if (withSkeleton) {
      setToastLoading(true)
      setPendingToastMessage(message)

      toastSkeletonTimer.current = setTimeout(() => {
        setToastLoading(false)
        setPendingToastMessage(null)
        setToastState({ message, variant })
        toastAutoHideTimer.current = setTimeout(() => {
          /**
           * queueToast - Utility function
           * @returns void
           */
          setToastState(null)
        }, 3000)
      }, 700)

      return
    }

    setToastState({ message, variant })
    toastAutoHideTimer.current = setTimeout(() => {
      setToastState(null)
    }, 3000)
  }

  const closeToast = () => {
    setToastState(null)
    if (toastAutoHideTimer.current) {
      clearTimeout(toastAutoHideTimer.current)
      toastAutoHideTimer.current = null
    }
  }

  useEffect(
    () => () => {
      clearToastTimers()
    },
    [],
  )

  const handleLike = async () => {
    if (!isAuthenticated) {
      queueToast('Please sign in to like this artwork.', 'error', false)
      return
    }

    /**
     * closeToast - Utility function
     * @returns void
     */
    if (!onLike) {
      queueToast('Artwork likes are not available from the API yet.', 'error', false)
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setCurrentLikes((prev) => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)))

    try {
      await onLike(nextLiked)
    } catch {
      setLiked(!nextLiked)
      setCurrentLikes((prev) => (nextLiked ? Math.max(prev - 1, 0) : prev + 1))
      queueToast('Unable to update like. Please try again.', 'error', false)
      /**
       * handleLike - Utility function
       * @returns void
       */
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      queueToast('Share link copied to the clipboard', 'success', false)
      onShare?.()
    } catch {
      queueToast('Unable to copy share link.', 'error', false)
    }
  }

  const handleToggleMoodboard = async (board: ArtworkMoodboardOption, nextState?: boolean) => {
    /**
     * nextLiked - Utility function
     * @returns void
     */
    try {
      const result = await toggleMoodboard(board, nextState)
      if (result) {
        const toast = getMoodboardToastMessage(result)
        queueToast(toast.message, toast.variant, toast.withSkeleton)
        onSave?.()
      }
    } catch (error) {
      queueToast(
        error instanceof Error ? error.message : 'Unable to update moodboard.',
        'error',
        false,
      )
    }
  }

  /**
   * handleShare - Utility function
   * @returns void
   */
  const handleCreateMoodboard = async (name: string) => {
    try {
      await createMoodboardAndSave(name)
      setCreateModalOpen(false)
      setPopoverOpen(true)
      onSave?.()
      queueToast('Moodboard created and artwork saved', 'success', true)
    } catch (error) {
      queueToast(
        error instanceof Error ? error.message : 'Unable to create moodboard.',
        'error',
        false,
      )
      /**
       * handleToggleMoodboard - Utility function
       * @returns void
       */
      throw error
    }
  }

  const handleOpenCreateModal = () => {
    /**
     * result - Utility function
     * @returns void
     */
    if (!isAuthenticated) {
      queueToast('Please sign in to create a moodboard.', 'error', false)
      return
    }

    /**
     * toast - Utility function
     * @returns void
     */
    setPopoverOpen(false)
    setCreateModalOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          type="button"
          onClick={() => void handleLike()}
          className="flex cursor-pointer items-center gap-2 text-slate-800 transition-colors hover:text-slate-900"
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 500,
            letterSpacing: '0%',
          }}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all duration-200',
              /**
               * handleCreateMoodboard - Utility function
               * @returns void
               */
              liked ? 'fill-rose-500 text-rose-500' : 'text-slate-800',
            )}
          />
          <span>{currentLikes} Likes</span>
        </button>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-slate-800 transition-colors hover:text-slate-900',
                'text-sm font-medium',
              )}
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: 500,
                letterSpacing: '0%',
              }}
            >
              <Bookmark
                className={cn(
                  'h-5 w-5 transition-colors',
                  saved ? 'fill-blue-600 text-blue-600' : 'text-slate-800',
                  /**
                   * handleOpenCreateModal - Utility function
                   * @returns void
                   */
                )}
              />
              <span className="flex items-center gap-1">
                {saved ? 'Saved' : 'Save'}
                {popoverOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                )}
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[320px] p-0" sideOffset={12}>
            <div className="space-y-1 p-3">
              {!isAuthenticated ? (
                <p className="px-2 py-3 text-sm text-slate-500">
                  Sign in to save this artwork to your moodboards.
                </p>
              ) : moodboardsLoading ? (
                <div className="space-y-3 px-2 py-3">
                  <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-44 animate-pulse rounded-full bg-slate-200" />
                </div>
              ) : moodboardError ? (
                <p className="px-2 py-3 text-sm text-rose-500">{moodboardError}</p>
              ) : moodboards.length > 0 ? (
                moodboards.map((board) => (
                  <MoodboardRow
                    key={board.id}
                    board={board}
                    disabled={pendingMoodboardIds.includes(board.id)}
                    onToggle={handleToggleMoodboard}
                  />
                ))
              ) : (
                <p className="px-2 py-3 text-sm text-slate-500">No moodboards yet.</p>
              )}
            </div>
            <div className="h-px bg-slate-100" />
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex w-full items-center gap-3 rounded-b-[12px] px-3 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isAuthenticated}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-500">
                <Plus className="h-4 w-4" />
              </span>
              <span>Create a new moodboard</span>
            </button>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={() => void handleShare()}
          className="flex cursor-pointer items-center gap-2 text-slate-800 transition-colors hover:text-slate-900"
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 500,
            letterSpacing: '0%',
          }}
        >
          <Upload className="h-5 w-5 text-slate-800" />
          <span>Share</span>
        </button>
      </div>

      <CreateMoodboardModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateMoodboard}
      />

      {toastLoading && (
        <div className="fixed left-1/2 top-[85px] z-[9998] flex w-auto min-w-[280px] -translate-x-1/2 flex-col gap-2 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.3)] backdrop-blur-sm">
          <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-2.5 w-40 animate-pulse rounded-full bg-slate-200" />
          {pendingToastMessage && (
            <span className="font-inter text-xs text-slate-500">{pendingToastMessage}</span>
          )}
        </div>
      )}
      {toastState && (
        <ToastPortal
          message={toastState.message}
          variant={toastState.variant}
          onClose={closeToast}
        />
      )}
    </>
  )
}

type MoodboardRowProps = {
  board: ArtworkMoodboardOption
  disabled?: boolean
  onToggle: (board: ArtworkMoodboardOption, nextState?: boolean) => void | Promise<void>
}

const MoodboardRow = ({ board, disabled = false, onToggle }: MoodboardRowProps) => (
  <div
    role="button"
    tabIndex={disabled ? -1 : 0}
    aria-disabled={disabled}
    onClick={() => {
      if (!disabled) void onToggle(board)
    }}
    onKeyDown={(event) => {
      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        void onToggle(board)
      }
    }}
    className={cn(
      'flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50',
      disabled && 'cursor-not-allowed opacity-60',
    )}
  >
    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
      {board.coverUrl ? (
        <Image src={board.coverUrl} alt={board.title} fill sizes="48px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
          <LayoutGrid className="h-5 w-5 text-slate-400" />
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col items-start text-left">
      <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
        {board.title}
        {board.isPrivate && <Lock className="h-3.5 w-3.5 text-slate-400" />}
      </div>
      <span className="text-xs text-slate-500">{board.artworksCount} artworks</span>
    </div>

    <Checkbox
      /**
       * MoodboardRow - React component
       * @returns React element
       */
      checked={board.selected}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onCheckedChange={(checked) => {
        if (!disabled) void onToggle(board, checked === true)
      }}
      className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
    />
  </div>
)
