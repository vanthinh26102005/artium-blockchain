'use client'

import { ArtworkDetail } from '../types'
import { HeroSection } from '../components/HeroSection'
import { TabsSection } from '../components/TabsSection'
import { SimilarArtworksSection } from '../components/SimilarArtworksSection'

type ArtworkDetailPageProps = {
    artwork: ArtworkDetail
}

export const ArtworkDetailPage = ({
    artwork,
}: ArtworkDetailPageProps) => {
    return (
        <>
            {/* Main Content - full width with padding */}
            <div className="w-full px-6 py-8 lg:px-[4%]">
                {/* Hero Section */}
                <HeroSection artwork={artwork} />

                {/* Tabs Section */}
                <TabsSection artwork={artwork} />
            </div>

            {/* Similar Artworks - full width */}
            <div className="w-full px-6 py-8 lg:px-[4%]">
                <SimilarArtworksSection />
            </div>
        </>
    )
}
