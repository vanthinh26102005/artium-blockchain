export type InspireLayoutVariant = 'image' | 'text'

export interface DiscoverInspireItem {
  id: string
  categoryLabel: string
  title: string
  subtitle: string
  date: string
  layoutVariant: InspireLayoutVariant
  imageUrl?: string
  avatarUrl?: string
}

// @domains - editorial
import { EDITORIAL_ITEMS } from '@domains/editorial/data/editorials'

// Mock avatar images
/**
 * MOCK_AVATARS - React component
 * @returns React element
 */
const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
]

export const mockInspire: DiscoverInspireItem[] = EDITORIAL_ITEMS.slice(0, 50).map(
  (item, index) => ({
    id: item.id,
    /**
     * mockInspire - Utility function
     * @returns void
     */
    categoryLabel: item.category || 'Editorial',
    title: item.title,
    subtitle: item.author,
    date: new Date(item.publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    layoutVariant: 'image',
    imageUrl: item.imageUrl,
    avatarUrl: MOCK_AVATARS[index % MOCK_AVATARS.length],
  }),
)
