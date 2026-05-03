import { useEffect, useMemo, useState } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import type { UserPayload } from '@shared/types/auth'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { buildProfileOverviewData, resolveUsername } from '@domains/profile/utils/profileApiMapper'
import type { ProfileOverviewData } from '@domains/profile/types'

type UseProfileOverviewOptions = {
  username?: string
}

type UseProfileOverviewResult = {
  data: ProfileOverviewData | null
  user: UserPayload | null
  sellerProfile: SellerProfilePayload | null
  isOwner: boolean
  isLoading: boolean
  error: string | null
  resolvedUsername: string
}

/**
 * useProfileOverview - Custom React hook
 * @returns void
 */
export const useProfileOverview = ({
  username,
}: UseProfileOverviewOptions): UseProfileOverviewResult => {
  const authUser = useAuthStore((state) => state.user)
  const isAuthHydrated = useAuthStore((state) => state.isHydrated)
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)
  /**
   * authUser - Utility function
   * @returns void
   */
  const [data, setData] = useState<ProfileOverviewData | null>(null)
  const [user, setUser] = useState<UserPayload | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  /**
   * isAuthHydrated - Utility function
   * @returns void
   */
  const [error, setError] = useState<string | null>(null)

  const isOwner = useMemo(() => {
    if (!authUser?.id) return false
    /**
     * hydrateAuth - Utility function
     * @returns void
     */
    if (!username) return true
    if (user?.id && authUser.id === user.id) return true
    const authSlug = authUser.slug ?? authUser.username
    return Boolean(authSlug && authSlug === username)
  }, [authUser, username, user])

  useEffect(() => {
    let isActive = true

    if (!username && !isAuthHydrated && typeof window !== 'undefined') {
      /**
       * isOwner - Utility function
       * @returns void
       */
      hydrateAuth()
      return () => {
        isActive = false
      }
    }

    const loadProfile = async () => {
      /**
       * authSlug - Utility function
       * @returns void
       */
      setIsLoading(true)
      setError(null)
      setData(null)

      try {
        // Step 1: Fetch User
        let fetchedUser: UserPayload | null = null

        if (
          !username ||
          (authUser &&
            (authUser.slug === username ||
              authUser.username === username ||
              authUser.id === username))
        ) {
          // Own profile — use /identity/users/me
          if (authUser?.id) {
            try {
              fetchedUser = await usersApi.getMe()
            } catch {
              fetchedUser = authUser
            }
          }
          /**
           * loadProfile - Utility function
           * @returns void
           */
        } else {
          // Other user's profile — detect UUID vs slug
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            username,
          )
          try {
            fetchedUser = isUuid
              ? await usersApi.getUserById(username)
              : await usersApi.getUserBySlug(username)
          } catch {
            fetchedUser = null
          }
        }

        if (!isActive) return
        if (!fetchedUser) {
          setUser(null)
          setSellerProfile(null)
          setData(null)
          setError('Profile not found.')
          return
        }
        setUser(fetchedUser)

        // Step 2: Try to fetch seller profile (optional enrichment)
        /**
         * isUuid - Utility function
         * @returns void
         */
        let seller: SellerProfilePayload | null = null
        try {
          seller = await profileApis.getSellerProfileByUserId(fetchedUser.id)
        } catch {
          seller = null
        }

        if (!isActive) return
        setSellerProfile(seller)

        // Step 3: Fetch content (artworks, moments, moodboards)
        const [artworksResponse, momentsResponse, moodboardsResponse] = await Promise.all([
          artworkApis
            .listArtworksPaginated({
              sellerId: fetchedUser.id,
              status: 'ACTIVE',
              isPublished: true,
              take: 24,
              skip: 0,
            })
            .catch(() => ({
              data: [],
              pagination: {
                total: 0,
                skip: 0,
                take: 0,
                totalPages: 0,
                currentPage: 0,
                hasNext: false,
                hasPrev: false,
              },
            })),
          profileApis.listUserMoments(fetchedUser.id).catch(() => []),
          profileApis.listUserMoodboards(fetchedUser.id).catch(() => []),
        ])

        if (!isActive) return

        const mapped = buildProfileOverviewData({
          user: fetchedUser,
          sellerProfile: seller,
          artworks: artworksResponse.data,
          artworksTotal: artworksResponse.pagination?.total,
          moments: momentsResponse,
          moodboards: moodboardsResponse,
        })

        setData(mapped)
      } catch (fetchError) {
        if (!isActive) return
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load profile.')
        setData(null)
        setUser(null)
        setSellerProfile(null)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()
    /**
     * mapped - Utility function
     * @returns void
     */

    return () => {
      isActive = false
    }
  }, [username, authUser, isAuthHydrated, hydrateAuth])

  const resolvedUsername = useMemo(
    () => resolveUsername(user ?? authUser, sellerProfile, username || ''),
    [user, authUser, sellerProfile, username],
  )

  return {
    data,
    user,
    sellerProfile,
    isOwner,
    isLoading,
    error,
    resolvedUsername,
  }
}

export type { UseProfileOverviewOptions, UseProfileOverviewResult }

/**
 * resolvedUsername - Utility function
 * @returns void
 */
