import { ArtworkStatus, TagStatus } from '@app/common';
import { Tag, Artwork, ArtworkFolder } from '../../domain';

// Replace with actual seller ID from identity service
const SELLER_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Placeholder

export const tagsSeed: Partial<Tag>[] = [
  {
    name: 'Abstract',
    status: TagStatus.SYSTEM,
  },
  {
    name: 'Modern',
    status: TagStatus.SYSTEM,
  },
  {
    name: 'Contemporary',
    status: TagStatus.CUSTOM,
    sellerId: SELLER_ID,
  },
];

// Artworks are created first without folder assignment
export const artworksSeed: Partial<Artwork>[] = [
  {
    title: 'Sunset Over the Ocean',
    description: 'A beautiful painting of a sunset over the ocean.',
    creationYear: 2023,
    price: '1500.00',
    currency: 'USD',
    status: ArtworkStatus.SOLD,
    isPublished: true,
    sellerId: SELLER_ID,
    quantity: 1,
  },
  {
    title: 'City at Night',
    description: 'An abstract view of a bustling city at night.',
    creationYear: 2022,
    price: '2500.00',
    currency: 'USD',
    status: ArtworkStatus.DRAFT,
    isPublished: false,
    sellerId: SELLER_ID,
    quantity: 1,
  },
];

// Folders are created after artworks
export const artworkFoldersSeed: Partial<ArtworkFolder>[] = [
  {
    name: 'My Collection',
    sellerId: SELLER_ID,
  },
  {
    name: 'Sold Items',
    sellerId: SELLER_ID,
  },
];

// Mapping of artwork titles to folder names for assignment after both are created
export const artworkFolderAssignments: {
  artworkTitle: string;
  folderName: string;
}[] = [
  { artworkTitle: 'Sunset Over the Ocean', folderName: 'Sold Items' },
  { artworkTitle: 'City at Night', folderName: 'My Collection' },
];
