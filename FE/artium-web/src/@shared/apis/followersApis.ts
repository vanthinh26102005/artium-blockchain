import { apiFetch, apiPost } from '@shared/services/apiClient'

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
    apiFetch<{ success: boolean }>(`/community/followers/${userId}`, {
      method: 'DELETE',
      auth: true,
    }),

  getFollowers: (userId: string, options?: { skip?: number; take?: number }) => {
    const params = new URLSearchParams()
    if (options?.skip !== undefined) params.append('skip', String(options.skip))
    if (options?.take !== undefined) params.append('take', String(options.take))
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<FollowerObject[]>(`/community/followers/followers/${userId}${query}`, {
      auth: false,
      cache: 'no-store',
    })
  },

  getFollowing: (userId: string, options?: { skip?: number; take?: number }) => {
    const params = new URLSearchParams()
    if (options?.skip !== undefined) params.append('skip', String(options.skip))
    if (options?.take !== undefined) params.append('take', String(options.take))
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<FollowerObject[]>(`/community/followers/following/${userId}${query}`, {
      auth: false,
      cache: 'no-store',
    })
  },

  checkFollowStatus: (userId: string) =>
    apiFetch<CheckFollowStatusResponse>(`/community/followers/status/${userId}`, {
      auth: true,
      cache: 'no-store',
    }),
}

export type { FollowerObject, FollowUserInput, CheckFollowStatusResponse }

export default followersApis
