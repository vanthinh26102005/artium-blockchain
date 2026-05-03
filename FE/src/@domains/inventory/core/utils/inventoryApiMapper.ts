import type { ArtworkApiItem } from '@shared/apis/artworkApis'
import type { ArtworkFolderApiItem } from '@shared/apis/artworkFolderApis'
import type { InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import type { InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

/**
 * FALLBACK_THUMBNAIL - React component
 * @returns React element
 */
const FALLBACK_THUMBNAIL = '/images/logo/logo-light-mode.png'

const normalizePrice = (value?: number | string | null) => {
  if (value === null || value === undefined) {
    return undefined
/**
 * normalizePrice - Utility function
 * @returns void
 */
  }

  if (typeof value === 'number') {
    return value
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const resolveThumbnail = (item: ArtworkApiItem) => {
  if (item.thumbnailUrl && item.thumbnailUrl.length > 0) {
/**
 * parsed - Utility function
 * @returns void
 */
    return item.thumbnailUrl
  }

  const firstImage = item.images?.[0]
  return firstImage?.secureUrl || firstImage?.url || FALLBACK_THUMBNAIL
}

/**
 * resolveThumbnail - Utility function
 * @returns void
 */
const resolveDisplayStatus = (item: ArtworkApiItem) => {
  if (item.displayStatus) {
    return item.displayStatus
  }

  return item.status === 'DRAFT' ? 'Draft' : 'Hidden'
}

/**
 * firstImage - Utility function
 * @returns void
 */
export const mapArtworkToInventory = (item: ArtworkApiItem): InventoryArtwork => {
  return {
    id: item.id,
    title: item.title,
    creatorName: item.creatorName ?? 'Unknown artist',
    status: resolveDisplayStatus(item),
    isPublished: item.isPublished ?? false,
/**
 * resolveDisplayStatus - Utility function
 * @returns void
 */
    auctionLifecycle: item.auctionLifecycle ?? null,
    backendStatus: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    price: normalizePrice(item.price),
    thumbnailUrl: resolveThumbnail(item),
    folderId: item.folder?.id ?? item.folderId ?? undefined,
  }
}

export const mapFolderToInventory = (item: ArtworkFolderApiItem): InventoryFolder => {
/**
 * mapArtworkToInventory - Utility function
 * @returns void
 */
  return {
    id: item.id,
    name: item.name,
    isHidden: item.isHidden ?? false,
    itemCount: item.itemCount,
    parentId: item.parentId ?? null,
    children: item.children?.map(mapFolderToInventory),
  }
}

/**
 * mapFolderToInventory - Utility function
 * @returns void
 */