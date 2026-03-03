import { useEffect, useMemo, useState } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { profileOverviewData as fallbackProfile } from '@domains/profile/constants/mockProfileData'
import {
  mapProfileOverviewData,
  resolveProfileUsername,
} from '@domains/profile/utils/profileApiMapper'
import type { ProfileOverviewData } from '@domains/profile/types'

type UseProfileOverviewOptions = {
  username?: string
}

type UseProfileOverviewResult = {
  data: ProfileOverviewData
  sellerProfile: SellerProfilePayload | null
  isLoading: boolean
  error: string | null
  resolvedUsername: string
}

export const useProfileOverview = ({
  username,
}: UseProfileOverviewOptions): UseProfileOverviewResult => {
  const authUser = useAuthStore((state) => state.user)
  const [data, setData] = useState<ProfileOverviewData | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfilePayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let profile: SellerProfilePayload | null = null

        if (username) {
          try {
            profile = await profileApis.getSellerProfileBySlug(username)
          } catch (err) {
            throw err
          }
        } else if (authUser?.id) {
          try {
            profile = await profileApis.getSellerProfileByUserId(authUser.id)
          } catch (err) {
            throw err
          }
        }

        if (!isActive) return
        if (!profile) {
          setSellerProfile(null)
          setData(fallbackProfile)
          setError('Profile not found.')
          return
        }
        setSellerProfile(profile)

        const [artworksResponse, momentsResponse, moodboardsResponse] = await Promise.all([
          artworkApis
            .listArtworksPaginated({
              sellerId: profile.userId,
              take: 24,
              skip: 0,
            })
            .then((response) => response)
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
          profileApis.listUserMoments(profile.userId).catch(() => []),
          profileApis.listUserMoodboards(profile.userId).catch(() => []),
        ])

        if (!isActive) return

        const mapped = mapProfileOverviewData({
          sellerProfile: profile,
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
  }, [username, authUser?.id])

  const resolvedUsername = useMemo(
    () => resolveProfileUsername(sellerProfile, username || authUser?.username!),
    [sellerProfile, username, authUser?.username],
  )

  return {
    data: data ?? fallbackProfile,
    sellerProfile,
    isLoading,
    error,
    resolvedUsername,
  }
}

export type { UseProfileOverviewOptions, UseProfileOverviewResult }
