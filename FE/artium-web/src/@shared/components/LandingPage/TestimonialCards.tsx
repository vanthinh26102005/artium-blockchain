import type { ReactNode } from 'react'
import Image from 'next/image'
import { Card } from '@shared/components/ui/card'
import { Text } from './typography'

// -- types --
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

// -- components --

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
      className="flex h-[273px] w-[183px] flex-col space-y-[20px] rounded-[16px] border-none p-4 lg:!h-[415px] lg:!w-[219px] lg:space-y-[15px] lg:!rounded-[16.7px] lg:p-[10px] lg:pt-[20px]"
      style={{ backgroundColor }}
    >
      {/* -- info -- */}
      <div className="font-inter lg:font-monument-grotes space-y-1 self-stretch lg:space-y-0">
        <Text className="text-center text-[16px] leading-[150%] font-semibold !text-white lg:text-[18px] lg:leading-[120%] lg:font-bold">
          {name}
        </Text>
        <Text className="text-center text-[12px] leading-[130%] font-normal !text-white lg:text-[16px] lg:leading-[120%]">
          {location}
        </Text>
      </div>

      {/* -- video -- */}
      <div className="h-[177px] w-[151px] overflow-hidden rounded-[12px] lg:h-[329px] lg:w-[199px] lg:rounded-t-none lg:rounded-b-[12.52px]">
        <video
          src={videoSrc}
          className="h-full w-full object-cover"
          controls
          muted
          autoPlay
          loop
          playsInline
        />
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
      className="font-inter lg:font-monument-grotes flex h-[273px] w-[275px] flex-col space-y-[20px] rounded-[16px] border-none px-4 py-8 lg:!h-[415px] lg:!w-[350px] lg:space-y-[16.7px] lg:!rounded-[16.7px] lg:p-[33.4px]"
      style={{ backgroundColor }}
    >
      {/* -- quote -- */}
      <p className="h-[250px] text-[12px] leading-[125%] text-[#1A1A1A] lg:text-[20px] lg:text-black">
        {quote}
      </p>

      {/* -- footer -- */}
      <div className="flex items-center space-x-4 pt-[16.7px]">
        <div className="relative h-[40px] w-[40px] flex-shrink-0 overflow-hidden rounded-full lg:h-[66.7px] lg:w-[66.7px]">
          {avatarSrc && (
            <Image src={avatarSrc} alt={name || 'Artist avatar'} fill className="object-cover" />
          )}
        </div>

        <div>
          <Text className="self-stretch text-[14px] leading-[125%] font-normal text-[#1A1A1A] lg:text-[18px] lg:font-bold lg:text-black">
            {name}
          </Text>
          <Text className="self-stretch text-[12px] leading-[125%] font-normal text-[#767676] lg:text-[16px]">
            {location}
          </Text>
        </div>
      </div>
    </Card>
  )
}
