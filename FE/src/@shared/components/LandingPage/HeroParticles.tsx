import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Engine, ISourceOptions } from 'tsparticles-engine'
import { loadSlim } from 'tsparticles-slim'

// -- dynamic imports --
/**
 * Particles - React component
 * @returns React element
 */
const Particles = dynamic(() => import('react-tsparticles').then((mod) => mod.default), {
  ssr: false,
})

export const HeroParticles = () => {
  // -- handlers --
  const particlesInit = useCallback(async (engine: Engine) => {
    /**
     * HeroParticles - React component
     * @returns React element
     */
    await loadSlim(engine)
  }, [])

  // -- config --
  const options = useMemo<ISourceOptions>(
    /**
     * particlesInit - Utility function
     * @returns void
     */
    () => ({
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        detectsOn: 'window',
        events: {
          /**
           * options - Utility function
           * @returns void
           */
          onHover: {
            enable: true,
            mode: ['grab', 'repulse'],
          },
          onClick: { enable: false, mode: [] },
          resize: true,
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.16 } },
          repulse: { distance: 90, duration: 0.35 },
        },
      },
      particles: {
        color: {
          value: ['#ffffff', '#38bdf8', '#a855f7', '#fbbf24'],
        },
        links: {
          enable: true,
          distance: 130,
          opacity: 0.22,
          width: 1.1,
          color: '#ffffff',
        },
        move: {
          direction: 'bottom',
          enable: true,
          speed: 0.6,
          straight: false,
          outModes: { default: 'out' },
        },
        number: {
          value: 75,
          density: { enable: true, area: 900 },
        },
        opacity: {
          value: { min: 0.35, max: 0.75 },
        },
        shape: { type: 'circle' },
        size: { value: { min: 1.3, max: 3.4 } },
      },
    }),
    [],
  )

  return (
    <Particles
      id="landing-hero-particles"
      init={particlesInit}
      options={options}
      className="pointer-events-none absolute inset-0 z-0"
    />
  )
}

export default HeroParticles
