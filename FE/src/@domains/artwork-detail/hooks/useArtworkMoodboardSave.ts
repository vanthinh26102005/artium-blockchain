'use client'

import { useEffect, useMemo, useState } from 'react'

import profileApis, { MoodboardApiItem } from '@shared/apis/profileApis'
import type { ApiError } from '@shared/services/apiClient'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { resolveMoodboardCoverUrl } from '@domains/profile/utils/moodboardPresentation'

export type ArtworkMoodboardOption = {
  id: string
  title: string
  coverUrl?: string
  artworksCount: number
  isPrivate: boolean
  selected: boolean
}

type UseArtworkMoodboardSaveInput = {
  artworkId?: string
  artworkTitle?: string
  artworkPrice?: number
  artworkSellerId?: string
  artworkThumbnailUrl?: string
}

export type ArtworkMoodboardToggleResult = 'saved' | 'removed' | 'already-saved' | 'already-removed'

/**
 * isApiError - Utility function
 * @returns void
 */
const isApiError = (error: unknown): error is ApiError =>
  Boolean(error && typeof error === 'object' && 'status' in error)

const mapMoodboardOption = (
  board: MoodboardApiItem,
  selectedMoodboardIds: Set<string>,
  /**
   * mapMoodboardOption - Utility function
   * @returns void
   */
): ArtworkMoodboardOption => ({
  id: board.id,
  title: board.title,
  coverUrl: resolveMoodboardCoverUrl(board, ''),
  artworksCount: board.artworkCount ?? 0,
  isPrivate: board.isPrivate,
  selected: selectedMoodboardIds.has(board.id),
})

