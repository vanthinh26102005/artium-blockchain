// next
import Image from 'next/image'

// third-party
import { BadgeCheck, Heart, Bookmark, Share2 } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { MomentDetail, MomentComment } from '@domains/profile/types'

// local
import { MomentVideoPlayer } from './MomentVideoPlayer'
import { MomentImageViewer } from './MomentImageViewer'
import { MomentArtworkSection } from './MomentArtworkSection'
import { MomentCommentsSection } from './MomentCommentsSection'

type MomentDetailViewProps = {
  moment: MomentDetail
  comments?: MomentComment[]
  currentUser?: MomentComment['author']
  onAddComment?: (content: string) => void
  onLike?: () => void
  onSave?: () => void
  onShare?: () => void
  commentsLoading?: boolean
  commentsError?: string | null
  isCommentSubmitting?: boolean
  isLikeLoading?: boolean
  isAuthenticated?: boolean
}

export const MomentDetailView = ({
  moment,
  comments,
  currentUser,
  onAddComment,
  onLike,
  onSave,
  onShare,
  commentsLoading,
  commentsError,
  isCommentSubmitting,
  isLikeLoading,
  isAuthenticated = false,
}: MomentDetailViewProps) => {
  return (
    <div className="font-['Inter']">
      <div className="mx-auto max-w-[1050px] px-0 py-4 lg:px-1 lg:py-8 2xl:max-w-[1200px]">
        <div className="grid justify-center gap-4 lg:grid-cols-[380px_420px] lg:gap-4 2xl:grid-cols-[480px_500px] 2xl:gap-6">
          {/* Left: Video Player */}
          <div className="flex items-start justify-center px-4 lg:px-0">
            <div className="aspect-square w-full max-w-[400px] lg:sticky lg:top-6 lg:aspect-[3/4] lg:max-h-[510px] lg:max-w-none 2xl:max-h-[580px]">
              {moment.mediaType === 'video' ? (
                <MomentVideoPlayer
                  videoUrl={moment.mediaUrl}
                  posterUrl={moment.posterUrl}
                  autoPlay={false}
                />
              ) : (
                <MomentImageViewer imageUrl={moment.mediaUrl} alt={moment.title} />
              )}
            </div>
          </div>

          {/* Right: Info Sidebar */}
          <div className="w-full px-4 lg:px-0">
            <div className="space-y-0 lg:space-y-6">
              {/* Main Info Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:rounded-3xl">
                {/* Author Info */}
                <div className="flex items-center gap-3 border-b border-slate-100 p-6">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                    <Image
                      src={moment.author.avatarUrl}
                      alt={moment.author.displayName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-semibold text-slate-900">
                        {moment.author.displayName}
                      </h2>
                      {moment.author.verified && <BadgeCheck className="h-4 w-4 text-blue-600" />}
                    </div>
                    <p className="text-sm text-slate-500">@{moment.author.username}</p>
                  </div>
                </div>

                {/* Caption */}
                <div className="border-b border-slate-100 px-6 py-4">
                  <p className="text-base leading-relaxed text-slate-700">{moment.caption}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 px-6 py-4">
                  <button
                    onClick={onLike}
                    disabled={!isAuthenticated || isLikeLoading}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      moment.isLiked
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      (!isAuthenticated || isLikeLoading) && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <Heart className={cn('h-4 w-4', moment.isLiked && 'fill-current')} />
                    {moment.stats.likes}
                  </button>

                  <button
                    onClick={onSave}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      moment.isSaved
                        ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    <Bookmark className={cn('h-4 w-4', moment.isSaved && 'fill-current')} />
                    Save
                  </button>

                  <button
                    onClick={onShare}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>

                {/* Artwork Section */}
                <MomentArtworkSection
                  artwork={moment.linkedArtwork}
                  username={moment.author.username}
                />

                {/* Comments Section */}
                <MomentCommentsSection
                  comments={comments}
                  momentId={moment.id}
                  currentUser={currentUser}
                  onAddComment={onAddComment}
                  isLoading={commentsLoading}
                  isSubmitting={isCommentSubmitting}
                  error={commentsError}
                  disabled={!isAuthenticated}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
