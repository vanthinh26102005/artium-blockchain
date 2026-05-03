// next
import Image from 'next/image'
import Link from 'next/link'

// @domains - profile
import { MomentDetailArtwork } from '@domains/profile/types'

// local
import { CollapsibleSection } from './CollapsibleSection'

type MomentArtworkSectionProps = {
  artwork?: MomentDetailArtwork
  username: string
}

/**
 * MomentArtworkSection - React component
 * @returns React element
 */
export const MomentArtworkSection = ({ artwork, username }: MomentArtworkSectionProps) => {
  return (
    <CollapsibleSection title="Artwork" defaultOpen={false}>
      {!artwork ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No artwork linked to this moment yet.</p>
        </div>
      ) : (
        <Link
          href={`/profile/${username}/artworks/${artwork.id}`}
          className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex gap-3">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={artwork.coverUrl}
                alt={artwork.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="line-clamp-2 text-lg font-semibold text-slate-900">{artwork.title}</h4>
              <p className="text-sm text-slate-600">{artwork.artistName}</p>
              <p className="text-base font-bold text-slate-900">{artwork.priceLabel}</p>
            </div>
          </div>
        </Link>
      )}
    </CollapsibleSection>
  )
}
