import { useState, useEffect, useCallback } from 'react'
import followersApis from '@shared/apis/followersApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type UseFollowUserOptions = {
  targetUserId: string
  onFollowChange?: (isFollowing: boolean) => void
}

/**
 * useFollowUser - Custom React hook
 * @returns void
 */
export const useFollowUser = ({ targetUserId, onFollowChange }: UseFollowUserOptions) => {
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)
  const [isFollowing, setIsFollowing] = useState(false)
  /**
   * authUser - Utility function
   * @returns void
   */
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * isAuthenticated - Utility function
   * @returns void
   */
  // Check initial follow status
  useEffect(() => {
    if (!isAuthenticated || !targetUserId || authUser?.id === targetUserId) {
      setIsChecking(false)
      return
    }

    const checkStatus = async () => {
      try {
        setIsChecking(true)
        const status = await followersApis.checkFollowStatus(targetUserId)
        setIsFollowing(status.isFollowing)
      } catch (err) {
        console.error('[useFollowUser] Error checking follow status:', err)
        setIsFollowing(false)
      } finally {
        /**
         * checkStatus - Utility function
         * @returns void
         */
        setIsChecking(false)
      }
    }

    checkStatus()
  }, [targetUserId, isAuthenticated, authUser?.id])
  /**
   * status - Utility function
   * @returns void
   */

  const followUser = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      setError('You must be logged in to follow users')
      return
    }

    if (authUser.id === targetUserId) {
      setError('You cannot follow yourself')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await followersApis.followUser({
        /**
         * followUser - Utility function
         * @returns void
         */
        followedUserId: targetUserId,
        followSource: 'profile',
      })
      setIsFollowing(true)
      onFollowChange?.(true)
    } catch (err) {
      console.error('[useFollowUser] Error following user:', err)
      setError(err instanceof Error ? err.message : 'Failed to follow user')
    } finally {
      setIsLoading(false)
    }
  }, [targetUserId, isAuthenticated, authUser?.id, onFollowChange])

  const unfollowUser = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      setError('You must be logged in to unfollow users')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await followersApis.unfollowUser(targetUserId)
      setIsFollowing(false)
      onFollowChange?.(false)
    } catch (err) {
      console.error('[useFollowUser] Error unfollowing user:', err)
      setError(err instanceof Error ? err.message : 'Failed to unfollow user')
    } finally {
      setIsLoading(false)
    }
    /**
     * unfollowUser - Utility function
     * @returns void
     */
  }, [targetUserId, isAuthenticated, authUser?.id, onFollowChange])

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await unfollowUser()
    } else {
      await followUser()
    }
  }, [isFollowing, followUser, unfollowUser])

  return {
    isFollowing,
    isLoading,
    isChecking,
    error,
    followUser,
    unfollowUser,
    toggleFollow,
  }
}

/**
 * toggleFollow - Utility function
 * @returns void
 */
