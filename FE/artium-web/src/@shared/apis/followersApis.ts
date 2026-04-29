import { apiFetch, apiPost, encodePathSegment, withQuery } from '@shared/services/apiClient'

type FollowerObject = {
  id: string
  followedUserId: string
  isMutual: boolean
  notifyOnPosts: boolean
  notifyOnEvents: boolean
  followSource?: string | null
  isAutoFollow: boolean
  engagementScore: number
  lastViewedAt?: string | null
  createdAt: string
}

type FollowUserInput = {
  followedUserId: string
  notifyOnPosts?: boolean
  notifyOnEvents?: boolean
  followSource?: string
}

type CheckFollowStatusResponse = {
  isFollowing: boolean
  followedAt?: string | null
}

export const followersApis = {
  followUser: (input: FollowUserInput) =>
    apiPost<FollowerObject>('/community/followers', input, {
      auth: true,
    }),

  unfollowUser: (userId: string) =>
    apiFetch<{ success: boolean }>(`/community/followers/${encodePathSegment(userId)}`, {
      method: 'DELETE',
      auth: true,
    }),

  getFollowers: (userId: string, options?: { skip?: number; take?: number }) => {
    return apiFetch<FollowerObject[]>(
      withQuery(`/community/followers/followers/${encodePathSegment(userId)}`, options),
      {
        auth: false,
        cache: 'no-store',
      },
    )
  },

  getFollowing: (userId: string, options?: { skip?: number; take?: number }) => {
    return apiFetch<FollowerObject[]>(
      withQuery(`/community/followers/following/${encodePathSegment(userId)}`, options),
      {
        auth: false,
        cache: 'no-store',
      },
    )
  },

  checkFollowStatus: (userId: string) =>
    apiFetch<CheckFollowStatusResponse>(
      `/community/followers/status/${encodePathSegment(userId)}`,
      {
        auth: true,
        cache: 'no-store',
      },
    ),
}

export type { FollowerObject, FollowUserInput, CheckFollowStatusResponse }

export default followersApis
