import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

type JourneyCardProps = {
  className?: string
  title: string
  imageSrc: string
  href: string
  cta?: string
}

export const JourneyCard = ({
  className,
  title,
  imageSrc,
  href,
  cta = 'Learn More',
}: JourneyCardProps) => {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[8px] border border-white/18 bg-white/[0.86] text-black shadow-[0_24px_90px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-md',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#eeeeee]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 46vw"
        />
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-black/42 uppercase">Pathway</p>
          <h3 className="font-monument-grotes mt-2 text-3xl leading-none font-semibold tracking-normal uppercase md:text-5xl">
            {title}
          </h3>
        </div>

        <Button
          asChild
          size="lg"
          className="min-h-12 rounded-full !bg-black px-5 text-sm font-semibold !text-white hover:!bg-black/80"
        >
          <Link href={href}>
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
