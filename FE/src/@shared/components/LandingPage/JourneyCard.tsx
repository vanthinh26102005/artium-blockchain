import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@shared/components/ui/button'
import { Card, CardContent } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'
import { Heading } from './typography'

type JourneyCardProps = {
  className?: string
  title: string
  imageSrc: string
  href: string
  cta?: string
}

/**
 * JourneyCard - React component
 * @returns React element
 */
export const JourneyCard = ({
  className,
  title,
  imageSrc,
  href,
  cta = 'Learn More',
}: JourneyCardProps) => {
  return (
    <Card
      className={cn(
        'w-full space-y-[20px] rounded-[15px] bg-white p-4 text-black lg:w-[630px] lg:space-y-6 lg:rounded-[20px] lg:p-[20px]',
        className,
      )}
    >
      {/* -- image -- */}
      <div className="relative h-[200px] w-full shrink-0 self-stretch overflow-hidden rounded-[8px] lg:h-[400px]">
        <Image src={imageSrc} alt={title} fill priority className="object-cover" />
      </div>

      {/* -- content -- */}
      <CardContent className="flex items-center justify-between gap-3 !p-0">
        <Heading
          as="h3"
          size="h3"
          className="font-inter text-[18px] font-semibold leading-[120%] text-black lg:text-[40px] lg:font-medium lg:leading-[36px] lg:tracking-[-0.4px]"
        >
          {title}
        </Heading>

        <Button
          asChild
          size="lg"
          className="min-w-25 rounded-4xl h-[38px] bg-[#0F6BFF] px-4 text-[12px] leading-[14px] text-white hover:bg-[#0d5edc] lg:h-12 lg:min-w-[151px] lg:px-6 lg:text-[20px] lg:leading-[18px]"
        >
          <Link href={href} className="block shrink-0">
            {cta}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
