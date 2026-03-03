'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark, ChevronDown, ChevronUp, Heart, LayoutGrid, Lock, Plus, Upload } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Checkbox } from '@shared/components/ui/checkbox'
import { CreateMoodboardModal } from './CreateMoodboardModal'
import { ArtworkDetailImage } from '../../types'

type MoodboardOption = {
    id: string
    title: string
    coverUrl?: string
    artworksCount?: number
    isPrivate?: boolean
    selected?: boolean
    autoCoverFromArtwork?: boolean
    baseArtworksCount?: number
    defaultCoverUrl?: string
}

type ArtworkActionsProps = {
    likesCount: number
    isLiked?: boolean
    isSaved?: boolean
    artworkId?: string
    artworkThumbnailUrl?: string
    artworkImages?: ArtworkDetailImage[]
    onLike?: () => void
    onSave?: () => void
    onShare?: () => void
}

type ToastState = {
    message: string
    variant: 'success' | 'error'
}

const hashString = (value: string) => {
    let hash = 0
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

const pickArtworkCover = (
    images?: ArtworkDetailImage[],
    fallback?: string,
    seed?: string,
) => {
    if (!images || !images.length) return fallback
    const key = seed ?? images.map((image) => image.url).join('|')
    const index = hashString(key) % images.length
    return images[index]?.url ?? fallback
}

const getDefaultMoodboards = ({
    artworkThumbnailUrl,
    artworkImages,
    artworkId,
    isSaved,
}: {
    artworkThumbnailUrl?: string
    artworkImages?: ArtworkDetailImage[]
    artworkId?: string
    isSaved: boolean
}): MoodboardOption[] => {
    const privateCover = pickArtworkCover(
        artworkImages,
        artworkThumbnailUrl,
        `${artworkId ?? 'default'}-private`,
    )
    const huutriDefaultCover = pickArtworkCover(
        artworkImages,
        artworkThumbnailUrl,
        `${artworkId ?? 'default'}-huutri`,
    )

    return [
        {
            id: 'private-moodboard',
            title: 'Private Moodboard',
            coverUrl: privateCover,
            defaultCoverUrl: privateCover,
            artworksCount: 2,
            baseArtworksCount: 2,
            isPrivate: true,
            selected: false,
        },
        {
            id: 'huutri',
            title: 'HuuTri',
            coverUrl: isSaved ? artworkThumbnailUrl : huutriDefaultCover,
            defaultCoverUrl: huutriDefaultCover,
            artworksCount: 5,
            baseArtworksCount: Math.max(0, 5 - (isSaved ? 1 : 0)),
            isPrivate: false,
            selected: isSaved,
            autoCoverFromArtwork: true,
        },
    ]
}

export const ArtworkActions = ({
    likesCount,
    isLiked = false,
    isSaved = false,
    onLike,
    onSave,
    onShare,
    artworkThumbnailUrl,
    artworkImages,
    artworkId,
}: ArtworkActionsProps) => {
    const [liked, setLiked] = useState(isLiked)
    const [currentLikes, setCurrentLikes] = useState(likesCount)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const artworkImagesSignature = useMemo(
        () => artworkImages?.map((image) => image.url).join('|') ?? '',
        [artworkImages],
    )
    const defaultMoodboards = useMemo(
        () =>
            getDefaultMoodboards({
                artworkThumbnailUrl,
                artworkImages,
                artworkId,
                isSaved,
            }),
        [artworkThumbnailUrl, artworkId, isSaved, artworkImagesSignature],
    )
    const [moodboards, setMoodboards] = useState<MoodboardOption[]>(defaultMoodboards)

    useEffect(() => {
        setMoodboards(defaultMoodboards)
    }, [defaultMoodboards])

    const [toastState, setToastState] = useState<ToastState | null>(null)
    const [toastLoading, setToastLoading] = useState(false)
    const [pendingToastMessage, setPendingToastMessage] = useState<string | null>(null)
    const toastSkeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const toastAutoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
                    setToastState(null)
                }, 3000)
            }, 2000)

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

    useEffect(() => {
        const variance = Math.floor(Math.random() * 16) + 5 // add a small, client-only fluctuation
        const randomizedLikes = Math.max(0, likesCount + variance)
        setCurrentLikes(randomizedLikes)
    }, [likesCount])

    useEffect(() => () => {
        clearToastTimers()
    }, [])

    const selectedCount = useMemo(
        () => moodboards.filter((board) => board.selected).length,
        [moodboards],
    )
    const saved = selectedCount > 0

    const handleLike = () => {
        setLiked((prev) => !prev)
        setCurrentLikes((prev) => (liked ? prev - 1 : prev + 1))
        onLike?.()
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        queueToast('Share link copied to the clipboard', 'success', false)
        onShare?.()
    }

    const handleToggleMoodboard = (boardId: string, nextState?: boolean) => {
        let shouldShowToast = false

        setMoodboards((prev) =>
            prev.map((board) => {
                if (board.id !== boardId) {
                    return board
                }

                const shouldSelect = nextState ?? !board.selected
                if (shouldSelect && !board.selected) {
                    shouldShowToast = true
                }

                if (board.autoCoverFromArtwork) {
                    const baseCount = board.baseArtworksCount ?? 0
                    const nextCount = shouldSelect ? baseCount + 1 : baseCount
                    const fallbackCover = board.defaultCoverUrl ?? board.coverUrl
                    const coverUrl = shouldSelect
                        ? artworkThumbnailUrl ?? fallbackCover
                        : fallbackCover

                    return {
                        ...board,
                        selected: shouldSelect,
                        coverUrl,
                        artworksCount: nextCount,
                        baseArtworksCount: baseCount,
                        defaultCoverUrl: board.defaultCoverUrl,
                    }
                }

                return { ...board, selected: shouldSelect }
            }),
        )

        onSave?.()
        if (shouldShowToast) {
            queueToast('Saved to moodboard', 'success', true)
        }
    }

    const handleCreateMoodboard = (name: string) => {
        const newBoard: MoodboardOption = {
            id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`,
            title: name,
            artworksCount: 0,
            isPrivate: false,
            selected: false,
            autoCoverFromArtwork: true,
            baseArtworksCount: 0,
            defaultCoverUrl: undefined,
        }

        setMoodboards((prev) => {
            const cleared = prev.map((board) => ({ ...board }))
            return [...cleared, newBoard]
        })

        setCreateModalOpen(false)
        setPopoverOpen(true)
        onSave?.()
        queueToast('Moodboard created', 'success', true)
    }

    const handleOpenCreateModal = () => {
        setPopoverOpen(false)
        setCreateModalOpen(true)
    }

    return (
        <>
            <div className="flex items-center justify-center gap-6 py-4">
                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className="flex cursor-pointer items-center gap-2 text-slate-800 transition-colors hover:text-slate-900"
                    style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}
                >
                    <Heart
                        className={cn(
                            'h-5 w-5 transition-all duration-200',
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
                            style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}
                        >
                            <Bookmark
                                className={cn(
                                    'h-5 w-5 transition-colors',
                                    saved ? 'text-blue-600 fill-blue-600' : 'text-slate-800',
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
                            {moodboards.map((board) => (
                                <MoodboardRow
                                    key={board.id}
                                    board={board}
                                    onToggle={handleToggleMoodboard}
                                />
                            ))}
                        </div>
                        <div className="h-px bg-slate-100" />
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="flex w-full items-center gap-3 rounded-b-[12px] px-3 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-500">
                                <Plus className="h-4 w-4" />
                            </span>
                            <span>Create a new moodboard</span>
                        </button>
                    </PopoverContent>
                </Popover>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="flex cursor-pointer items-center gap-2 text-slate-800 transition-colors hover:text-slate-900"
                    style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}
                >
                    <Upload className="h-5 w-5 text-slate-800" />
                    <span>Share</span>
                </button>
            </div>

            {/* Create Moodboard Modal (reusable) */}
            <CreateMoodboardModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onCreate={handleCreateMoodboard}
            />

            {/* Skeleton + Toast Notification */}
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
    board: MoodboardOption
    onToggle: (id: string, nextState?: boolean) => void
}

const MoodboardRow = ({ board, onToggle }: MoodboardRowProps) => (
    <button
        type="button"
        onClick={() => onToggle(board.id)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
    >
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
            {board.coverUrl ? (
                <Image
                    src={board.coverUrl}
                    alt={board.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                />
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
            <span className="text-xs text-slate-500">
                {board.artworksCount ?? 0} artworks
            </span>
        </div>

        <Checkbox
            checked={board.selected}
            onCheckedChange={(checked) => onToggle(board.id, checked === true)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
    </button>
)
