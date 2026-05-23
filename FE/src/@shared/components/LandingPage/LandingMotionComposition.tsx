import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

export const LANDING_MOTION_FPS = 30
export const LANDING_MOTION_DURATION_IN_FRAMES = 360
export const LANDING_MOTION_WIDTH = 1280
export const LANDING_MOTION_HEIGHT = 920

const heroImages = [
  {
    src: 'images/homepage-v2/community-spotlight/art-1.jpg',
    title: 'Collector discovery',
    meta: '8,000+ active collectors',
  },
  {
    src: 'images/homepage-v2/community-spotlight/art-11.jpg',
    title: 'Live auction signal',
    meta: 'Verified provenance',
  },
  {
    src: 'images/homepage-v2/community-spotlight/art-7.jpg',
    title: 'Studio operations',
    meta: '$4.5M+ artwork sales',
  },
  {
    src: 'images/homepage-v2/platform-player/gallery.jpg',
    title: 'Gallery-ready tools',
    meta: 'Portfolio, invoices, CRM',
  },
]

const metrics = [
  { label: 'Discovery', value: '+42%' },
  { label: 'Payouts', value: '2.4s' },
  { label: 'Bids', value: 'LIVE' },
]

export const LandingMotionComposition = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const intro = spring({
    frame,
    fps,
    config: {
      damping: 18,
      mass: 0.75,
      stiffness: 90,
    },
  })

  const slowDrift = interpolate(frame, [0, LANDING_MOTION_DURATION_IN_FRAMES], [0, -120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const scanProgress = interpolate(frame % 150, [0, 150], [-8, 108], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050505',
        color: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.48,
          background:
            'radial-gradient(circle at 74% 16%, rgba(255,255,255,0.16), transparent 22%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0))',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 54,
          border: '1px solid rgba(255,255,255,0.16)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 84,
          width: 410,
          opacity: intro,
          transform: `translateY(${interpolate(intro, [0, 1], [24, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.64 }}>
          Artium Market OS
        </div>
        <div style={{ marginTop: 18, fontSize: 76, lineHeight: 0.92, fontWeight: 800 }}>
          Art moves.
          <br />
          Your tools keep pace.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 70,
          bottom: 86,
          width: 610,
          transform: `translateX(${interpolate(intro, [0, 1], [54, 0])}px)`,
          opacity: interpolate(intro, [0, 1], [0, 1]),
        }}
      >
        {heroImages.map((image, index) => {
          const y = (index % 2) * 78 + index * 112 + slowDrift
          const rotate = index % 2 === 0 ? -2 : 2
          const opacity = interpolate(frame, [index * 12, index * 12 + 28], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })

          return (
            <div
              key={image.src}
              style={{
                position: 'absolute',
                right: index % 2 === 0 ? 44 : 156,
                top: y,
                width: index === 1 ? 360 : 310,
                height: index === 1 ? 420 : 360,
                opacity,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 28px 80px rgba(0,0,0,0.35)',
                transform: `rotate(${rotate}deg)`,
              }}
            >
              <Img
                src={staticFile(image.src)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${1.08 + index * 0.02})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent 48%)',
                }}
              />
              <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
                <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{image.title}</div>
                <div style={{ marginTop: 8, fontSize: 15, opacity: 0.72 }}>{image.meta}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 92,
          bottom: 92,
          display: 'flex',
          gap: 12,
          opacity: interpolate(frame, [34, 66], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            style={{
              width: 128,
              padding: '18px 16px',
              border: '1px solid rgba(255,255,255,0.16)',
              backgroundColor: index === 2 ? '#f97316' : 'rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800 }}>{metric.value}</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
                opacity: 0.72,
              }}
            >
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 104,
          bottom: 98,
          width: 420,
          height: 8,
          border: '1px solid rgba(255,255,255,0.18)',
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: `${scanProgress}%`,
            height: '100%',
            backgroundColor: '#ffffff',
          }}
        />
      </div>
    </AbsoluteFill>
  )
}
