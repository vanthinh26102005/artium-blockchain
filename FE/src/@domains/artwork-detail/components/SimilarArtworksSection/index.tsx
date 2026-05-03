'use client'

import { useState, useEffect } from 'react'
import { Masonry } from 'masonic'
import { DiscoverArtwork, mockArtworks } from '@domains/discover/mock/mockArtworks'
import { DiscoveryArtworkCard } from '@domains/discover/components/cards/DiscoveryArtworkCard'

type SimilarArtworksSectionProps = {
    artworks?: DiscoverArtwork[]
}

/**
 * MasonryCard - React component
 * @returns React element
 */
const MasonryCard = ({ data }: { data: DiscoverArtwork }) => {
    return <DiscoveryArtworkCard artwork={data} />
}

const INITIAL_DISPLAY_COUNT = 12
const LOAD_MORE_COUNT = 6

/**
 * INITIAL_DISPLAY_COUNT - React component
 * @returns React element
 */
export const SimilarArtworksSection = ({ artworks }: SimilarArtworksSectionProps) => {
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT)
    const [isMounted, setIsMounted] = useState(false)

/**
 * LOAD_MORE_COUNT - React component
 * @returns React element
 */
    // Only render Masonry on client side
    useEffect(() => {
        setIsMounted(true)
    }, [])

/**
 * SimilarArtworksSection - React component
 * @returns React element
 */
    // Use provided artworks or fallback to all mockArtworks
    const allArtworks = artworks || mockArtworks
    const displayedArtworks = allArtworks.slice(0, displayCount)
    const hasMore = displayCount < allArtworks.length

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + LOAD_MORE_COUNT, allArtworks.length))
    }

    if (allArtworks.length === 0) return null

    return (
        <section className="mb-12">
/**
 * allArtworks - Utility function
 * @returns void
 */
            {/* Title */}
            <h2 className="mb-8 text-center font-medium text-slate-900" style={{ fontFamily: 'Inter', fontSize: '28px', lineHeight: '100%', fontWeight: 500, letterSpacing: '0%' }}>
                Similar Artworks
            </h2>
/**
 * displayedArtworks - Utility function
 * @returns void
 */

            {/* Masonry Grid - Only render on client */}
            {isMounted ? (
                <Masonry
/**
 * hasMore - Utility function
 * @returns void
 */
                    items={displayedArtworks}
                    columnWidth={160}
                    columnGutter={16}
                    rowGutter={16}
                    overscanBy={2}
/**
 * handleLoadMore - Utility function
 * @returns void
 */
                    maxColumnCount={6}
                    scrollFps={12}
                    render={MasonryCard}
                    itemKey={(item) => item.id}
                    className="w-full"
                    ssrWidth={1200}
                    ssrHeight={800}
                />
            ) : (
                <div className="flex min-h-[400px] items-center justify-center">
                    <p className="text-slate-500">Loading artworks...</p>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && isMounted && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="cursor-pointer rounded-full border border-slate-300 bg-white px-8 py-3 font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                        style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px', fontWeight: 500, letterSpacing: '0%' }}
                    >
                        Load More
                    </button>
                </div>
            )}
        </section>
    )
}
