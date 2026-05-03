// @domains - profile
import { ProfileOverviewData } from '@domains/profile/types'
import { MOMENTS } from '@domains/profile/constants/moments'

/**
 * profileUser - Utility function
 * @returns void
 */
const profileUser = {
  username: 'tarakas',
  displayName: 'Tara Astari Kasenda',
  bio: 'Textural, vibrant narratives that blend figurative forms with bold palettes.',
  avatarUrl: 'https://placehold.co/112x112.png?text=TA',
  role: 'Artist',
  location: 'Jakarta, Indonesia',
  secondaryLocation: 'Paris',
  verified: true,
  headline: 'Upcoming show @: Silhouettes in motion | 2023',
}

const userMomentsSource = MOMENTS.filter(
  (moment) => moment.author.username === profileUser.username,
)
/**
 * userMomentsSource - Custom React hook
 * @returns void
 */
const profileMomentsSource = userMomentsSource.length > 0 ? userMomentsSource : MOMENTS.slice(0, 6)
const profileMoments = profileMomentsSource.map((moment, index) => ({
  id: moment.id,
  title: moment.caption,
  imageUrl: moment.posterUrl || moment.mediaUrl,
  mediaType: moment.type,
  /**
   * profileMomentsSource - Utility function
   * @returns void
   */
  likes: 2 + index * 3,
  comments: index % 3,
  shares: 0,
}))
/**
 * profileMoments - Utility function
 * @returns void
 */

export const profileOverviewData: ProfileOverviewData = {
  user: profileUser,
  stats: {
    artworks: 999000,
    followers: 999000,
    following: 999000,
    collectors: 999000,
    worksSold: 999000,
    testimonials: 999000,
  },
  salesStats: {
    averagePrice: 207.14,
    /**
     * profileOverviewData - Utility function
     * @returns void
     */
    medianPrice: 185,
    currency: 'US$',
    recentSales: [
      { label: 'Sale 1', value: 120 },
      { label: 'Sale 2', value: 160 },
      { label: 'Sale 3', value: 190 },
      { label: 'Sale 4', value: 230 },
      { label: 'Sale 5', value: 260 },
    ],
  },
  about: {
    biography:
      'Tara Kasenda, born in 1990, is an Indonesian visual artist who explores various mediums, including oil, installation, print, sculpture, and new media, all while embracing the concept of color within the realm of traditional painting conventions.',
    websiteUrl: 'https://artium.com',
    instagram: 'instagram.com/tara.kasenda',
    twitter: 'x.com/tara.kasenda',
    profileCategories: ['Artist', 'Collector'],
    roles: ['Curator', 'Designer'],
    artisticVibes: ['Joyful', 'Dreamy', 'Expressive', 'Peaceful'],
    artisticValues: ['Cultural Heritage', 'Pride', 'Feminism'],
    artisticMediums: ['Illustration', 'Painting', 'Installation', 'Mixed Media'],
    connectionAffiliations: 'Artereal Gallery, Officedog Productions',
    connectionSeenAt:
      'NGV Australia 2020\nArtereal Gallery\n4A Centre of Contemporary Asian Art\nUniversity of New South Wales',
    connectionCurrently: 'Building my next collaboration project (stay tuned!).',
    inspireVibes: ['Joyful', 'Dreamy', 'Romantic'],
    inspireValues: ['Cultural Heritage', 'Human Experiences', 'Feminism'],
    inspireMediums: ['Illustration', 'Painting', 'Installation', 'Performance Art'],
  },
  artworks: [
    {
      id: 'p1',
      title: 'Silhouettes in Motion',
      artistName: 'Tara Astari Kasenda',
      priceLabel: '$6,800',
      coverUrl: 'https://picsum.photos/seed/profile-artwork-01/900/1200',
      likesCount: 154,
      medium: 'Acrylic on canvas',
      dimensions: '36.02in x 36.02in',
      actionLabel: 'Buy now',
    },
    {
      id: 'p2',
      title: 'Color Bloom',
      artistName: 'Tara Astari Kasenda',
      priceLabel: '$4,200',
      coverUrl: 'https://picsum.photos/seed/profile-artwork-02/1200/800',
      likesCount: 98,
      medium: 'Oil and mixed media',
      dimensions: '27.56in x 35.43in',
      actionLabel: 'Buy now',
    },
    {
      id: 'p3',
      title: 'Monochrome Dream',
      artistName: 'Tara Astari Kasenda',
      priceLabel: '$2,400',
      coverUrl: 'https://picsum.photos/seed/profile-artwork-03/1000/1000',
      likesCount: 126,
      medium: 'Charcoal and oil on canvas',
      dimensions: '15.75in x 23.62in',
      actionLabel: 'Send offer',
    },
    {
      id: 'p4',
      title: 'Fragments of Light',
      artistName: 'Tara Astari Kasenda',
      priceLabel: '$3,800',
      coverUrl: 'https://picsum.photos/seed/profile-artwork-04/800/1200',
      likesCount: 205,
      medium: 'Oil on canvas',
      dimensions: '30.00in x 30.00in',
      actionLabel: 'Buy now',
      isSold: true,
    },
    {
      id: 'p5',
      title: 'Everyday Wonders',
      artistName: 'Tara Astari Kasenda',
      priceLabel: '$1,850',
      coverUrl: 'https://picsum.photos/seed/profile-artwork-05/1400/900',
      likesCount: 88,
      medium: 'Mixed media on board',
      dimensions: '11.81in x 11.81in',
      actionLabel: 'Send offer',
    },
    {
      id: 'p6',
      title: 'Midnight Flora',
      artistName: 'Tara Astari Kasenda',
      priceLabel: '$5,100',
      coverUrl: 'https://picsum.photos/seed/profile-artwork-06/1000/1400',
      likesCount: 174,
      medium: 'Oil on canvas',
      dimensions: '28.00in x 28.00in',
      actionLabel: 'Buy now',
    },
  ],
  moments: profileMoments,
  moodboards: [
    {
      id: 'b1',
      title: 'Private Moodboard',
      author: 'Huu Phan',
      authorAvatarUrl: 'https://placehold.co/64x64.png?text=HP',
      featuredArtist: 'Ernest Compta Llinas',
      coverUrl: 'https://placehold.co/400x260.png?text=Moodboard+01',
      secondaryCoverUrl: 'https://placehold.co/320x220.png?text=Saved+02',
      artworkCoverUrls: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      ],
      isPrivate: true,
    },
    {
      id: 'b2',
      title: 'Layered Botanics',
      author: 'Huu Phan',
      authorAvatarUrl: 'https://placehold.co/64x64.png?text=HP',
      featuredArtist: 'Ernest Compta Llinas',
      coverUrl: 'https://placehold.co/400x260.png?text=Moodboard+02',
      secondaryCoverUrl: 'https://placehold.co/320x220.png?text=Saved+03',
      artworkCoverUrls: [
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      id: 'b3',
      title: 'Muted Tones',
      author: 'Huu Phan',
      authorAvatarUrl: 'https://placehold.co/64x64.png?text=HP',
      featuredArtist: 'Ernest Compta Llinas',
      coverUrl: 'https://placehold.co/400x260.png?text=Moodboard+03',
      secondaryCoverUrl: 'https://placehold.co/320x220.png?text=Saved+04',
      artworkCoverUrls: [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  ],
}
