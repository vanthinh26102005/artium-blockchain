import { useState } from 'react'
import { useRouter } from 'next/router' // Change from navigation to router for consistency
import Image from 'next/image'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { Heading, Text } from './typography'
import { FEATURES } from './constants'

type FeaturesSectionProps = {
  className?: string
}

/**
 * FeaturesSection - React component
 * @returns React element
 */
const FeaturesSection = ({ className }: FeaturesSectionProps) => {
  // -- state --
  const [activeIndex, setActiveIndex] = useState(0)

  // -- derived --
  const activeFeature = FEATURES[activeIndex] ?? FEATURES[0]
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  /**
   * activeFeature - Utility function
   * @returns void
   */

  // -- handlers --
  const handleSignUpClick = () => {
    if (isAuthenticated) return
    /**
     * router - Utility function
     * @returns void
     */
    router.push('/sign-up')
  }

  return (
    /**
     * isAuthenticated - Utility function
     * @returns void
     */
    <>
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#f7c6ff] to-[#b9d9ff] text-black 2xl:h-[900px] lg:h-[750px] xl:h-[900px]">
        <LandingPageSection
          className={cn(
            'relative h-full !max-w-none !px-6 !pb-10 !pt-10 lg:!pb-6 lg:!pl-10 lg:!pr-0 lg:!pt-12',
            className,
            /**
             * handleSignUpClick - Utility function
             * @returns void
             */
          )}
        >
          {/* -- header -- */}
          <div className="relative flex flex-col items-center text-center">
            <Heading
              size="h1"
              className="text-[40px] leading-tight text-black md:text-[48px] lg:text-[56px]"
            >
              <span className="block">The Only Art</span>
              <span className="block">Tools You&apos;ll Need</span>
            </Heading>
            <Text className="mt-3 max-w-3xl text-lg text-black/80 md:text-xl lg:text-xl">
              <span className="font-semibold text-black">You don&apos;t have to do it alone</span>
              &mdash; we help you showcase, sell, and grow your audience effortlessly.
            </Text>
          </div>

          {/* -- main content -- */}
          <div className="relative mt-12 grid gap-10 2xl:h-[700px] lg:h-[500px] lg:grid-cols-[0.4fr_0.6fr] lg:items-stretch lg:justify-items-end lg:gap-12 xl:h-[650px] xl:gap-16">
            {/* -- feature list -- */}
            <div className="relative flex flex-col gap-6 lg:max-w-[540px]">
              <div className="flex flex-col gap-4">
                {FEATURES.map((feature, idx) => {
                  const isActive = idx === activeIndex
                  return (
                    <button
                      key={feature.title}
                      onClick={() => setActiveIndex(idx)}
                      className="group relative flex w-full items-start gap-4 rounded-2xl px-2 py-1 text-left transition"
                    >
                      <div className="relative flex w-[3px] self-stretch">
                        <span
                          className={cn(
                            'block w-[3px] rounded-full transition-all duration-300',
                            isActive ? 'h-full bg-black' : 'mt-0.5 h-10 bg-gray-400',
                          )}
                        />
                      </div>
                      /** * isActive - Utility function * @returns void */
                      <div className="space-y-2">
                        <Heading
                          as="h3"
                          size="h3"
                          className="text-xl font-semibold leading-tight text-black md:text-2xl lg:text-xl"
                        >
                          {feature.title}
                        </Heading>
                        <div
                          className={cn(
                            'grid transition-all duration-300 ease-in-out',
                            isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                          )}
                        >
                          <div className="overflow-hidden">
                            <Text className="text-base text-black/80 md:text-lg lg:text-base">
                              {feature.description}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <Button
                size="lg"
                onClick={handleSignUpClick}
                disabled={isAuthenticated}
                className={cn(
                  'mt-2 w-fit rounded-full bg-white px-6 py-3 text-base font-semibold !text-black shadow hover:bg-white hover:!text-black',
                  isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                )}
              >
                Sign Up
              </Button>
            </div>

            <div className="hidden lg:block" />

            {/* -- feature image (desktop) -- */}
            <div
              className="pointer-events-none absolute bottom-0 right-0 hidden 2xl:top-0 lg:top-[20px] lg:z-0 lg:flex xl:top-[10px]"
              style={{
                animation: 'featuresFade 0.75s cubic-bezier(0.33, 1, 0.68, 1) forwards',
                willChange: 'opacity, transform',
              }}
            >
              <div className="relative flex h-full w-[50vw] max-w-[1000px] items-end justify-end xl:w-[52vw] xl:max-w-[1100px]">
                <Image
                  key={activeFeature.title}
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  fill
                  className="rounded-tl-xl object-contain object-right-bottom"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </LandingPageSection>
      </div>

      {/* -- styles -- */}
      <style jsx>{`
        @keyframes featuresFade {
          from {
            opacity: 0;
            transform: translate3d(0, 6px, 0);
            filter: blur(1px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }
      `}</style>
    </>
  )
}

export default FeaturesSection
