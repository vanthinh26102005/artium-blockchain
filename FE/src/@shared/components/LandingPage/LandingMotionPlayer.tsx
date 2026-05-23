import { Player } from '@remotion/player'
import {
  LANDING_MOTION_DURATION_IN_FRAMES,
  LANDING_MOTION_FPS,
  LANDING_MOTION_HEIGHT,
  LANDING_MOTION_WIDTH,
  LandingMotionComposition,
} from './LandingMotionComposition'

export const LandingMotionFallback = () => (
  <div className="relative aspect-[16/11] min-h-[300px] w-full overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.04] shadow-[0_40px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:min-h-[360px]">
    <div className="absolute inset-6 rounded-[6px] border border-white/10" />
    <div className="absolute top-10 right-10 h-[62%] w-[44%] rounded-[6px] bg-[url('/images/homepage-v2/community-spotlight/art-11.jpg')] bg-cover bg-center" />
    <div className="absolute right-[28%] bottom-14 h-[52%] w-[38%] rounded-[6px] bg-[url('/images/homepage-v2/community-spotlight/art-7.jpg')] bg-cover bg-center" />
    <div className="absolute bottom-10 left-10 max-w-xs">
      <p className="text-[11px] tracking-[0.28em] text-white/50 uppercase">Artium Market OS</p>
      <p className="mt-3 text-4xl leading-none font-bold text-white uppercase">
        Art moves faster here.
      </p>
    </div>
  </div>
)

export const LandingMotionPlayer = () => {
  return (
    <div className="relative aspect-[16/11] min-h-[300px] w-full overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.04] shadow-[0_40px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:min-h-[360px]">
      <Player
        component={LandingMotionComposition}
        durationInFrames={LANDING_MOTION_DURATION_IN_FRAMES}
        fps={LANDING_MOTION_FPS}
        compositionWidth={LANDING_MOTION_WIDTH}
        compositionHeight={LANDING_MOTION_HEIGHT}
        initialFrame={54}
        autoPlay
        loop
        initiallyMuted
        controls={false}
        clickToPlay={false}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

export default LandingMotionPlayer
