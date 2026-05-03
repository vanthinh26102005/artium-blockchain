// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

/**
 * mockInventoryFolders - Utility function
 * @returns void
 */
export const mockInventoryFolders: InventoryFolder[] = [
  {
    id: 'folder-01',
    name: 'New Releases',
    description: 'Fresh work for upcoming drops.',
  },
  {
    id: 'folder-02',
    name: 'Gallery Picks',
    description: 'Shortlist for gallery review.',
  },
  {
    id: 'folder-03',
    name: 'Collector Hold',
    description: 'Reserved for collectors.',
  },
  {
    id: 'folder-04',
    name: 'Studio Drafts',
    description: 'Works in progress.',
  },
  {
    id: 'folder-05',
    name: 'Archived',
    description: 'Previous season archive.',
  },
  {
    id: 'folder-06',
    name: 'Press Kit',
    description: 'Approved images for press.',
  },
]
