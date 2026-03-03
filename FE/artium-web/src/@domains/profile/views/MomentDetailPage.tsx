// react
import { useEffect, useMemo, useState } from 'react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { SiteHeader } from '@shared/components/layout/SiteHeader'

// @domains - profile
import { MomentDetailView } from '@domains/profile/components/MomentDetailView'
import { useGetMomentDetails } from '@domains/profile/hooks/useGetMomentDetails'
import { MomentComment } from '@domains/profile/types'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import profileApis from '@shared/apis/profileApis'
import { mapCommentToMomentComment } from '@domains/profile/utils/profileApiMapper'

type MomentDetailPageProps = {
  username: string
  momentId: string
}

export const MomentDetailPage = ({ username, momentId }: MomentDetailPageProps) => {
  // Fetch moment details using custom hook
  const { data: momentData, isLoading, error } = useGetMomentDetails(momentId, { username })
  const [moment, setMoment] = useState(momentData)
  const [comments, setComments] = useState<MomentComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [likeError, setLikeError] = useState<string | null>(null)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(user?.id)
  const currentUser = useMemo(
    () =>
      isAuthenticated
        ? {
            id: user?.id,
            username: user?.username || 'guest',
            displayName: user?.displayName || user?.username || 'Guest',
            avatarUrl: user?.avatarUrl || '/images/logo-dark-mode.png',
          }
        : undefined,
    [isAuthenticated, user],
  )

  useEffect(() => {
    if (momentData) {
      setMoment(momentData)
    }
  }, [momentData])

  useEffect(() => {
    let isActive = true

    const loadComments = async () => {
      if (!momentId) {
        setComments([])
        return
      }

      setCommentsLoading(true)
      setCommentsError(null)

      try {
        const response = await profileApis.listMomentComments(momentId, { take: 50 })
        if (!isActive) return
        const mapped = response.map((comment) =>
          mapCommentToMomentComment(comment, currentUser),
        )
        setComments(mapped)
      } catch {
        if (!isActive) return
        setCommentsError('Failed to load comments. Please try again.')
      } finally {
        if (isActive) {
          setCommentsLoading(false)
        }
      }
    }

    void loadComments()

    return () => {
      isActive = false
    }
  }, [momentId, currentUser])

  useEffect(() => {
    let isActive = true

    const loadLikeStatus = async () => {
      if (!momentId || !isAuthenticated) {
        return
      }

      try {
        const response = await profileApis.getMomentLikeStatus(momentId)
        if (!isActive) return
        setMoment((prev) => (prev ? { ...prev, isLiked: response.liked } : prev))
      } catch {
        if (!isActive) return
      }
    }

    void loadLikeStatus()

    return () => {
      isActive = false
    }
  }, [momentId, isAuthenticated])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading moment...</p>
        </div>
      </div>
    )
  }

  if (error || !moment) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-sm text-slate-500">
            {error?.message || 'Moment not found.'}
          </p>
        </div>
      </div>
    )
  }

  const handleLike = async () => {
    if (!moment || isLikeLoading) return
    if (!isAuthenticated) {
      setLikeError('Please sign in to like this moment.')
      return
    }

    const nextLiked = !moment.isLiked
    const previousLiked = moment.isLiked
    const previousLikes = moment.stats.likes

    setLikeError(null)
    setIsLikeLoading(true)
    setMoment((prev) =>
      prev
        ? {
            ...prev,
            isLiked: nextLiked,
            stats: {
              ...prev.stats,
              likes: nextLiked ? prev.stats.likes + 1 : Math.max(prev.stats.likes - 1, 0),
            },
          }
        : prev,
    )

    try {
      await profileApis.setMomentLikeStatus(moment.id, nextLiked)
    } catch {
      setMoment((prev) =>
        prev
          ? {
              ...prev,
              isLiked: previousLiked,
              stats: {
                ...prev.stats,
                likes: previousLikes,
              },
            }
          : prev,
      )
      setLikeError('Unable to update like. Please try again.')
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleSave = () => {
    setMoment((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        isSaved: !prev.isSaved,
      }
    })
  }

  const handleShare = () => {
    if (!moment) {
      return
    }

    if (navigator.share) {
      navigator.share({
        title: moment.title,
        text: moment.caption,
        url: window.location.href,
      })
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleAddComment = async (content: string) => {
    if (!moment || !currentUser) {
      setCommentsError('Please sign in to add a comment.')
      return
    }

    if (isCommentSubmitting) {
      return
    }

    const tempId = `temp-${moment.id}-${Date.now()}`
    const optimistic: MomentComment = {
      id: tempId,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    setCommentsError(null)
    setIsCommentSubmitting(true)
    setComments((prev) => [optimistic, ...prev])

    try {
      const created = await profileApis.createMomentComment(moment.id, { content })
      const mapped = mapCommentToMomentComment(created, currentUser)
      setComments((prev) => prev.map((item) => (item.id === tempId ? mapped : item)))
      setMoment((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                comments: prev.stats.comments + 1,
              },
            }
          : prev,
      )
    } catch {
      setComments((prev) => prev.filter((item) => item.id !== tempId))
      setCommentsError('Unable to post comment. Please try again.')
    } finally {
      setIsCommentSubmitting(false)
    }
  }

  const pageTitle = `${moment.author.displayName} on Artium: "${moment.title}"`

  return (
    <div className="min-h-screen bg-slate-50">
      <Metadata title={pageTitle} />
      <SiteHeader />
      <MomentDetailView
        moment={moment}
        comments={comments}
        currentUser={currentUser}
        onAddComment={handleAddComment}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        commentsLoading={commentsLoading}
        commentsError={commentsError}
        isCommentSubmitting={isCommentSubmitting}
        isLikeLoading={isLikeLoading}
        isAuthenticated={isAuthenticated}
      />
      {likeError ? (
        <div className="mx-auto mt-4 max-w-[1050px] px-4 text-sm text-rose-500">
          {likeError}
        </div>
      ) : null}
    </div>
  )
}
