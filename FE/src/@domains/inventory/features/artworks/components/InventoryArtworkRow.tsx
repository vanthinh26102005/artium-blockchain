import React from 'react'
import Image from 'next/image'
import { GripVertical, ImageIcon } from 'lucide-react'

import { Checkbox } from '@shared/components/ui/checkbox'
import { cn } from '@shared/lib/utils'
import { OrderStatusBadge } from '@domains/orders/components/OrderStatusBadge'
import { InventoryArtworkActionMenu } from '@domains/inventory/features/artworks/components/InventoryArtworkActionMenu'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'

/**
 * formatInventoryPrice - Utility function
 * @returns void
 */
const formatInventoryPrice = (price?: number) => {
  if (typeof price !== 'number') {
    return 'Not priced'
  }
  return `US$\${price.toLocaleString('en-US')}`
}

export type InventoryArtworkRowProps = {
  artwork: InventoryArtwork
  nestLevel?: number
  isSelected: boolean
  isDragging: boolean
  folderLabel: string | undefined
  onToggle: (id: string) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onEdit: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
}

export const InventoryArtworkRow = ({
  artwork,
  nestLevel = 0,
/**
 * InventoryArtworkRow - React component
 * @returns React element
 */
  isSelected,
  isDragging,
  folderLabel,
  onToggle,
  onOpenDetails,
  onDragStart,
  onDragEnd,
  onEdit,
  onToggleProfileVisibility,
  onMove,
  onStartAuction,
  onDelete,
}: InventoryArtworkRowProps) => {
  const visibilityLabel = artwork.status === 'Hidden' ? 'Hidden in profile' : 'Draft'
  const lifecycleLabel = artwork.auctionLifecycle ? 'Auction status' : 'Listing status'
  const lifecycleValue = artwork.auctionLifecycle ? null : 'Not listed'

  const handleOpenArtwork = () => {
    onOpenDetails(artwork)
/**
 * visibilityLabel - Utility function
 * @returns void
 */
  }

  const handleArtworkKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
/**
 * lifecycleLabel - Utility function
 * @returns void
 */
      event.preventDefault()
      handleOpenArtwork()
    }
  }
/**
 * lifecycleValue - Utility function
 * @returns void
 */

  return (
    <div
      draggable
      role="button"
/**
 * handleOpenArtwork - Utility function
 * @returns void
 */
      tabIndex={0}
      onClick={handleOpenArtwork}
      onKeyDown={handleArtworkKeyDown}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ marginLeft: nestLevel > 0 ? `\${nestLevel * 20}px` : undefined }}
      className={cn(
/**
 * handleArtworkKeyDown - Utility function
 * @returns void
 */
        'group flex cursor-pointer flex-col gap-5 rounded-[28px] border bg-white p-5 transition outline-none md:flex-row md:items-start md:justify-between',
        isSelected
          ? 'border-blue-300 ring-2 ring-blue-500/15'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/20',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <div className="flex min-w-0 gap-4">
        <div className="flex shrink-0 items-start gap-3">
          <button
            type="button"
            aria-label={`Drag \${artwork.title}`}
            className="mt-7 cursor-grab text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div
            className="mt-7"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(artwork.id)}
              aria-label={`Select \${artwork.title}`}
              className="h-5 w-5 border-slate-300 bg-white data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
            />
          </div>

          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
            {artwork.thumbnailUrl ? (
              <Image
                src={artwork.thumbnailUrl}
                alt={artwork.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-7 w-7 text-slate-300" />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
              {artwork.title}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                artwork.status === 'Hidden'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-50 text-amber-700',
              )}
            >
              {visibilityLabel}
            </span>
            {artwork.auctionLifecycle ? (
              <OrderStatusBadge status={artwork.auctionLifecycle.status} />
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-slate-900">
            {artwork.creatorName || 'Unknown artist'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {folderLabel ?? 'Uncategorized'} • {formatInventoryPrice(artwork.price)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-5 md:block md:text-right">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Price
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatInventoryPrice(artwork.price)}
          </p>
        </div>
        <div className="md:mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {lifecycleLabel}
          </p>
          {artwork.auctionLifecycle ? (
            <div className="mt-1 flex justify-end">
              <OrderStatusBadge status={artwork.auctionLifecycle.status} />
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-slate-600">{lifecycleValue}</p>
          )}
        </div>
        <div className="md:mt-4">
          <InventoryArtworkActionMenu
            artwork={artwork}
            onOpenDetails={onOpenDetails}
            onEdit={onEdit}
            onToggleProfileVisibility={onToggleProfileVisibility}
            onMove={onMove}
            onStartAuction={onStartAuction}
            onDelete={onDelete}
            triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            contentClassName="w-64 rounded-2xl border-slate-200 bg-white p-2 shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
