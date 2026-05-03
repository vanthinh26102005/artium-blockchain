'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { cn } from '@shared/lib/utils'
import { ArtworkDetailImage } from '../../types'

type ArtworkGalleryProps = {
    images: ArtworkDetailImage[]
    title: string
}

// Zoom Controls Component - renders in top bar
type ZoomControlsProps = {
    onZoomIn: () => void
    onZoomOut: () => void
    onReset: () => void
}

/**
 * ZoomControlsBar - React component
 * @returns React element
 */
const ZoomControlsBar = ({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) => {
    return (
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            <button
                onClick={onZoomOut}
                className="cursor-pointer rounded-full p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Zoom out"
            >
                <ZoomOut className="h-5 w-5" />
            </button>
            <button
                onClick={onReset}
                className="cursor-pointer rounded-full p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Reset zoom"
            >
                <RotateCcw className="h-5 w-5" />
            </button>
            <button
                onClick={onZoomIn}
                className="cursor-pointer rounded-full p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Zoom in"
            >
                <ZoomIn className="h-5 w-5" />
            </button>
        </div>
    )
}

export const ArtworkGallery = ({ images, title }: ArtworkGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
/**
 * ArtworkGallery - React component
 * @returns React element
 */

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
/**
 * handlePrevious - Utility function
 * @returns void
 */
    }

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index)
    }

    const openLightbox = () => {
/**
 * handleNext - Utility function
 * @returns void
 */
        setIsLightboxOpen(true)
    }

    const closeLightbox = () => {
        setIsLightboxOpen(false)
    }

/**
 * handleThumbnailClick - Utility function
 * @returns void
 */
    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
/**
 * openLightbox - Utility function
 * @returns void
 */
        return () => {
            document.body.style.overflow = ''
        }
    }, [isLightboxOpen])

    // Handle ESC key to close lightbox
    useEffect(() => {
/**
 * closeLightbox - Utility function
 * @returns void
 */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeLightbox()
            } else if (e.key === 'ArrowLeft') {
                handlePrevious()
            } else if (e.key === 'ArrowRight') {
                handleNext()
            }
        }

        if (isLightboxOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isLightboxOpen])

    return (
        <>
            {/* Main Gallery */}
/**
 * handleKeyDown - Utility function
 * @returns void
 */
            <div className="relative">
                {/* Main Image Container - Fixed aspect ratio with gray background */}
                <div
                    className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg bg-[#f5f5f5]"
                    onClick={openLightbox}
                >
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="relative h-full w-full">
                            <Image
                                src={images[currentIndex]?.url || ''}
                                alt={images[currentIndex]?.alt || title}
                                fill
                                sizes="(min-width: 1024px) 55vw, 100vw"
                                className="object-contain transition-transform duration-300 hover:scale-[1.02]"
                                priority
                            />
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePrevious()
                                }}
                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white p-2 shadow-md transition-all hover:bg-slate-50"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNext()
                                }}
                                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white p-2 shadow-md transition-all hover:bg-slate-50"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-5 w-5 text-slate-600" />
                            </button>
                        </>
                    )}
                </div>

                {/* Navigation Dots */}
                {images.length > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleThumbnailClick(index)}
                                className={cn(
                                    'h-2 w-2 cursor-pointer rounded-full transition-all duration-200',
                                    index === currentIndex
                                        ? 'w-6 bg-slate-800'
                                        : 'bg-slate-300 hover:bg-slate-400',
                                )}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal with Zoom */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90"
                    onClick={closeLightbox}
                >
                    {/* Zoomable Image */}
                    <div
                        className="relative h-[80vh] w-[80vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <TransformWrapper
                            initialScale={1}
                            minScale={0.5}
                            maxScale={5}
                            centerOnInit
                            wheel={{ step: 0.1 }}
                            doubleClick={{ mode: 'toggle', step: 2 }}
                            panning={{ disabled: false }}
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    {/* Top Bar - Zoom Controls + Close Button - Fixed at top right of screen */}
                                    <div className="fixed top-4 right-6 z-[350] flex items-center gap-3">
                                        <ZoomControlsBar
                                            onZoomIn={() => zoomIn()}
                                            onZoomOut={() => zoomOut()}
                                            onReset={() => resetTransform()}
                                        />
                                        <button
                                            onClick={closeLightbox}
                                            className="cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                            aria-label="Close lightbox"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <TransformComponent
                                        wrapperStyle={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        contentStyle={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <div className="relative h-full w-full">
                                            <Image
                                                src={images[currentIndex]?.url || ''}
                                                alt={images[currentIndex]?.alt || title}
                                                fill
                                                sizes="80vw"
                                                className="object-contain"
                                                priority
                                                draggable={false}
                                            />
                                        </div>
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>

                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handlePrevious()
                            }}
                            className="absolute left-6 z-20 cursor-pointer rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                    )}

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleNext()
                            }}
                            className="absolute right-6 z-20 cursor-pointer rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="absolute bottom-8 flex items-center gap-3">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleThumbnailClick(index)
                                    }}
                                    className={cn(
                                        'relative h-16 w-16 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200',
                                        index === currentIndex
                                            ? 'border-white'
                                            : 'border-black opacity-60 hover:opacity-100',
                                    )}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.alt || `Thumbnail ${index + 1}`}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
