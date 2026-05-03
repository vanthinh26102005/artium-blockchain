export interface DiscoverProfile {
  id: string
  username: string
  fullName: string
  role: string
  location: string
  statsLabel: string
  avatarUrl: string
  coverImageSmall?: string
  isVerified?: boolean
  isFollowing?: boolean
  collage: string[]
}

/**
 * mockProfiles - Utility function
 * @returns void
 */
export const mockProfiles: DiscoverProfile[] = [
  {
    id: 'pr-001',
    username: 'furui',
    fullName: 'Furui Sun',
    role: 'Painter',
    location: 'Miami, FL',
    statsLabel: '99% works sold',
    avatarUrl: 'https://i.pravatar.cc/96?img=51',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-01/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-01/180/180',
      'https://picsum.photos/seed/profile-02/180/180',
      'https://picsum.photos/seed/profile-03/180/180',
    ],
  },
  {
    id: 'pr-002',
    username: 'dillon',
    fullName: 'Dillon Rannou',
    role: 'Ultracontemporary Caribbean',
    location: 'Paris, FR',
    statsLabel: '200+ collectors',
    avatarUrl: 'https://i.pravatar.cc/96?img=52',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-02/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-04/180/180',
      'https://picsum.photos/seed/profile-05/180/180',
      'https://picsum.photos/seed/profile-06/180/180',
    ],
  },
  {
    id: 'pr-003',
    username: 'laura',
    fullName: 'Laura Burress',
    role: 'Artist',
    location: 'Austin, TX',
    statsLabel: '40 works listed',
    avatarUrl: 'https://i.pravatar.cc/96?img=53',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-03/240/140',
    isVerified: true,
    isFollowing: true,
    collage: [
      'https://picsum.photos/seed/profile-07/180/180',
      'https://picsum.photos/seed/profile-08/180/180',
      'https://picsum.photos/seed/profile-09/180/180',
    ],
  },
  {
    id: 'pr-004',
    username: 'marian',
    fullName: 'Marian Pham',
    role: 'Narrative artist',
    location: 'Portland, OR',
    statsLabel: 'In 12 group shows',
    avatarUrl: 'https://i.pravatar.cc/96?img=54',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-04/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-10/180/180',
      'https://picsum.photos/seed/profile-11/180/180',
      'https://picsum.photos/seed/profile-12/180/180',
    ],
  },
  {
    id: 'pr-005',
    username: 'aelin',
    fullName: 'Aelin AquaSoul',
    role: 'Abstract creator',
    location: 'Los Angeles, CA',
    statsLabel: 'Museum featured',
    avatarUrl: 'https://i.pravatar.cc/96?img=55',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-05/240/140',
    isVerified: true,
    isFollowing: true,
    collage: [
      'https://picsum.photos/seed/profile-13/180/180',
      'https://picsum.photos/seed/profile-14/180/180',
      'https://picsum.photos/seed/profile-15/180/180',
    ],
  },
  {
    id: 'pr-006',
    username: 'mauricio',
    fullName: 'Mauricio Russo Camhi',
    role: 'Kinetic Sculpture Artist',
    location: 'Madrid, ES',
    statsLabel: '12 commissions',
    avatarUrl: 'https://i.pravatar.cc/96?img=56',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-06/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-16/180/180',
      'https://picsum.photos/seed/profile-17/180/180',
      'https://picsum.photos/seed/profile-18/180/180',
    ],
  },
  {
    id: 'pr-007',
    username: 'renata',
    fullName: 'Renata Rolefes Art',
    role: 'Colorist',
    location: 'Kingston, JM',
    statsLabel: '45 works sold',
    avatarUrl: 'https://i.pravatar.cc/96?img=57',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-07/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-19/180/180',
      'https://picsum.photos/seed/profile-20/180/180',
      'https://picsum.photos/seed/profile-21/180/180',
    ],
  },
  {
    id: 'pr-008',
    username: 'ricky',
    fullName: 'Ricky Hawkins',
    role: 'Emerging Contemporary Artist',
    location: 'Detroit, MI',
    statsLabel: '12k followers',
    avatarUrl: 'https://i.pravatar.cc/96?img=58',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-08/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-22/180/180',
      'https://picsum.photos/seed/profile-23/180/180',
      'https://picsum.photos/seed/profile-24/180/180',
    ],
  },
  {
    id: 'pr-009',
    username: 'moris',
    fullName: 'Moris Artist',
    role: 'Architect and Visual Artist',
    location: 'Mexico City, MX',
    statsLabel: 'Studio visits open',
    avatarUrl: 'https://i.pravatar.cc/96?img=59',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-09/240/140',
    isVerified: true,
    isFollowing: true,
    collage: [
      'https://picsum.photos/seed/profile-25/180/180',
      'https://picsum.photos/seed/profile-26/180/180',
      'https://picsum.photos/seed/profile-27/180/180',
    ],
  },
  {
    id: 'pr-010',
    username: 'latifah',
    fullName: 'Latifah A',
    role: 'Visual Artist',
    location: 'Chicago, IL',
    statsLabel: 'New collection',
    avatarUrl: 'https://i.pravatar.cc/96?img=60',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-10/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-28/180/180',
      'https://picsum.photos/seed/profile-29/180/180',
      'https://picsum.photos/seed/profile-30/180/180',
    ],
  },
  {
    id: 'pr-011',
    username: 'tafy',
    fullName: 'Tafy LaPlanche',
    role: 'Museum Featured Visual Artist',
    location: 'Atlanta, GA',
    statsLabel: 'Artist residency',
    avatarUrl: 'https://i.pravatar.cc/96?img=61',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-11/240/140',
    isVerified: true,
    isFollowing: false,
    collage: [
      'https://picsum.photos/seed/profile-31/180/180',
      'https://picsum.photos/seed/profile-32/180/180',
      'https://picsum.photos/seed/profile-33/180/180',
    ],
  },
  {
    id: 'pr-012',
    username: 'mario',
    fullName: 'Mario Berry Jr',
    role: 'Creative Evolution',
    location: 'New York, NY',
    statsLabel: 'Collector favorites',
    avatarUrl: 'https://i.pravatar.cc/96?img=62',
    coverImageSmall: 'https://picsum.photos/seed/profile-cover-12/240/140',
    isVerified: true,
    isFollowing: true,
    collage: [
      'https://picsum.photos/seed/profile-34/180/180',
      'https://picsum.photos/seed/profile-35/180/180',
      'https://picsum.photos/seed/profile-36/180/180',
    ],
  },
]
