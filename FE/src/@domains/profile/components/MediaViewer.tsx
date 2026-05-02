// next
import Image from 'next/image'

// @domains - profile
import { Moment } from '@domains/profile/constants/moments'

type MediaViewerProps = {
  moment: Moment
}

export const MediaViewer = ({ moment }: MediaViewerProps) => {
  if (moment.type === 'video') {
    return (
      <video className="h-full w-full object-contain" controls poster={moment.posterUrl}>
        <source src={moment.mediaUrl} />
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <Image
      src={moment.mediaUrl}
      alt={moment.caption}
      fill
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="object-contain"
    />
  )
}
