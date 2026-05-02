import artworkApis from '@shared/apis/artworkApis'
import type { OrderItemResponse } from '@shared/apis/orderApis'

const resolveArtworkImage = (artwork: Awaited<ReturnType<typeof artworkApis.getArtworkById>>) =>
  artwork?.images?.[0]?.url || artwork?.images?.[0]?.secureUrl || artwork?.thumbnailUrl || null

const needsArtworkHydration = (item: OrderItemResponse) =>
  !item.artworkTitle?.trim() || !item.artworkImageUrl

export const hydrateOrderItems = async (
  items: OrderItemResponse[],
): Promise<OrderItemResponse[]> => {
  const hydratedEntries = await Promise.all(
    items.map(async (item) => {
      if (!needsArtworkHydration(item)) {
        return item
      }

      try {
        const artwork = await artworkApis.getArtworkById(item.artworkId)
        if (!artwork) {
          return item
        }

        return {
          ...item,
          artworkTitle: item.artworkTitle?.trim() || artwork.title || 'Artwork',
          artworkImageUrl: item.artworkImageUrl || resolveArtworkImage(artwork),
        }
      } catch {
        return item
      }
    }),
  )

  return hydratedEntries
}
