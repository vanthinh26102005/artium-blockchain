import { ArtworkDetail } from '../types'
import { DiscoverArtwork, mockArtworks } from '@domains/discover/mock/mockArtworks'
import { mockHomeArtworks } from '@domains/home/mock/mockHomeArtworks'
import { TopPicksArtwork, mockTopPicksArtworks } from '@domains/discover/mock/mockTopPicksArtworks'

// Price formatter
/**
 * priceFormatter - Utility function
 * @returns void
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// Fixed descriptions for artworks
const MOCK_DESCRIPTION = `This captivating piece explores the interplay of light and shadow, creating a mesmerizing visual experience. The artist's unique technique brings depth and emotion to every brushstroke.

Signed on the back & ready to hang. Ships with certificate of authenticity. Offered with a white wood floater frame.`
/**
 * MOCK_DESCRIPTION - React component
 * @returns React element
 */

// Convert DiscoverArtwork to ArtworkDetail
export const convertToArtworkDetail = (artwork: DiscoverArtwork): ArtworkDetail => {
  // Generate multiple images for gallery (main + variations)
  const images = [
    {
      id: `${artwork.id}-1`,
      url: artwork.imageMedium,
      /**
       * convertToArtworkDetail - Utility function
       * @returns void
       */
      alt: `${artwork.title} - Main view`,
    },
    {
      id: `${artwork.id}-2`,
      url: artwork.imageMedium.replace(/seed\/[^/]+/, `seed/${artwork.id}-detail1`),
      /**
       * images - Utility function
       * @returns void
       */
      alt: `${artwork.title} - Detail view 1`,
    },
    {
      id: `${artwork.id}-3`,
      url: artwork.imageMedium.replace(/seed\/[^/]+/, `seed/${artwork.id}-detail2`),
      alt: `${artwork.title} - Detail view 2`,
    },
  ]

  return {
    id: artwork.id,
    title: artwork.title,
    artistName: artwork.creator.fullName,
    priceLabel: artwork.isSold ? 'Sold' : priceFormatter.format(artwork.price),
    isSold: artwork.isSold,
    coverUrl: artwork.imageMedium,
    // Cố định data để tránh Hydration error
    likesCount: 31,
    year: 2022,
    medium: 'Acrylics and sand on stretched canvas',
    dimensions: '19.69 × 27.56 × 0.71 in | 50.01 × 70 × 1.8 cm',
    weight: '2 kg | 4.41 lbs',
    frame: 'framed',
    isUnique: true,
    hasCertificate: true,
    description: MOCK_DESCRIPTION,
    likedByUser: false,
    savedByUser: false,
    images,
    creator: {
      username: artwork.creator.username,
      displayName: artwork.creator.fullName,
      bio: `Artist and creator of unique artworks based in Italy. His work takes inspiration from mountains and nature.`,
      avatarUrl:
        artwork.creator.coverImage || `https://i.pravatar.cc/150?u=${artwork.creator.username}`,
      verified: true,
      buyers: 5,
      worksSold: 117,
      testimonials: 7,
    },
  }
}

// Convert TopPicksArtwork to ArtworkDetail
export const convertTopPicksToArtworkDetail = (artwork: TopPicksArtwork): ArtworkDetail => {
  // Generate multiple images for gallery (main + variations)
  const images = [
    {
      id: `${artwork.id}-1`,
      url: artwork.imageUrl,
      alt: `${artwork.title} - Main view`,
    },
    {
      id: `${artwork.id}-2`,
      url: artwork.imageUrl.replace(/seed\/[^/]+/, `seed/${artwork.id}-detail1`),
      alt: `${artwork.title} - Detail view 1`,
      /**
       * convertTopPicksToArtworkDetail - Utility function
       * @returns void
       */
    },
    {
      id: `${artwork.id}-3`,
      url: artwork.imageUrl.replace(/seed\/[^/]+/, `seed/${artwork.id}-detail2`),
      alt: `${artwork.title} - Detail view 2`,
      /**
       * images - Utility function
       * @returns void
       */
    },
  ]

  const displayName = artwork.username.charAt(0).toUpperCase() + artwork.username.slice(1)

  return {
    id: artwork.id,
    title: artwork.title,
    artistName: displayName,
    priceLabel: artwork.badges.price || 'USD 1,400',
    coverUrl: artwork.imageUrl,
    // Cố định data để tránh Hydration error
    likesCount: 31,
    year: 2022,
    medium: 'Acrylics and sand on stretched canvas',
    dimensions: '19.69 × 27.56 × 0.71 in | 50.01 × 70 × 1.8 cm',
    weight: '2 kg | 4.41 lbs',
    frame: 'framed',
    isUnique: true,
    hasCertificate: true,
    description: MOCK_DESCRIPTION,
    /**
     * displayName - Utility function
     * @returns void
     */
    likedByUser: false,
    savedByUser: false,
    images,
    creator: {
      username: artwork.username,
      displayName: displayName,
      bio: `Artist and creator of unique artworks based in Italy. His work takes inspiration from mountains and nature.`,
      avatarUrl: artwork.avatarUrl || `https://i.pravatar.cc/150?u=${artwork.username}`,
      verified: true,
      buyers: 5,
      worksSold: 117,
      testimonials: 7,
    },
  }
}

// Get artwork detail by ID
export const getArtworkDetailById = (id: string): ArtworkDetail | null => {
  // Check if it's a top picks artwork
  if (id && id.startsWith('tp-')) {
    const artwork = mockTopPicksArtworks.find((a) => a.id === id)
    if (artwork) return convertTopPicksToArtworkDetail(artwork)
  }

  // Check in home artworks
  const homeArtwork = mockHomeArtworks.find((a) => a.id === id)
  if (homeArtwork) return convertToArtworkDetail(homeArtwork)

  // Check in discover artworks
  const artwork = mockArtworks.find((a) => a.id === id)
  if (artwork) return convertToArtworkDetail(artwork)

  return null
}

// Backward compatibility
export const MOCK_ARTWORK_DETAIL: ArtworkDetail = convertToArtworkDetail(mockArtworks[0])

/**
 * getArtworkDetailById - Utility function
 * @returns void
 */
/**
 * artwork - Utility function
 * @returns void
 */
/**
 * homeArtwork - Utility function
 * @returns void
 */
/**
 * artwork - Utility function
 * @returns void
 */
/**
 * MOCK_ARTWORK_DETAIL - React component
 * @returns React element
 */
