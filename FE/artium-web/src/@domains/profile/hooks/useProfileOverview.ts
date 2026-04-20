import { useEffect, useMemo, useState } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import type { UserPayload } from '@shared/types/auth'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { profileOverviewData as fallbackProfile } from '@domains/profile/constants/mockProfileData'
import {
  buildProfileOverviewData,
  resolveUsername,
} from '@domains/profile/utils/profileApiMapper'
import type { ProfileOverviewData } from '@domains/profile/types'

type UseProfileOverviewOptions = {
  username?: string
}

type UseProfileOverviewResult = {
  data: ProfileOverviewData
  user: UserPayload | null
  sellerProfile: SellerProfilePayload | null
  isOwner: boolean
  isLoading: boolean
  error: string | null
  resolvedUsername: string
}

export const useProfileOverview = ({
  username,
}: UseProfileOverviewOptions): UseProfileOverviewResult => {
  const authUser = useAuthStore((state) => state.user)
  const [data, setData] = useState<ProfileOverviewData | null>(null)
  const [user, setUser] = useState<UserPayload | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = useMemo(() => {
    if (!authUser?.id) return false
    if (!username) return true
    if (user?.id && authUser.id === user.id) return true
    const authSlug = authUser.slug ?? authUser.username
    return Boolean(authSlug && authSlug === username)
  }, [authUser, username, user])

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Step 1: Fetch User
        let fetchedUser: UserPayload | null = null

        if (!username || (authUser && (authUser.slug === username || authUser.username === username))) {
          // Own profile — use /identity/users/me
          if (authUser?.id) {
            try {
              fetchedUser = await usersApi.getMe()
            } catch {
              fetchedUser = authUser
            }
          }
        } else {
          // Other user's profile — use /identity/users/slug/:slug
          try {
            fetchedUser = await usersApi.getUserBySlug(username)
          } catch {
            fetchedUser = null
          }
        }

        if (!isActive) return
        if (!fetchedUser) {
          setUser(null)
          setSellerProfile(null)
          setData(fallbackProfile)
          setError('Profile not found.')
          return
        }
        setUser(fetchedUser)

        // Step 2: Try to fetch seller profile (optional enrichment)
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
        setData(fallbackProfile)
        setUser(null)
        setSellerProfile(null)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isActive = false
    }
  }, [username, authUser?.id, authUser?.slug, authUser?.username])

  const resolvedUsername = useMemo(
    () => resolveUsername(user ?? authUser, sellerProfile, username || ''),
    [user, authUser, sellerProfile, username],
  )

  return {
    data: data ?? fallbackProfile,
    user,
    sellerProfile,
    isOwner,
    isLoading,
    error,
    resolvedUsername,
  }
}

export type { UseProfileOverviewOptions, UseProfileOverviewResult }
