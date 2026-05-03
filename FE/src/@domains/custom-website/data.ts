export interface Template {
  id: string
  name: string
  description: string
  previewImage: string
  isPro?: boolean
  isGrowth?: boolean
  demoUrl?: string
}

/**
 * templates - Utility function
 * @returns void
 */
export const templates: Template[] = [
  {
    id: 'axis',
    name: 'Axis',
    description:
      'A structured layout where your art and story run in sync. It emphasizes alignment, clarity, and flow. Ideal for artists with visual rhythm.',
    previewImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=450&fit=crop',
    isPro: false,
    demoUrl: '/templates/preview/axis',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description:
      'A minimalist, high-contrast layout with bold typography. Best for artists seeking a sharp and timeless look with maximum focus on their work.',
    previewImage:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=450&fit=crop',
    isPro: true,
    demoUrl: '/templates/preview/monochrome',
  },
  {
    id: 'mode',
    name: 'Mode',
    description:
      'A dynamic, waterfall layout designed for creators who want their work to feel both curated and alive. Stylish, endlessly scrollable, and optimized for visual discovery.',
    previewImage:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=450&fit=crop',
    isGrowth: true,
    demoUrl: '/templates/preview/mode',
  },
  {
    id: 'gallery-wall',
    name: 'Gallery Wall',
    description:
      'Designed for artists who want impact at first glance, with artworks displayed modularly in a dynamic, endlessly scrollable floating wall. Optimized for visual discovery.',
    previewImage: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=450&fit=crop',
    isPro: true,
    demoUrl: '/templates/preview/gallery-wall',
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    description:
      'A clean, focused layout that puts your art front and center. Ideal for galleries or creators who value simplicity, balance, and elegance.',
    previewImage:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=450&fit=crop',
    isPro: false,
    demoUrl: '/templates/preview/minimalist',
  },
  {
    id: 'classic',
    name: 'The Classic',
    description:
      'A timeless layout that blends structured design with bold typography. Great for artists and galleries seeking for clarity with showcase.',
    previewImage:
      'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=600&h=450&fit=crop',
    isGrowth: true,
    demoUrl: '/templates/preview/classic',
  },
]
