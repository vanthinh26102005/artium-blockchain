import { MomentDetail } from '@domains/profile/types'

// Mock data for image moment (corresponds to moment-01 from moments.ts)
export const mockMomentDetailImage: MomentDetail = {
  id: 'moment-01',
  title: 'Early studies for the series',
  caption: 'Early studies for the series. Testing color blocking and texture in the studio.',
  mediaUrl:
    'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=1200&q=80',
  mediaType: 'image',
  author: {
    username: 'marianphamart',
    displayName: 'Marian Pham',
    avatarUrl: 'https://placehold.co/80x80.png?text=MP',
    verified: true,
  },
  stats: {
    likes: 2,
    comments: 0,
    shares: 0,
  },
  linkedArtwork: {
    id: 'p1',
    title: "Flock of Spirits - Night's Keeper",
    coverUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    priceLabel: '$35',
    artistName: 'Marian Pham',
  },
  isLiked: false,
  isSaved: false,
  createdAt: '2024-01-12T10:30:00Z',
}

// Mock data for video moment (corresponds to moment-03 from moments.ts)
export const mockMomentDetail: MomentDetail = {
  id: 'moment-03',
  title: 'Birdie is ready for a new home',
  caption: 'Birdie is ready for a new home. Beginning Again, oil on canvas panel.',
  mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  posterUrl:
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
  mediaType: 'video',
  author: {
    username: 'tarakas',
    displayName: 'Tara Astari',
    avatarUrl: 'https://placehold.co/80x80.png?text=TA',
    verified: true,
  },
  stats: {
    likes: 1,
    comments: 0,
    shares: 0,
  },
  linkedArtwork: {
    id: 'p3',
    title: 'Beginning Again',
    coverUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    priceLabel: '$250',
    artistName: 'Tara Astari',
  },
  isLiked: false,
  isSaved: false,
  createdAt: '2024-02-11T10:30:00Z',
}
