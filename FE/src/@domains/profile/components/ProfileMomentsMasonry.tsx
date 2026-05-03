// third-party
import Masonry from 'react-masonry-css'

// @domains - profile
import { Moment } from '@domains/profile/constants/moments'
import { MomentCard } from '@domains/profile/components/MomentCard'

type ProfileMomentsMasonryProps = {
  moments: Moment[]
  hrefBase?: string
}

/**
 * breakpointColumns - Utility function
 * @returns void
 */
const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 2,
  640: 1,
}

const aspectVariants = [
  'aspect-[4/5]',
  'aspect-[5/6]',
/**
 * aspectVariants - Utility function
 * @returns void
 */
  'aspect-[6/7]',
  'aspect-[7/8]',
  'aspect-[8/9]',
]

const getAspectClass = (seed: string, index: number) => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return aspectVariants[(hash + index * 3) % aspectVariants.length]
}

export const ProfileMomentsMasonry = ({ moments, hrefBase }: ProfileMomentsMasonryProps) => {
/**
 * getAspectClass - Utility function
 * @returns void
 */
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex w-full gap-6"
/**
 * hash - Utility function
 * @returns void
 */
      columnClassName="space-y-6"
    >
      {moments.map((moment, index) => {
        const aspect = getAspectClass(moment.id, index)
        return (
          <MomentCard
            key={moment.id}
/**
 * ProfileMomentsMasonry - React component
 * @returns React element
 */
            moment={moment}
            hrefBase={hrefBase}
            className="break-inside-avoid"
            mediaClassName={aspect}
          />
        )
      })}
    </Masonry>
  )
}

/**
 * aspect - Utility function
 * @returns void
 */