'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@shared/lib/utils'
import { ProfileArtwork } from '@domains/profile/types'

type ArtworkCardCompactProps = {
  artwork: ProfileArtwork
  className?: string
}

/**
 * ArtworkCardCompact - React component
 * @returns React element
 */
export const ArtworkCardCompact = ({ artwork, className }: ArtworkCardCompactProps) => {
  return (
    <Link
      href={`/artworks/${artwork.id}`}
      className={cn('group flex w-[200px] shrink-0 flex-col', className)}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={artwork.coverUrl}
          alt={artwork.title}
          fill
          sizes="200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold text-slate-900">{artwork.priceLabel}</p>
        <h4 className="truncate text-sm font-medium text-slate-800">{artwork.title}</h4>
        <p className="truncate text-xs text-slate-500">{artwork.artistName}</p>
        <p className="truncate text-xs text-slate-400">
          {artwork.medium}
          {artwork.dimensions && ` | ${artwork.dimensions}`}
        </p>
      </div>
    </Link>
  )
}
