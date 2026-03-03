import { useEffect, useState } from 'react'

import type { MomentDetail } from '@domains/profile/types'
import profileApis from '@shared/apis/profileApis'
import { mapMomentToMomentDetail } from '@domains/profile/utils/profileApiMapper'

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

        const authorProfile = options?.username
          ? await profileApis.getSellerProfileBySlug(options.username)
          : await profileApis.getSellerProfileByUserId(moment.userId)

        if (!isActive) {
          return
        }

        const mapped = mapMomentToMomentDetail(moment, {
          username: authorProfile.slug,
          displayName: authorProfile.displayName,
          bio: authorProfile.bio ?? '',
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
