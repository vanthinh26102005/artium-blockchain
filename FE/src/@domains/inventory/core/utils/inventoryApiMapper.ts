import type { ArtworkApiItem } from '@shared/apis/artworkApis'
import type { ArtworkFolderApiItem } from '@shared/apis/artworkFolderApis'
import type { InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import type { InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

const FALLBACK_THUMBNAIL = '/images/logo/logo-light-mode.png'

const normalizePrice = (value?: number | string | null) => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    return value
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const resolveThumbnail = (item: ArtworkApiItem) => {
  if (item.thumbnailUrl && item.thumbnailUrl.length > 0) {
    return item.thumbnailUrl
  }

  const firstImage = item.images?.[0]
  return firstImage?.secureUrl || firstImage?.url || FALLBACK_THUMBNAIL
}

const resolveDisplayStatus = (item: ArtworkApiItem) => {
  if (item.displayStatus) {
    return item.displayStatus
  }

  return item.status === 'DRAFT' ? 'Draft' : 'Hidden'
}

export const mapArtworkToInventory = (item: ArtworkApiItem): InventoryArtwork => {
  return {
    id: item.id,
    title: item.title,
    creatorName: item.creatorName ?? 'Unknown artist',
    status: resolveDisplayStatus(item),
    isPublished: item.isPublished ?? false,
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
  return {
    id: item.id,
    name: item.name,
    isHidden: item.isHidden ?? false,
    itemCount: item.itemCount,
    parentId: item.parentId ?? null,
    children: item.children?.map(mapFolderToInventory),
  }
}
