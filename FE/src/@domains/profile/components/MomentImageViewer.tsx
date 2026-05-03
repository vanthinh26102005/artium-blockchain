// react
import { useEffect, useId, useMemo, useState } from 'react'

// next
import Image from 'next/image'

// third-party
import PhotoSwipeLightbox from 'photoswipe/lightbox'

// @shared - utils
import { cn } from '@shared/lib/utils'

type MomentImageViewerProps = {
  imageUrl: string
  alt: string
  className?: string
}

/**
 * MomentImageViewer - React component
 * @returns React element
 */
export const MomentImageViewer = ({ imageUrl, alt, className }: MomentImageViewerProps) => {
  const [imageSize, setImageSize] = useState({ width: 1400, height: 1000 })
  const galleryId = useId()
  const galleryDomId = useMemo(() => `moment-gallery-${galleryId.replace(/:/g, '')}`, [galleryId])

/**
 * galleryId - Utility function
 * @returns void
 */
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: `#${galleryDomId}`,
      children: 'a',
/**
 * galleryDomId - Utility function
 * @returns void
 */
      bgOpacity: 0.9,
      spacing: 0.12,
      wheelToZoom: true,
      showHideAnimationType: 'fade',
      pswpModule: () => import('photoswipe'),
    })
/**
 * lightbox - Utility function
 * @returns void
 */

    lightbox.init()
    return () => {
      lightbox.destroy()
    }
  }, [galleryDomId])

  return (
    <div
      id={galleryDomId}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-2xl bg-slate-900 lg:rounded-3xl',
        className,
      )}
    >
      <a
        href={imageUrl}
        data-pswp-width={imageSize.width}
        data-pswp-height={imageSize.height}
        aria-label={`Open image ${alt}`}
        className="group relative block h-full w-full cursor-zoom-in focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1536px) 480px, (min-width: 1024px) 380px, 400px"
          className="object-cover"
          priority
          onLoadingComplete={(img) => {
            setImageSize({
              width: img.naturalWidth,
              height: img.naturalHeight,
            })
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
      </a>
    </div>
  )
}
