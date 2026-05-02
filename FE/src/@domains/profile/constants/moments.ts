export type MediaType = 'image' | 'video'

export type Author = {
  id: string
  name: string
  username: string
  avatarUrl: string
}

export type MomentArtworkPreview = {
  title: string
  imageUrl: string
  priceLabel: string
}

export type Moment = {
  id: string
  type: MediaType
  mediaUrl: string
  posterUrl?: string
  caption: string
  createdAt: string
  author: Author
  likes?: number
  comments?: number
  shares?: number
  artworkPreview?: MomentArtworkPreview
}

export const MOMENTS: Moment[] = [
  {
    id: 'moment-01',
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=1200&q=80',
    caption: 'Early studies for the series. Testing color blocking and texture in the studio.',
    createdAt: '2024-01-12',
    author: {
      id: 'author-1',
      name: 'Marian Pham',
      username: 'marianphamart',
      avatarUrl: 'https://placehold.co/80x80.png?text=MP',
    },
    likes: 2,
    comments: 0,
    shares: 0,
    artworkPreview: {
      title: "Flock of Spirits - Night's Keeper",
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      priceLabel: '$35',
    },
  },
  {
    id: 'moment-02',
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&w=1200&q=80',
    caption: "She's the first in an ongoing series. India ink, gouache, and gold metallic spray.",
    createdAt: '2024-02-04',
    author: {
      id: 'author-1',
      name: 'Marian Pham',
      username: 'marianphamart',
      avatarUrl: 'https://placehold.co/80x80.png?text=MP',
    },
    likes: 4,
    comments: 0,
    shares: 1,
    artworkPreview: {
      title: "Letters I couldn't send No. 01",
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      priceLabel: '$185',
    },
  },
  {
    id: 'moment-03',
    type: 'video',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Birdie is ready for a new home. Beginning Again, oil on canvas panel.',
    createdAt: '2024-02-11',
    author: {
      id: 'author-2',
      name: 'Tara Astari',
      username: 'tarakas',
      avatarUrl: 'https://placehold.co/80x80.png?text=TA',
    },
    likes: 1,
    comments: 0,
    shares: 0,
    artworkPreview: {
      title: 'Beginning Again',
      imageUrl:
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
      priceLabel: '$250',
    },
  },
  {
    id: 'moment-04',
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    caption: 'On the easel. Revisiting some winged creatures. Launch coming soon.',
    createdAt: '2024-03-02',
    author: {
      id: 'author-2',
      name: 'Tara Astari',
      username: 'tarakas',
      avatarUrl: 'https://placehold.co/80x80.png?text=TA',
    },
    likes: 2,
    comments: 0,
    shares: 0,
    artworkPreview: {
      title: 'Winged Creatures',
      imageUrl:
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
      priceLabel: '$250',
    },
  },
  {
    id: 'moment-05',
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Holiday cards in progress. More art in 2024.',
    createdAt: '2024-03-18',
    author: {
      id: 'author-3',
      name: 'Huu Phan',
      username: 'huutr37239',
      avatarUrl: 'https://placehold.co/80x80.png?text=HP',
    },
    likes: 1,
    comments: 0,
    shares: 0,
  },
  {
    id: 'moment-06',
    type: 'video',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&w=1200&q=80',
    caption: 'Sketchbook to canvas. Short timelapse from the studio.',
    createdAt: '2024-03-24',
    author: {
      id: 'author-4',
      name: 'Davi Nguyen',
      username: 'davignuyen',
      avatarUrl: 'https://placehold.co/80x80.png?text=DN',
    },
    likes: 2,
    comments: 0,
    shares: 0,
  },
  {
    id: 'moment-07',
    type: 'video',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Layering color fields on a larger canvas. Progress shot.',
    createdAt: '2024-04-06',
    author: {
      id: 'author-5',
      name: 'An Nguyen',
      username: 'annguyen',
      avatarUrl: 'https://placehold.co/80x80.png?text=AN',
    },
    likes: 1,
    comments: 0,
    shares: 0,
  },
  {
    id: 'moment-08',
    type: 'video',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    caption: 'Testing brushwork and light reflections.',
    createdAt: '2024-04-12',
    author: {
      id: 'author-2',
      name: 'Tara Astari',
      username: 'tarakas',
      avatarUrl: 'https://placehold.co/80x80.png?text=TA',
    },
    likes: 2,
    comments: 0,
    shares: 0,
  },
  {
    id: 'moment-09',
    type: 'video',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    caption: 'Short timelapse: finishing touches and varnish.',
    createdAt: '2024-04-20',
    author: {
      id: 'author-3',
      name: 'Huu Phan',
      username: 'huutr37239',
      avatarUrl: 'https://placehold.co/80x80.png?text=HP',
    },
    likes: 1,
    comments: 0,
    shares: 0,
  },
]
