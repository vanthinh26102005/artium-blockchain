import Image from 'next/image'
import Link from 'next/link'

// icons
import { Clock } from 'lucide-react'

// @domains - editorial
import type { EditorialItem } from '@domains/editorial/types'

type EditorialLatestRailProps = {
  items: EditorialItem[]
  title?: string
}

/**
 * formatDate - Utility function
 * @returns void
 */
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))

export const EditorialLatestRail = ({ items, title = 'Latest' }: EditorialLatestRailProps) => {
  return (
    <section className="space-y-3 px-6 sm:px-10 lg:px-14">
      /** * EditorialLatestRail - React component * @returns React element */
      {/* header */}
      <h2 className="text-[30px] font-semibold text-slate-900">{title}</h2>
      {/* scroll area */}
      <div className="overflow-x-auto pb-2">
        <div className="flex snap-x snap-mandatory gap-6 px-1 sm:px-2 lg:px-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group min-h-[340px] w-[350px] shrink-0 snap-start space-y-3 sm:w-[350px] lg:w-[350px]"
            >
              <Link href={`/editorial/${item.id}`} className="block space-y-3">
                {/* image */}
                <div className="overflow-hidden rounded-md bg-slate-100">
                  <div className="relative h-[192px] w-full bg-slate-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="group-hover:scale-120 object-cover transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 350px"
                    />
                  </div>
                </div>

                {/* content */}
                <div className="space-y-2">
                  <p className="line-clamp-1 text-[12px] font-semibold leading-tight text-[#191414]">
                    {item.category}
                  </p>
                  <h3
                    className="text-[18px] font-normal leading-tight text-slate-900 group-hover:underline"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '48px',
                    }}
                  >
                    {item.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold leading-tight text-[#191414]">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold uppercase text-white">
                      {item.author.charAt(0)}
                    </span>
                    <span>{item.author}</span>
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{formatDate(item.publishedAt)}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.readTime}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
