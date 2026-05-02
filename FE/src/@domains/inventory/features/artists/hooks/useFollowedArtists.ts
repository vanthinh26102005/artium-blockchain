import { useState, useEffect } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import followersApis, { type FollowerObject } from '@shared/apis/followersApis'
import profileApis from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'

import { type InventoryArtist } from '@domains/inventory/features/artists/types/inventoryArtist'
import { mapFollowedArtistToInventory } from '@domains/inventory/features/artists/utils/inventoryArtistMapper'

const FOLLOWED_ARTIST_ARTWORK_PREVIEW_LIMIT = 4

const loadFollowedArtist = async (relationship: FollowerObject): Promise<InventoryArtist> => {
  const followedUserId = relationship.followedUserId
  const [userResult, sellerProfileResult, artworksResult] = await Promise.allSettled([
    usersApi.getUserById(followedUserId),
    profileApis.getSellerProfileByUserId(followedUserId),
    artworkApis.listArtworksPaginated({
      sellerId: followedUserId,
      isPublished: true,
      skip: 0,
      take: FOLLOWED_ARTIST_ARTWORK_PREVIEW_LIMIT,
    }),
  ])

  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const sellerProfile =
    sellerProfileResult.status === 'fulfilled' ? sellerProfileResult.value : null
  const artworksPage =
    artworksResult.status === 'fulfilled'
      ? artworksResult.value
      : {
          data: [],
          pagination: {
            total: 0,
            skip: 0,
            take: 0,
            totalPages: 1,
            currentPage: 1,
            hasNext: false,
            hasPrev: false,
          },
        }

  return mapFollowedArtistToInventory({
    relationship,
    user,
    sellerProfile,
    artworks: artworksPage.data,
    artworkTotal: artworksPage.pagination.total,
  })
}

export const useFollowedArtists = (
  userId: string | undefined,
  page: number,
  pageSize: number,
  isActiveTab: boolean,
) => {
  const [followedArtists, setFollowedArtists] = useState<InventoryArtist[]>([])
  const [followedArtistsTotal, setFollowedArtistsTotal] = useState(0)
  const [followedArtistsTotalPages, setFollowedArtistsTotalPages] = useState(1)
  const [isFollowedArtistsLoading, setIsFollowedArtistsLoading] = useState(false)
  const [followedArtistsError, setFollowedArtistsError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setFollowedArtists([])
      setFollowedArtistsTotal(0)
      setFollowedArtistsTotalPages(1)
      setIsFollowedArtistsLoading(false)
      setFollowedArtistsError(null)
      return
    }

    if (!isActiveTab) {
      setIsFollowedArtistsLoading(false)
      return
    }

    let isActive = true
    setIsFollowedArtistsLoading(true)
    setFollowedArtistsError(null)

    const loadFollowedArtists = async () => {
      try {
        const relationships = await followersApis.getFollowing(userId, {
          skip: (page - 1) * pageSize,
          take: pageSize + 1,
        })
        const hasNextPage = relationships.length > pageSize
        const pageRelationships = relationships.slice(0, pageSize)
        const artists = await Promise.all(pageRelationships.map(loadFollowedArtist))

        if (!isActive) {
          return
        }

        setFollowedArtists(artists)
        const estimatedTotal =
          (page - 1) * pageSize + pageRelationships.length + (hasNextPage ? 1 : 0)
        setFollowedArtistsTotal(estimatedTotal)
        setFollowedArtistsTotalPages(Math.max(1, page + (hasNextPage ? 1 : 0)))
      } catch (error) {
        if (!isActive) {
          return
        }

        setFollowedArtists([])
        setFollowedArtistsTotal(0)
        setFollowedArtistsTotalPages(1)
        setFollowedArtistsError(
          error instanceof Error ? error.message : 'Failed to load followed artists.',
        )
      } finally {
        if (isActive) {
          setIsFollowedArtistsLoading(false)
        }
      }
    }

    void loadFollowedArtists()

    return () => {
      isActive = false
    }
  }, [isActiveTab, page, pageSize, userId])

  return {
    followedArtists,
    followedArtistsTotal,
    followedArtistsTotalPages,
    isFollowedArtistsLoading,
    followedArtistsError,
  }
}
