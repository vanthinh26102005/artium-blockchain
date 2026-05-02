// next
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

// third-party
import { zodResolver } from '@hookform/resolvers/zod'
import { Bookmark, Heart, Share2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/@shared/components/ui/accordion'

// @domains - profile
import { MediaViewer } from '@domains/profile/components/MediaViewer'
import profileApis from '@shared/apis/profileApis'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import { mapCommentToMomentComment, mapMomentToProfileDetail } from '@domains/profile/utils/profileApiMapper'
import type { Moment } from '@domains/profile/constants/moments'
import { MomentComment } from '@domains/profile/types'
import {
  commentFormSchema,
  type CommentFormValues,
} from '@domains/profile/validations/profileForms.schema'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { cn } from '@shared/lib/utils'

type ProfileMomentDetailPageViewProps = {
  username?: string | string[]
  momentId?: string | string[]
}

export const ProfileMomentDetailPageView = ({
  username: _username,
  momentId: _momentId,
}: ProfileMomentDetailPageViewProps) => {
  const router = useRouter()
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const { data: baseData, isLoading, error, resolvedUsername } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileData = baseData
  const profileHandle = resolvedUsername || profileData?.user.username || usernameFromRoute || ''
  const momentId = Array.isArray(_momentId) ? _momentId[0] : _momentId
  const [moment, setMoment] = useState<Moment | null>(null)
  const [momentLoading, setMomentLoading] = useState(false)
  const [comments, setComments] = useState<MomentComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likePending, setLikePending] = useState(false)
  const [likeError, setLikeError] = useState<string | null>(null)
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(authUser?.id)
  const currentUser = useMemo(
    () =>
      isAuthenticated
        ? {
          id: authUser?.id,
          username: authUser?.username || 'guest',
          displayName: authUser?.displayName || authUser?.username || 'Guest',
          avatarUrl: authUser?.avatarUrl || '/images/logo-dark-mode.png',
        }
        : undefined,
    [authUser, isAuthenticated],
  )
  const baseHref = profileHandle
    ? `/profile/${encodeURIComponent(profileHandle)}/moments`
    : '/'
  const {
    register: registerComment,
    handleSubmit: handleCommentSubmit,
    reset: resetCommentForm,
    formState: { errors: commentFormErrors },
    control: commentControl,
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      content: '',
    },
  })
  const commentDraft = useWatch({ control: commentControl, name: 'content' }) ?? ''
  const commentField = registerComment('content')

  const hasArtwork = moment?.artworkPreview !== undefined

  useEffect(() => {
    let isActive = true

    const loadMoment = async () => {
      if (!momentId || !profileData) {
        setMoment(null)
        return
      }

      setMomentLoading(true)

      try {
        const response = await profileApis.getMoment(momentId)
        if (!isActive) return
        if (!response) {
          setMoment(null)
          return
        }
        setMoment(mapMomentToProfileDetail(response, profileData.user))
      } catch {
        if (!isActive) return
        setMoment(null)
      } finally {
        if (isActive) {
          setMomentLoading(false)
        }
      }
    }

    void loadMoment()

    return () => {
      isActive = false
    }
  }, [momentId, profileData])

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
        const mapped = response.map((comment) => mapCommentToMomentComment(comment, currentUser))
        setComments(mapped)
      } catch {
        if (!isActive) return
        setCommentsError('Unable to load comments right now.')
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
        setIsLiked(false)
        return
      }

      try {
        const response = await profileApis.getMomentLikeStatus(momentId)
        if (!isActive) return
        setIsLiked(response.liked)
      } catch {
        if (!isActive) return
      }
    }

    void loadLikeStatus()

    return () => {
      isActive = false
    }
  }, [momentId, isAuthenticated])

  const handleToggleLike = async () => {
    if (!moment || likePending) return
    if (!isAuthenticated) {
      setLikeError('Please sign in to like this moment.')
      return
    }

    const nextLiked = !isLiked
    const previousLiked = isLiked
    const previousLikes = moment.likes ?? 0

    setLikeError(null)
    setLikePending(true)
    setIsLiked(nextLiked)
    setMoment((prev) =>
      prev
        ? {
          ...prev,
          likes: nextLiked ? (prev.likes ?? 0) + 1 : Math.max((prev.likes ?? 0) - 1, 0),
        }
        : prev,
    )

    try {
      await profileApis.setMomentLikeStatus(moment.id, nextLiked)
    } catch {
      setIsLiked(previousLiked)
      setMoment((prev) => (prev ? { ...prev, likes: previousLikes } : prev))
      setLikeError('Unable to update like. Please try again.')
    } finally {
      setLikePending(false)
    }
  }

  const handlePostComment = async (content: string) => {
    if (!moment || !currentUser) {
      setCommentsError('Please sign in to add a comment.')
      return
    }

    if (commentSubmitting) {
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
    setCommentSubmitting(true)
    setComments((prev) => [optimistic, ...prev])

    try {
      const created = await profileApis.createMomentComment(moment.id, { content })
      const mapped = mapCommentToMomentComment(created, currentUser)
      setComments((prev) => prev.map((item) => (item.id === tempId ? mapped : item)))
      setMoment((prev) =>
        prev
          ? {
            ...prev,
            comments: (prev.comments ?? 0) + 1,
          }
          : prev,
      )
    } catch {
      setComments((prev) => prev.filter((item) => item.id !== tempId))
      setCommentsError('Unable to post comment. Please try again.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const canSubmitComment =
    commentDraft.trim().length > 0 && !commentSubmitting && isAuthenticated

  if (!momentId) {
    return null
  }

  if (isLoading || momentLoading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="container space-y-6 py-10">
          <h1 className="text-2xl font-semibold text-slate-900">Loading moment...</h1>
        </div>
      </div>
    )
  }

  if (error || !profileData || !moment) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="container space-y-6 py-10">
          <h1 className="text-2xl font-semibold text-slate-900">
            {error ? 'Failed to load moment' : 'Moment not found'}
          </h1>
          <p className="text-slate-600">
            The moment you are looking for does not exist or has been removed.
          </p>
          <Link href={baseHref} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to Moments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Metadata title={`${moment.author.name} | Moment`} />
      <div className="min-h-screen bg-slate-100">
        <div className="container space-y-6 py-6 lg:py-10">
          <header className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Back
            </button>
          </header>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-2">
              <div className="border-slate-200 bg-slate-900 p-4 sm:p-6 lg:border-r">
                <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
                  <div className="relative h-[40vh] min-h-[280px] sm:h-[45vh] lg:h-[500px]">
                    <MediaViewer moment={moment} />
                  </div>
                </div>
              </div>

              <div className="relative flex h-full flex-col overflow-hidden">
                <div className="space-y-6 p-6 pb-24 sm:p-8">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-200">
                      <Image
                        src={moment.author.avatarUrl}
                        alt={moment.author.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{moment.author.name}</p>
                      <p className="text-sm text-slate-500">@{moment.author.username}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-lg leading-snug font-medium text-slate-900">
                      {moment.caption}
                    </p>
                    <div className="inline-flex items-center divide-x divide-slate-200 rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={handleToggleLike}
                        disabled={likePending || !isAuthenticated}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2.5 text-sm transition-colors first:rounded-l-full',
                          isLiked
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'text-slate-700 hover:bg-slate-50',
                          (likePending || !isAuthenticated) && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                        <span>{moment.likes ?? 0}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors last:rounded-r-full hover:bg-slate-50"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                    {likeError ? (
                      <p className="text-xs text-rose-500">{likeError}</p>
                    ) : null}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 max-h-full overflow-y-auto">
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue={hasArtwork ? 'artwork' : undefined}
                    className="space-y-3 rounded-t-[28px] border-t border-slate-200 bg-slate-50 px-4 pt-3 pb-5 sm:px-6"
                  >
                    <AccordionItem
                      value="artwork"
                      className="flex flex-col-reverse rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <AccordionTrigger className="bg-white px-4 py-4 text-base font-semibold text-slate-900 hover:bg-slate-50 data-[state=open]:border-t data-[state=open]:border-slate-200 sm:px-6">
                        Artwork
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-4 pb-4 sm:px-6">
                        {moment.artworkPreview ? (
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                              <Image
                                src={moment.artworkPreview.imageUrl}
                                alt={moment.artworkPreview.title}
                                fill
                                sizes="160px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-slate-900">
                                {moment.artworkPreview.title}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                <span className="relative h-6 w-6 overflow-hidden rounded-full bg-slate-200">
                                  <Image
                                    src={moment.author.avatarUrl}
                                    alt={moment.author.name}
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                  />
                                </span>
                                <span>{moment.author.name}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No artwork linked to this moment yet.
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                      value="comments"
                      className="flex flex-col-reverse rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <AccordionTrigger className="bg-white px-4 py-4 text-base font-semibold text-slate-900 hover:bg-slate-50 data-[state=open]:border-t data-[state=open]:border-slate-200 sm:px-6">
                        Comments
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-4 pb-4 sm:px-6">
                        <div className="space-y-4">
                          {commentsLoading ? (
                            <div className="space-y-3">
                              {[1, 2, 3].map((item) => (
                                <div key={item} className="flex gap-3">
                                  <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
                                  <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : commentsError ? (
                            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
                              {commentsError}
                            </div>
                          ) : comments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                              No comments yet. Be the first to share your thoughts.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className={cn(
                                    'flex gap-3',
                                    comment.status === 'pending' && 'opacity-60',
                                  )}
                                >
                                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200">
                                    <Image
                                      src={comment.author.avatarUrl}
                                      alt={comment.author.displayName}
                                      fill
                                      sizes="36px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-slate-900">
                                        {comment.author.displayName}
                                      </p>
                                      <span className="text-xs text-slate-500">
                                        @{comment.author.username}
                                      </span>
                                      {comment.status === 'pending' && (
                                        <span className="text-xs text-slate-400">Sending...</span>
                                      )}
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-700">
                                      {comment.content}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <form
                            onSubmit={handleCommentSubmit(({ content }) => {
                              if (!canSubmitComment) return
                              void handlePostComment(content.trim())
                              resetCommentForm()
                            })}
                            className={cn(
                              'flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3',
                              !isAuthenticated && 'opacity-70',
                            )}
                          >
                            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200">
                              {currentUser ? (
                                <Image
                                  src={currentUser.avatarUrl}
                                  alt={currentUser.displayName}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <input
                              type="text"
                              placeholder={
                                isAuthenticated ? 'Respond with your thoughts...' : 'Sign in to comment.'
                              }
                              disabled={!isAuthenticated || commentSubmitting}
                              className={cn(
                                'flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400',
                                commentFormErrors.content && 'text-rose-500 placeholder:text-rose-300',
                                (!isAuthenticated || commentSubmitting) &&
                                'cursor-not-allowed text-slate-400',
                              )}
                              {...commentField}
                            />
                            <button
                              type="submit"
                              disabled={!canSubmitComment}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              {commentSubmitting ? 'Posting...' : 'Post'}
                            </button>
                          </form>
                          {commentFormErrors.content?.message ? (
                            <p className="mt-2 text-sm text-rose-500">
                              {commentFormErrors.content.message}
                            </p>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
