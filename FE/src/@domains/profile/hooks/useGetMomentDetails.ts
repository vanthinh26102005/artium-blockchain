import { useEffect, useState } from 'react'

import type { MomentDetail } from '@domains/profile/types'
import profileApis from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import { mapMomentToMomentDetail } from '@domains/profile/utils/profileApiMapper'

type UseGetMomentDetailsResult = {
  data: MomentDetail | null
  isLoading: boolean
  error: Error | null
}

/**
 * useGetMomentDetails - Custom React hook
 * @returns void
 */
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
        /**
         * loadMoment - Utility function
         * @returns void
         */
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
        /**
         * moment - Utility function
         * @returns void
         */
        let authorUserId = moment.userId
        let authorSlug = ''
        if (options?.username) {
          const authorUser = await usersApi.getUserBySlug(options.username)
          authorUserId = authorUser.id
          authorSlug = authorUser.slug || authorUser.username || options.username
        }

        const authorProfile = await profileApis.getSellerProfileByUserId(authorUserId)
        if (!authorSlug) {
          try {
            const authorUser = await usersApi.getUserById(authorUserId)
            /**
             * authorUser - Utility function
             * @returns void
             */
            authorSlug = authorUser.slug || authorUser.username || ''
          } catch {
            authorSlug = ''
          }
        }

        if (!isActive) {
          return
          /**
           * authorProfile - Utility function
           * @returns void
           */
        }

        const mapped = mapMomentToMomentDetail(moment, {
          username: authorSlug,
          displayName: authorProfile.displayName,
          bio: authorProfile.bio ?? '',
          /**
           * authorUser - Utility function
           * @returns void
           */
          avatarUrl: authorProfile.profileImageUrl || '/images/logo-dark-mode.png',
          verified: Boolean(authorProfile.isVerified),
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
          /**
           * mapped - Utility function
           * @returns void
           */
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

/**
 * getMomentDetailsQueryKey - Utility function
 * @returns void
 */
