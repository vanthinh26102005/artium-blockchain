// react
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

// next
import Image from 'next/image'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { MomentComment } from '@domains/profile/types'
import {
  commentFormSchema,
  type CommentFormValues,
} from '@domains/profile/validations/profileForms.schema'

// local
import { CollapsibleSection } from './CollapsibleSection'

type MomentCommentsSectionProps = {
  comments?: MomentComment[]
  currentUser?: MomentComment['author']
  onAddComment?: (content: string) => void
  isLoading?: boolean
  isSubmitting?: boolean
  error?: string | null
  disabled?: boolean
}

/**
 * MomentCommentsSection - React component
 * @returns React element
 */
export const MomentCommentsSection = ({
  comments = [],
  currentUser,
  onAddComment,
  isLoading = false,
  isSubmitting = false,
  error,
  disabled = false,
}: MomentCommentsSectionProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      content: '',
    },
  })
  const draft = useWatch({ control, name: 'content' }) ?? ''
  const canSubmit = draft.trim().length > 0 && !isSubmitting && !disabled
  const commentField = register('content')
/**
 * draft - Utility function
 * @returns void
 */

  const handleCommentSubmit = ({ content }: CommentFormValues) => {
    if (!canSubmit || !onAddComment) {
      return
/**
 * canSubmit - Utility function
 * @returns void
 */
    }
    onAddComment(content.trim())
    reset()
  }
/**
 * commentField - Utility function
 * @returns void
 */

  return (
    <CollapsibleSection title="Comments" defaultOpen={true}>
      {isLoading ? (
        <div className="space-y-3">
/**
 * handleCommentSubmit - Utility function
 * @returns void
 */
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn('flex gap-3', comment.status === 'pending' && 'opacity-60')}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                <Image
                  src={comment.author.avatarUrl}
                  alt={comment.author.displayName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {comment.author.displayName}
                  </p>
                  <span className="text-xs text-slate-500">@{comment.author.username}</span>
                  {comment.status === 'pending' && (
                    <span className="text-xs text-slate-400">Sending...</span>
                  )}
                  {comment.status === 'error' && (
                    <span className="text-xs text-rose-500">Failed</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{comment.content}</p>
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

      <div className="mt-4 border-t border-slate-200 pt-4">
        <form className="flex gap-3" onSubmit={handleSubmit(handleCommentSubmit)}>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
            {currentUser?.avatarUrl ? (
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : null}
          </div>
          <input
            type="text"
            placeholder={disabled ? 'Sign in to comment.' : 'Add a comment...'}
            disabled={disabled}
            className={cn(
              'flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none',
              errors.content && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
              disabled && 'cursor-not-allowed bg-slate-100 text-slate-400',
            )}
            {...commentField}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
        {errors.content?.message ? (
          <p className="mt-2 text-sm text-rose-500">{errors.content.message}</p>
        ) : null}
      </div>
    </CollapsibleSection>
  )
}
