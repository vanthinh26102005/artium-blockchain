'use client'

import { ArtworkDetail } from '../../types'
import { ArtworkGallery } from './ArtworkGallery'
import { ArtworkInfo } from './ArtworkInfo'
import { ArtworkActions } from './ArtworkActions'

type HeroSectionProps = {
    artwork: ArtworkDetail
    onLikeArtwork?: (liked: boolean) => void | Promise<void>
}

/**
 * HeroSection - React component
 * @returns React element
 */
export const HeroSection = ({ artwork, onLikeArtwork }: HeroSectionProps) => {
    const artworkThumbnailUrl = artwork.images?.[0]?.url ?? artwork.coverUrl

    return (
/**
 * artworkThumbnailUrl - Utility function
 * @returns void
 */
        <section className="mb-8">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
                {/* Left Side - Gallery (larger) */}
                <div className="flex flex-col">
                    <ArtworkGallery images={artwork.images} title={artwork.title} />

                    {/* Actions - Below Gallery */}
                    <div className="mt-4">
                        <ArtworkActions
                            likesCount={artwork.likesCount}
                            isLiked={artwork.likedByUser}
                            artworkThumbnailUrl={artworkThumbnailUrl}
                            artworkId={artwork.id}
                            artworkTitle={artwork.title}
                            artworkPrice={artwork.priceAmount}
                            artworkSellerId={artwork.sellerId}
                            onLike={onLikeArtwork}
                        />
                    </div>
                </div>

                {/* Right Side - Info */}
                <div className="lg:sticky lg:top-20">
                    <ArtworkInfo artwork={artwork} />
                </div>
            </div>
        </section>
    )
}

export { ArtworkGallery, ArtworkInfo, ArtworkActions }
