
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { MomentDetailView } from '@domains/profile/components/MomentDetailView'
import { DiscoverMoment } from '@domains/discover/mock/mockMoments'
import { MomentDetail } from '@domains/profile/types'

type MomentViewModalProps = {
    moment: DiscoverMoment | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * MomentViewModal - React component
 * @returns React element
 */
export const MomentViewModal = ({ moment, open, onOpenChange }: MomentViewModalProps) => {
    if (!moment) return null

    // Transform DiscoverMoment to MomentDetail
    const content = moment.contents[0]
    const isVideo = !!content.video
    const mediaUrl = isVideo
/**
 * content - Utility function
 * @returns void
 */
        ? content.video?.videoUrl || ''
        : content.image?.imageMedium || content.artwork?.imageMedium || ''
    const posterUrl = isVideo ? content.video?.processedThumb : undefined

/**
 * isVideo - Utility function
 * @returns void
 */
    const momentDetail: MomentDetail = {
        id: moment.id,
        title: content.video?.title || 'Moment',
        caption: moment.caption,
/**
 * mediaUrl - Utility function
 * @returns void
 */
        mediaUrl,
        posterUrl,
        mediaType: isVideo ? 'video' : 'image',
        author: {
            username: moment.user.username,
            displayName: moment.user.fullName,
/**
 * posterUrl - Utility function
 * @returns void
 */
            avatarUrl: moment.user.avatarUrl,
            verified: moment.user.isVerified || false,
        },
        stats: {
            likes: moment.stats.likes,
/**
 * momentDetail - Utility function
 * @returns void
 */
            comments: moment.stats.comments,
            shares: 0,
        },
        isLiked: false,
        isSaved: false,
        createdAt: new Date().toISOString(), // Mock date
    }

    // Mock comments
    const mockComments = [
        {
            id: 'c1',
            author: {
                username: 'art_lover',
                displayName: 'Art Lover',
                avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            },
            content: 'This is amazing!',
            createdAt: new Date().toISOString(),
        },
        {
            id: 'c2',
            author: {
                username: 'collector_101',
                displayName: 'Collector 101',
                avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            },
/**
 * mockComments - Utility function
 * @returns void
 */
            content: 'Can\'t wait to see the final piece.',
            createdAt: new Date().toISOString(),
        },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="5xl" className="overflow-hidden rounded-4xl bg-white p-0 max-w-[1200px] w-[95vw] h-[90vh] max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 z-50 rounded-full bg-white/80 p-2 text-slate-500 hover:bg-white hover:text-slate-900"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <MomentDetailView
                        moment={momentDetail}
                        comments={mockComments}
                        isAuthenticated={true}
                        onLike={() => { }}
                        onSave={() => { }}
                        onShare={() => { }}
                        onAddComment={() => { }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
