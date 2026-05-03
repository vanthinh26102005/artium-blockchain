import { useEffect, useState } from 'react'
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

type ImageLightboxProps = {
  images: Array<{
    url: string
    alt?: string
    messageId: string
  }>
  initialIndex: number
  onClose: () => void
}

/**
 * ImageLightbox - React component
 * @returns React element
 */
export const ImageLightbox = ({ images, initialIndex, onClose }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const currentImage = images[currentIndex]
  const hasMultiple = images.length > 1

  /**
   * currentImage - Utility function
   * @returns void
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        /**
         * hasMultiple - Utility function
         * @returns void
         */
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious()
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        handleNext()
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
        /**
         * handleKeyDown - Utility function
         * @returns void
         */
      } else if (e.key === '-') {
        handleZoomOut()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, images.length, onClose])

  useEffect(() => {
    // Reset zoom when changing images
    setZoom(1)
    setIsLoading(true)
  }, [currentIndex])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  /**
   * handlePrevious - Utility function
   * @returns void
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = async () => {
    /**
     * handleNext - Utility function
     * @returns void
     */
    try {
      const response = await fetch(currentImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = currentImage.alt || 'image.jpg'
      document.body.appendChild(a)
      a.click()
      /**
       * handleZoomIn - Utility function
       * @returns void
       */
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  /**
   * handleZoomOut - Utility function
   * @returns void
   */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
        /** * handleDownload - Utility function * @returns void */
        <div className="flex items-center gap-2 text-white">
          {hasMultiple && (
            <span className="rounded-full bg-black/50 px-3 py-1 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
            /**
             * response - Utility function
             * @returns void
             */
          )}
        </div>
        <div className="flex items-center gap-2">
          /** * blob - Utility function * @returns void */
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              /**
               * url - Utility function
               * @returns void
               */
              e.stopPropagation()
              handleZoomOut()
            }}
            disabled={zoom <= 0.5}
            /**
             * a - Utility function
             * @returns void
             */
            className="text-white hover:bg-white/10"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleZoomIn()
            }}
            disabled={zoom >= 3}
            className="text-white hover:bg-white/10"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
            className="text-white hover:bg-white/10"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </>
      )}

      {/* Image */}
      <div className="relative flex h-full w-full items-center justify-center p-16">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        )}

        <img
          src={currentImage.url}
          alt={currentImage.alt || 'Image'}
          className="max-h-full max-w-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            cursor: zoom > 1 ? 'move' : 'default',
          }}
          onClick={(e) => e.stopPropagation()}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          draggable={false}
        />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-4">
        <div className="rounded-full bg-black/50 px-4 py-2 text-sm text-white">
          {zoom !== 1 && `${Math.round(zoom * 100)}% zoom • `}
          Press ESC to close
          {hasMultiple && ' • Arrow keys to navigate'}
        </div>
      </div>
    </div>
  )
}
