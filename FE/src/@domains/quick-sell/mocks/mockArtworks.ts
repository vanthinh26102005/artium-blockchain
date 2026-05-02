// Mock artworks for PR2 - Replace with API in PR3+

export type MockArtwork = {
  id: string
  name: string
  imageUrl: string
  artistName: string
  price: number
  year?: string
  materials?: string
  dimensions?: string
}

export const mockArtworks: MockArtwork[] = [
  {
    id: 'artwork-001',
    name: 'test location khác nữa',
    imageUrl: '/images/placeholder-artwork.jpg',
    artistName: 'Thinh Van',
    price: 1500,
    year: '2000',
    materials: 'oil',
    dimensions: '12 × 34 × 56 in',
  },
  {
    id: 'artwork-002',
    name: 'test location khác',
    imageUrl: '/images/placeholder-artwork.jpg',
    artistName: 'Thinh Van',
    price: 2500,
    year: '2000',
    materials: 'oil',
    dimensions: '12 × 34 × 56 in',
  },
  {
    id: 'artwork-003',
    name: 'jakarta bi loi',
    imageUrl: '/images/placeholder-artwork.jpg',
    artistName: 'Thinh Van',
    price: 3500,
    year: '2000',
    materials: 'oil',
    dimensions: '12 × 34 × 56 in',
  },
  {
    id: 'artwork-004',
    name: '123123',
    imageUrl: '/images/placeholder-artwork.jpg',
    artistName: 'Thinh Van',
    price: 4000,
    year: '2000',
    materials: 'oil',
    dimensions: '12 × 34 × 56 in',
  },
  {
    id: 'artwork-005',
    name: 'test location',
    imageUrl: '/images/placeholder-artwork.jpg',
    artistName: 'Thinh Van',
    price: 5000,
    year: '2000',
    materials: 'oil',
    dimensions: '12 × 34 × 56 in',
  },
  {
    id: 'artwork-006',
    name: 'test mexico',
    imageUrl: '/images/placeholder-artwork.jpg',
    artistName: 'Thinh Van',
    price: 6000,
    year: '2000',
    materials: 'oil',
    dimensions: '12 × 12 × 12 in',
  },
]
