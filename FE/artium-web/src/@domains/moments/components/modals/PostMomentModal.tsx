import { useState } from 'react'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { VideoPicker } from '@domains/inventory-upload/components/step-1/VideoPicker'
import { UPLOAD_MEDIA_RULES } from '@domains/inventory-upload/stores/useUploadArtworkStore'

type PostMomentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const PostMomentModal = ({ open, onOpenChange }: PostMomentModalProps) => {
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [caption, setCaption] = useState('')
    const [videoType, setVideoType] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSelectVideo = (file: File) => {
        setVideoFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    const handleRemoveVideo = () => {
        setVideoFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        setCaption('')
        setVideoType('')
    }

    const handlePost = async () => {
        if (!videoFile) return

        setIsSubmitting(true)

        // TODO: Implement actual API call
        console.log('Posting moment:', { videoFile, caption, videoType })

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        handleRemoveVideo()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
                <div className="border-b border-black/10 px-8 py-6">
                    <h2 className="text-[22px] font-bold text-[#191414]">Post a Moment</h2>
                </div>

                <div className="px-8 py-6">
                    <VideoPicker
                        video={
                            previewUrl
                                ? {
                                    previewUrl,
                                    name: videoFile?.name,
                                    size: videoFile?.size,
                                    type: videoFile?.type,
                                }
                                : undefined
                        }
                        accept={UPLOAD_MEDIA_RULES.VIDEO_ACCEPT}
                        maxSizeLabel={`${UPLOAD_MEDIA_RULES.MAX_VIDEO_SIZE_MB}MB`}
                        title="Artwork moments"
                        description="Upload moments of your artwork."
                        mode="moments"
                        caption={caption}
                        videoType={videoType}
                        onCaptionChange={setCaption}
                        onVideoTypeChange={setVideoType}
                        onSelect={handleSelectVideo}
                        onRemove={handleRemoveVideo}
                    />

                    {videoFile && (
                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={handlePost}
                                disabled={isSubmitting || !caption || !videoType}
                                className="rounded-full bg-[#0F6BFF] px-8 py-6 text-[15px] font-semibold text-white hover:bg-[#0F6BFF]/90 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Posting...' : 'Post Moment'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
