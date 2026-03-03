import Image from 'next/image'
import Link from 'next/link'

// icons
import { Clock } from 'lucide-react'

// @domains - editorial
import type { EditorialItem } from '@domains/editorial/types'

type EditorialAllListProps = {
  items: EditorialItem[]
  title?: string
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))

export const EditorialAllList = ({ items, title = 'All Articles' }: EditorialAllListProps) => {
  return (
    <section className="space-y-3 px-6 sm:px-10 lg:px-14">
      {/* header */}
      <h2 className="text-[30px] font-semibold text-slate-900">{title}</h2>

      {/* list grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex h-[178px] w-[677px] max-w-full items-stretch overflow-hidden rounded-md bg-white transition"
          >
            <Link href={`/editorial/${item.id}`} className="flex h-full w-full items-stretch">
              {/* image */}
              <div className="relative h-full w-[289px] shrink-0 overflow-hidden rounded-none bg-slate-100">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-120"
                  sizes="(max-width: 640px) 100px, 289px"
                />
              </div>

              {/* content */}
              <div className="flex h-full min-w-0 flex-col justify-between gap-2 p-3">
                <div className="space-y-2">
                  <p className="line-clamp-1 text-[12px] leading-tight font-semibold text-[#191414]">
                    {item.category}
                  </p>
                  <h3 className="line-clamp-2 text-[18px] leading-tight font-semibold text-slate-900 group-hover:underline">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[12px] leading-tight font-semibold text-[#191414]">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white uppercase">
                      {item.author.charAt(0)}
                    </span>
                    <span>{item.author}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                    <span>{formatDate(item.publishedAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.readTime}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-[16px] leading-normal font-normal text-slate-700">
                    {item.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
