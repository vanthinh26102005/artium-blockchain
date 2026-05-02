// react
import { useRef, useState } from 'react'

// next
import Image from 'next/image'

// third-party
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type MomentVideoPlayerProps = {
  videoUrl: string
  posterUrl?: string
  autoPlay?: boolean
  className?: string
}

export const MomentVideoPlayer = ({
  videoUrl,
  posterUrl,
  autoPlay = false,
  className,
}: MomentVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        void videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-2xl bg-slate-900 lg:rounded-3xl',
        className,
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        autoPlay={autoPlay}
        muted={isMuted}
        loop
        playsInline
        className="h-full w-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onVolumeChange={() => {
          if (videoRef.current) {
            setIsMuted(videoRef.current.muted)
          }
        }}
      />

      {/* Overlay Controls */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
        onClick={togglePlay}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault()
          }
        }}
      >
        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(event) => {
                event.stopPropagation()
                togglePlay()
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110 hover:bg-white"
            >
              <Play className="ml-1 h-8 w-8 text-slate-900" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute right-0 bottom-0 left-0 flex items-center gap-3 p-4">
          <button
            onClick={(event) => {
              event.stopPropagation()
              togglePlay()
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 text-white" />
            )}
          </button>

          <div className="flex-1" />

          <button
            onClick={(event) => {
              event.stopPropagation()
              toggleMute()
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation()
              toggleFullscreen()
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <Maximize className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
