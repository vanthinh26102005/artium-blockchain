import type { ReactNode } from 'react'
import Image from 'next/image'
import { Card } from '@shared/components/ui/card'

export type ArtistCardBase = {
  name?: string
  location?: string
  className?: string
}

export type VideoCard = ArtistCardBase & {
  type: 'video'
  videoSrc: string
  backgroundColor: string
}

export type QuoteCard = ArtistCardBase & {
  type: 'quote'
  quote: string | ReactNode
  avatarSrc?: string
  backgroundColor: string
}

export type ArtistCard = VideoCard | QuoteCard

type TestimonialVideoCardProps = {
  name?: string
  location?: string
  videoSrc?: string
  backgroundColor: string
}

export const TestimonialVideoCard = ({
  name,
  location,
  videoSrc,
  backgroundColor,
}: TestimonialVideoCardProps) => {
  return (
    <Card
      className="flex h-[360px] w-[248px] shrink-0 flex-col gap-4 rounded-[8px] border border-white/12 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md lg:h-[430px] lg:w-[300px] lg:p-4"
      style={{ backgroundColor }}
    >
      <div className="font-inter space-y-1 self-stretch">
        <p className="text-center text-base leading-6 font-semibold text-white lg:text-lg">
          {name}
        </p>
        <p className="text-center text-sm leading-5 text-white/72 lg:text-base">{location}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[6px] border border-white/16 bg-black">
        {videoSrc && (
          <video
            src={videoSrc}
            className="h-full w-full object-cover"
            aria-label={`${name ?? 'Artist'} testimonial video`}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        )}
      </div>
    </Card>
  )
}

type ArtistQuoteCardProps = {
  quote?: ReactNode
  name?: string
  location?: string
  avatarSrc?: string
  backgroundColor: string
}

export const ArtistQuoteCard = ({
  quote,
  name,
  location,
  avatarSrc,
  backgroundColor,
}: ArtistQuoteCardProps) => {
  return (
    <Card
      className="font-inter flex h-[360px] w-[300px] shrink-0 flex-col justify-between gap-6 rounded-[8px] border border-black/10 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-md lg:h-[430px] lg:w-[390px] lg:p-8"
      style={{ backgroundColor }}
    >
      <p className="overflow-hidden text-[15px] leading-6 text-[#1A1A1A] lg:text-[19px] lg:leading-8 lg:text-black">
        {quote}
      </p>

      <div className="flex items-center gap-4 border-t border-black/10 pt-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-black/10 lg:h-14 lg:w-14">
          {avatarSrc && (
            <Image src={avatarSrc} alt={name || 'Artist avatar'} fill className="object-cover" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm leading-5 font-semibold text-[#1A1A1A] lg:text-base lg:text-black">
            {name}
          </p>
          <p className="truncate text-xs leading-5 text-[#767676] lg:text-sm">{location}</p>
        </div>
      </div>
    </Card>
  )
}
