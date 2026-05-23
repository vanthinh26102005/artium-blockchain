import type { CSSProperties } from 'react'
import Image from 'next/image'

const motionCards = [
  {
    src: '/images/homepage-v2/community-spotlight/art-1.jpg',
    title: 'Collector discovery',
    meta: '8,000+ active collectors',
    className: 'right-[9%] top-[4%] h-[36%] w-[27%]',
    rotate: '-2deg',
  },
  {
    src: '/images/homepage-v2/community-spotlight/art-11.jpg',
    title: 'Live auction signal',
    meta: 'Verified provenance',
    className: 'right-[21%] top-[24%] h-[40%] w-[31%]',
    rotate: '2deg',
  },
  {
    src: '/images/homepage-v2/community-spotlight/art-7.jpg',
    title: 'Studio operations',
    meta: '$4.5M+ artwork sales',
    className: 'right-[8%] top-[37%] h-[37%] w-[28%]',
    rotate: '-1deg',
  },
  {
    src: '/images/homepage-v2/platform-player/gallery.jpg',
    title: 'Gallery-ready tools',
    meta: 'Portfolio, invoices, CRM',
    className: 'right-[17%] top-[55%] h-[34%] w-[29%]',
    rotate: '1.5deg',
  },
]

const metrics = [
  { label: 'Discovery', value: '+42%', tone: 'bg-white/[0.075]' },
  { label: 'Payouts', value: '2.4s', tone: 'bg-white/[0.075]' },
  { label: 'Bids', value: 'LIVE', tone: 'bg-[#f97316]' },
]

const cardStyle = (index: number, rotate: string) =>
  ({
    '--card-rotate': rotate,
    '--card-delay': `${index * -2.2}s`,
  }) as CSSProperties

export const LandingMotionFallback = () => <LandingMotionPlayer />

export const LandingMotionPlayer = () => {
  return (
    <div className="landing-motion-scene relative aspect-[16/11] min-h-[300px] w-full overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.04] shadow-[0_40px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:min-h-[360px]">
      <div className="absolute inset-5 rounded-[6px] border border-white/10 sm:inset-7" />

      <div className="absolute top-[10%] left-[10%] z-10 max-w-[43%]">
        <p className="text-[9px] tracking-[0.24em] text-white/42 uppercase sm:text-[11px]">
          Artium Market OS
        </p>
        <p className="mt-3 text-[26px] leading-[0.92] font-bold text-white sm:text-[44px] lg:text-[52px]">
          Art moves.
          <br />
          Your tools
          <br />
          keep pace.
        </p>
      </div>

      <div className="absolute top-[5%] right-[5%] bottom-[12%] z-20 w-[60%]">
        {motionCards.map((card, index) => (
          <div
            key={card.src}
            className={`landing-motion-card absolute overflow-hidden rounded-[8px] border border-white/18 bg-black/30 shadow-[0_24px_70px_rgba(0,0,0,0.34)] ${card.className}`}
            style={cardStyle(index, card.rotate)}
          >
            <Image
              src={card.src}
              alt={card.title}
              fill
              priority={index < 2}
              sizes="(max-width: 768px) 36vw, 22vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78),transparent_52%)]" />
            <div className="absolute right-3 bottom-3 left-3">
              <p className="text-[10px] leading-tight font-bold text-white sm:text-sm">
                {card.title}
              </p>
              <p className="mt-1 text-[8px] leading-tight text-white/58 sm:text-[10px]">
                {card.meta}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-[9%] left-[10%] z-30 flex gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-[6px] border border-white/12 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${metric.tone}`}
          >
            <p className="text-sm font-bold text-white sm:text-lg">{metric.value}</p>
            <p className="mt-1 text-[7px] tracking-[0.18em] text-white/52 uppercase sm:text-[8px]">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      <div className="absolute right-[9%] bottom-[12%] z-30 h-[5px] w-[34%] overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
        <div className="landing-motion-progress h-full rounded-full bg-white" />
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .landing-motion-card {
            animation: landing-motion-card-drift 9s ease-in-out infinite alternate;
            animation-delay: var(--card-delay);
            transform: rotate(var(--card-rotate)) translate3d(0, 0, 0);
            will-change: transform;
          }

          .landing-motion-progress {
            animation: landing-motion-progress 7s ease-in-out infinite;
            will-change: transform;
            transform-origin: left center;
          }
        }

        @keyframes landing-motion-card-drift {
          0% {
            transform: rotate(var(--card-rotate)) translate3d(0, 4px, 0) scale(1);
          }
          100% {
            transform: rotate(var(--card-rotate)) translate3d(0, -7px, 0) scale(1.015);
          }
        }

        @keyframes landing-motion-progress {
          0% {
            transform: scaleX(0.18);
          }
          50% {
            transform: scaleX(0.72);
          }
          100% {
            transform: scaleX(0.32);
          }
        }
      `}</style>
    </div>
  )
}

export default LandingMotionPlayer
