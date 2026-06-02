import { useEffect, useState } from 'react'

import type { MomentDetail } from '@domains/profile/types'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import { mapMomentToMomentDetail } from '@domains/profile/utils/profileApiMapper'
import type { UserPayload } from '@shared/types/auth'

type UseGetMomentDetailsResult = {
  data: MomentDetail | null
  isLoading: boolean
  error: Error | null
}

export const useGetMomentDetails = (
  momentId: string,
  options?: { username?: string },
): UseGetMomentDetailsResult => {
  const [data, setData] = useState<MomentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isActive = true

    const loadMoment = async () => {
      if (!momentId) {
        setData(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const moment = await profileApis.getMoment(momentId)
        if (!moment) {
          throw new Error('Moment not found.')
        }

        // Resolve author: look up user (by slug or by userId), then fetch seller profile
        let authorUserId = moment.userId
        let authorSlug = ''
        if (options?.username) {
          const authorUser = await usersApi.getUserBySlug(options.username)
          authorUserId = authorUser.id
          authorSlug = authorUser.slug || authorUser.username || options.username
        }

        let authorProfile: SellerProfilePayload | null = null
        try {
          authorProfile = await profileApis.getSellerProfileByUserId(authorUserId)
        } catch {
          authorProfile = null
        }
        let authorUserFallback: UserPayload | null = null
        if (!authorSlug) {
          try {
            authorUserFallback = await usersApi.getUserById(authorUserId)
            authorSlug = authorUserFallback.slug || authorUserFallback.username || ''
          } catch {
            authorSlug = ''
          }
        }
        if (!authorUserFallback) {
          try {
            authorUserFallback = await usersApi.getUserById(authorUserId)
          } catch {
            authorUserFallback = null
          }
        }

        if (!isActive) {
          return
        }

        const mapped = mapMomentToMomentDetail(moment, {
          username: authorSlug || authorUserFallback?.slug || authorUserFallback?.username || 'user',
          displayName:
            authorProfile?.displayName ||
            authorUserFallback?.fullName ||
            authorUserFallback?.displayName ||
            authorUserFallback?.email ||
            'Artist',
          bio: authorProfile?.bio ?? '',
          avatarUrl:
            authorProfile?.profileImageUrl ||
            authorUserFallback?.avatarUrl ||
            '/images/logo-dark-mode.png',
          verified: Boolean(authorProfile?.isVerified),
        })

        setData(mapped)
      } catch (err) {
        if (!isActive) {
          return
        }
        setError(err instanceof Error ? err : new Error('Failed to load moment.'))
        setData(null)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadMoment()

    return () => {
      isActive = false
    }
  }, [momentId, options?.username])

  return {
    data,
    isLoading,
    error,
  }
}

export const getMomentDetailsQueryKey = (momentId: string) => ['getMomentDetails', momentId]
