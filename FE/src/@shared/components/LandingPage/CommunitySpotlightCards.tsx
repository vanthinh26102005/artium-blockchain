import Image from 'next/image'
import { Card, CardContent } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'
import { Heading, Text } from './typography'
import { SpotlightBlock, SpotlightItem } from './constants'

export const CARD_HEIGHT = 420
export const SPLIT_WIDTH = 240
export const FULL_WIDTH = 320
const SPLIT_TOP_LARGE = '70%'
const SPLIT_TOP_SMALL = '30%'
const SPLIT_BOTTOM_LARGE = '70%'
const SPLIT_BOTTOM_SMALL = '30%'

export const SpotlightBlockCard = ({
  block,
  height,
  className,
}: {
  block: SpotlightBlock
  height: string
  className?: string
}) => {
  if (!block.highlightNumber && !block.image) return null

  if (block.highlightNumber) {
    return (
      <Card className={cn('border-none bg-transparent shadow-none', className)} style={{ height }}>
        <div
          className="flex h-full w-full flex-col justify-between rounded-xl p-3"
          style={{ backgroundColor: block.highlightBackgroundColor }}
        >
          <Heading size="h3" className="text-[28px] leading-tight font-semibold lg:text-[40px]">
            {block.highlightNumber}
          </Heading>
          <Text className="text-sm leading-tight font-medium text-black lg:text-[18px] lg:font-normal">
            {block.highlightText}
          </Text>
        </div>
      </Card>
    )
  }

  const imageSrc = block.image
  if (!imageSrc) return null

  return (
    <Card className={cn('border-none bg-transparent shadow-none', className)} style={{ height }}>
      <CardContent className="relative h-full w-full overflow-hidden rounded-xl p-0">
        <Image
          src={imageSrc}
          alt={block.name || 'Spotlight Artist'}
          fill
          className="object-cover object-center"
          sizes="200px"
        />
        {block.name && (
          <Text className="absolute bottom-2 left-2 z-10 text-[16px] leading-5 font-semibold whitespace-pre-line text-white drop-shadow">
            {block.name}
          </Text>
        )}
      </CardContent>
    </Card>
  )
}

export const SpotlightCard = ({
  artist,
  className,
}: {
  className?: string
  artist: SpotlightItem
}) => {
  if (artist.layout === 'full') {
    const full = artist.full

    if (!full?.image) return null

    return (
      <Card
        className={cn(
          'relative overflow-hidden rounded-[14px] border-none bg-transparent shadow-none',
          className,
        )}
        style={{ height: CARD_HEIGHT, minWidth: FULL_WIDTH, maxWidth: FULL_WIDTH }}
      >
        <CardContent className="relative h-full w-full p-0">
          <Image
            src={full.image}
            alt={full.name || 'Spotlight Artist'}
            fill
            className="object-cover object-center"
            sizes={`${FULL_WIDTH}px`}
          />
          {full.name && (
            <Text className="absolute bottom-3 left-3 z-10 text-base font-semibold text-white drop-shadow">
              {full.name}
            </Text>
          )}
        </CardContent>
      </Card>
    )
  }

  const top = artist.top
  const bottom = artist.bottom
  const isLargeTop = artist.layout === 'split-large-top'

  if (!top || !bottom) return null

  return (
    <div
      className={cn('flex flex-col gap-3 rounded-xl bg-transparent', className, artist.className)}
      style={{ height: CARD_HEIGHT, minWidth: SPLIT_WIDTH, maxWidth: SPLIT_WIDTH }}
    >
      <SpotlightBlockCard
        block={top}
        className={artist.top?.className}
        height={isLargeTop ? SPLIT_TOP_LARGE : SPLIT_TOP_SMALL}
      />

      <SpotlightBlockCard
        block={bottom}
        className={artist.bottom?.className}
        height={isLargeTop ? SPLIT_BOTTOM_SMALL : SPLIT_BOTTOM_LARGE}
      />
    </div>
  )
}
