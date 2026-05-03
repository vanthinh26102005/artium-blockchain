import Image from 'next/image'
import { Card, CardContent } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'
import { Heading, Text } from './typography'
import { SpotlightBlock, SpotlightItem } from './constants'

/**
 * CARD_HEIGHT - React component
 * @returns React element
 */
export const CARD_HEIGHT = 420
export const SPLIT_WIDTH = 240
export const FULL_WIDTH = 320
const SPLIT_TOP_LARGE = '70%'
/**
 * SPLIT_WIDTH - React component
 * @returns React element
 */
const SPLIT_TOP_SMALL = '30%'
const SPLIT_BOTTOM_LARGE = '70%'
const SPLIT_BOTTOM_SMALL = '30%'

/**
 * FULL_WIDTH - React component
 * @returns React element
 */
export const SpotlightBlockCard = ({
  block,
  height,
  className,
  /**
   * SPLIT_TOP_LARGE - React component
   * @returns React element
   */
}: {
  block: SpotlightBlock
  height: string
  className?: string
  /**
   * SPLIT_TOP_SMALL - React component
   * @returns React element
   */
}) => {
  if (!block.highlightNumber && !block.image) return null

  if (block.highlightNumber) {
    /**
     * SPLIT_BOTTOM_LARGE - React component
     * @returns React element
     */
    return (
      <Card className={cn('border-none bg-transparent shadow-none', className)} style={{ height }}>
        <div
          className="flex h-full w-full flex-col justify-between rounded-xl p-3"
          /**
           * SPLIT_BOTTOM_SMALL - React component
           * @returns React element
           */
          style={{ backgroundColor: block.highlightBackgroundColor }}
        >
          <Heading size="h3" className="text-[28px] font-semibold leading-tight lg:text-[40px]">
            {block.highlightNumber}
          </Heading>
          /** * SpotlightBlockCard - React component * @returns React element */
          <Text className="text-sm font-medium leading-tight text-black lg:text-[18px] lg:font-normal">
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
          <Text className="absolute bottom-2 left-2 z-10 whitespace-pre-line text-[16px] font-semibold leading-5 text-white drop-shadow">
            {block.name}
          </Text>
        )}
      </CardContent>
    </Card>
  )
}

export const SpotlightCard = ({
  /**
   * imageSrc - Utility function
   * @returns void
   */
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
            /**
             * SpotlightCard - React component
             * @returns React element
             */
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

  /**
   * full - Utility function
   * @returns void
   */
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

/**
 * top - Utility function
 * @returns void
 */
/**
 * bottom - Utility function
 * @returns void
 */
/**
 * isLargeTop - Utility function
 * @returns void
 */