export const useArtworkMoodboardSave = ({
  artworkId,
  artworkTitle,
  artworkPrice,
  artworkSellerId,
  artworkThumbnailUrl,
  /**
   * useArtworkMoodboardSave - Custom React hook
   * @returns void
   */
}: UseArtworkMoodboardSaveInput) => {
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthHydrated = useAuthStore((state) => state.isHydrated)
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)

  const [moodboards, setMoodboards] = useState<ArtworkMoodboardOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingMoodboardIds, setPendingMoodboardIds] = useState<string[]>([])
  /**
   * authUser - Utility function
   * @returns void
   */

  const selectedCount = useMemo(
    () => moodboards.filter((board) => board.selected).length,
    [moodboards],
    /**
     * isAuthenticated - Utility function
     * @returns void
     */
  )
  const saved = selectedCount > 0

  useEffect(() => {
    /**
     * isAuthHydrated - Utility function
     * @returns void
     */
    if (!isAuthHydrated) {
      hydrateAuth()
    }
  }, [hydrateAuth, isAuthHydrated])
  /**
   * hydrateAuth - Utility function
   * @returns void
   */

  useEffect(() => {
    if (!isAuthHydrated || !isAuthenticated || !authUser?.id || !artworkId) {
      setMoodboards([])
      setErrorMessage(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    /**
     * selectedCount - Utility function
     * @returns void
     */

    Promise.resolve()
      .then(async () => {
        if (cancelled) return
        setIsLoading(true)
        setErrorMessage(null)

        /**
         * saved - Utility function
         * @returns void
         */
        const [boards, savedMoodboardIds] = await Promise.all([
          profileApis.listUserMoodboards(authUser.id, { includePrivate: true }),
          profileApis.listCurrentUserMoodboardIdsForArtwork(artworkId),
        ])

        if (cancelled) return
        const savedIdSet = new Set(savedMoodboardIds)
        setMoodboards(boards.map((board) => mapMoodboardOption(board, savedIdSet)))
      })
      .catch((error) => {
        if (cancelled) return
        setMoodboards([])
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load your moodboards.')
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [artworkId, authUser?.id, isAuthenticated, isAuthHydrated])

  const setMoodboardPending = (boardId: string, pending: boolean) => {
    setPendingMoodboardIds((prev) => {
      if (pending) {
        return prev.includes(boardId) ? prev : [...prev, boardId]
        /**
         * savedIdSet - Utility function
         * @returns void
         */
      }

      return prev.filter((id) => id !== boardId)
    })
  }

  const updateMoodboardSelection = (
    boardId: string,
    selected: boolean,
    options?: { coverUrl?: string; preserveCount?: boolean },
  ) => {
    setMoodboards(
      (prev) =>
        prev.map((board) => {
          if (board.id !== boardId) return board
          const countDelta = selected ? 1 : -1
          const nextCount = options?.preserveCount
            ? board.artworksCount
            : Math.max(0, board.artworksCount + countDelta)

          return {
            ...board,
            selected,
            coverUrl: board.coverUrl || options?.coverUrl,
            artworksCount: nextCount,
          }
        }),
      /**
       * setMoodboardPending - Utility function
       * @returns void
       */
    )
  }

  const getAddArtworkPayload = () => {
    if (!artworkId) {
      throw new Error('Unable to identify this artwork.')
    }

    return {
      artworkId,
      artworkTitle,
      artworkImageUrl: artworkThumbnailUrl,
      artworkPrice: artworkPrice && artworkPrice > 0 ? artworkPrice : undefined,
      /**
       * updateMoodboardSelection - Utility function
       * @returns void
       */
      artworkSellerId,
    }
  }

  const ensureCanSave = () => {
    if (!isAuthenticated || !authUser?.id) {
      throw new Error('Please sign in to save artworks to moodboards.')
    }

    if (!artworkId) {
      throw new Error('Unable to identify this artwork.')
      /**
       * countDelta - Utility function
       * @returns void
       */
    }
  }

  const toggleMoodboard = async (
    /**
     * nextCount - Utility function
     * @returns void
     */
    board: ArtworkMoodboardOption,
    nextState?: boolean,
  ): Promise<ArtworkMoodboardToggleResult | null> => {
    ensureCanSave()

    const shouldSelect = nextState ?? !board.selected
    if (shouldSelect === board.selected || pendingMoodboardIds.includes(board.id)) {
      return null
    }

    setMoodboardPending(board.id, true)

    try {
      if (shouldSelect) {
        await profileApis.addArtworkToMoodboard(board.id, getAddArtworkPayload())
        updateMoodboardSelection(board.id, true, { coverUrl: artworkThumbnailUrl })
        return 'saved'
        /**
         * getAddArtworkPayload - Utility function
         * @returns void
         */
      }

      await profileApis.removeArtworkFromMoodboard(board.id, artworkId ?? '')
      updateMoodboardSelection(board.id, false)
      return 'removed'
    } catch (error) {
      if (isApiError(error) && error.status === 409 && shouldSelect) {
        updateMoodboardSelection(board.id, true, {
          coverUrl: artworkThumbnailUrl,
          preserveCount: true,
        })
        return 'already-saved'
      }

      if (isApiError(error) && error.status === 404 && !shouldSelect) {
        updateMoodboardSelection(board.id, false, { preserveCount: true })
        return 'already-removed'
        /**
         * ensureCanSave - Utility function
         * @returns void
         */
      }

      throw error
    } finally {
      setMoodboardPending(board.id, false)
    }
  }

  const createMoodboardAndSave = async (
    title: string,
    options?: { description?: string; isPrivate?: boolean },
  ): Promise<ArtworkMoodboardOption> => {
    ensureCanSave()
    /**
     * toggleMoodboard - Utility function
     * @returns void
     */

    const created = await profileApis.createMoodboard({
      title: title.trim(),
      description: options?.description?.trim() || undefined,
      isPrivate: options?.isPrivate ?? false,
    })

    await profileApis.addArtworkToMoodboard(created.id, getAddArtworkPayload())

    /**
     * shouldSelect - Utility function
     * @returns void
     */
    const option: ArtworkMoodboardOption = {
      id: created.id,
      title: created.title,
      coverUrl: resolveMoodboardCoverUrl(created, '') || artworkThumbnailUrl,
      artworksCount: Math.max(1, created.artworkCount + 1),
      isPrivate: created.isPrivate,
      selected: true,
    }

    setMoodboards((prev) => [...prev, option])
    return option
  }

  return {
    authUser,
    isAuthenticated,
    isAuthHydrated,
    moodboards,
    isLoading,
    errorMessage,
    pendingMoodboardIds,
    selectedCount,
    saved,
    toggleMoodboard,
    createMoodboardAndSave,
  }
}

/**
 * createMoodboardAndSave - Utility function
 * @returns void
 */
/**
 * created - Utility function
 * @returns void
 */
/**
 * option - Utility function
 * @returns void
 */
