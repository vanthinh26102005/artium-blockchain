import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@shared/components/ui/button'

/**
 * EditorialDiscoverBanner - React component
 * @returns React element
 */
export const EditorialDiscoverBanner = () => {
  return (
    <div className="mx-auto flex flex-wrap overflow-hidden rounded-lg bg-[#F3F3F3]">
      {/* text content */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:w-[250px] sm:py-4 xl:w-[412px]">
        <div className="flex max-w-[250px] flex-col items-center text-center">
          <p className="leading-tight sm:text-[18px] xl:text-[24px]">
            Discover Art Tailored to Your Taste
          </p>
          <Button asChild size="sm" className="mt-4 w-[86px]">
            <Link href="/discover" className="text-[14px] font-bold!">
              Browse
            </Link>
          </Button>
        </div>
      </div>

      {/* image */}
      <div className="relative h-[150px] w-full sm:h-[250px] sm:flex-1">
        <Image
          src="/images/blog/footer.jpg"
          alt="Editorial footer artwork"
          fill
          sizes="(max-width: 640px) 100vw, 900px"
          className="object-cover object-left"
        />
      </div>
    </div>
  )
}
