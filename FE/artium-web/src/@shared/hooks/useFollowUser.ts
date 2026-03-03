import { useState, useEffect, useCallback } from 'react'
import followersApis from '@shared/apis/followersApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type UseFollowUserOptions = {
  targetUserId: string
  onFollowChange?: (isFollowing: boolean) => void
}

export const useFollowUser = ({ targetUserId, onFollowChange }: UseFollowUserOptions) => {
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setIsChecking(false)
      }
    }

    checkStatus()
  }, [targetUserId, isAuthenticated, authUser?.id])

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
