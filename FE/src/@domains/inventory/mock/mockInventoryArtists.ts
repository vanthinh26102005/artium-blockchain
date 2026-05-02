import { type InventoryArtist } from '@domains/inventory/features/artists/types/inventoryArtist'

export const mockInventoryArtists: InventoryArtist[] = [
  {
    id: 'artist-1',
    name: 'Thinh Văn',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    artworkCount: 22,
    artworkThumbnails: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
      'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400',
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400',
    ],
    isVerified: false,
    profileHref: '/profile/artist-1',
  },
  {
    id: 'artist-2',
    name: 'Shyevin sng',
    artworkCount: 1,
    artworkThumbnails: [],
    isVerified: true,
    profileHref: '/profile/artist-2',
  },
  {
    id: 'artist-3',
    name: 'Team Artium',
    artworkCount: 1,
    artworkThumbnails: [],
    isVerified: true,
    profileHref: '/profile/artist-3',
  },
]
