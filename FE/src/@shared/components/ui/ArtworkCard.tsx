import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Artwork } from '@shared/types'

interface ArtworkCardProps {
  artwork: Artwork
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  return (
    <Link href={`/artworks/${artwork.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={artwork.coverUrl}
            alt={artwork.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="truncate text-lg font-semibold text-gray-900">{artwork.title}</h3>
          <p className="mb-2 text-sm text-gray-500">{artwork.artistName}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600">
              {artwork.priceLabel}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              ƒT {artwork.likesCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
