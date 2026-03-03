import Image from 'next/image'
import Link from 'next/link'

// components
import { Metadata } from '@/components/SEO/Metadata'

// @domains - editorial
import type { EditorialItem } from '@domains/editorial/types'

type EditorialDetailViewProps = {
  article: EditorialItem
}

export const EditorialDetailView = ({ article }: EditorialDetailViewProps) => {
  const authorAvatar = `https://i.pravatar.cc/96?u=${encodeURIComponent(article.author)}`

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10 lg:px-12">
      <Metadata title={`${article.title} | Editorial`} />

      {/* header */}
      <div className="mb-4 text-[16px] leading-tight font-extrabold text-[#191414]">
        {article.category}
      </div>
      <h1 className="text-3xl leading-tight font-bold text-[#191414] sm:text-4xl">
        {article.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] leading-tight font-normal text-[#191414]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white uppercase">
          {article.author.charAt(0)}
        </span>
        <span>{article.author}</span>
        <span className="h-1 w-1 rounded-full bg-slate-400" />
        <span>{article.publishedAt}</span>
        <span className="h-1 w-1 rounded-full bg-slate-400" />
        <span className="inline-flex items-center gap-1">{article.readTime}</span>
      </div>

      {/* featured image */}
      <div className="mt-6 overflow-hidden rounded-2xl">
        <Image
          src={article.imageUrl}
          alt={article.title}
          width={1600}
          height={900}
          className="h-auto w-full object-cover"
        />
      </div>

      {/* content */}
      <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-slate-800">
        <p>{article.excerpt}</p>
        <p>
          This story is part of our editorial stream covering artists, galleries, and collectors. It
          highlights themes like {article.tags.slice(0, 3).join(', ')} and shares signals from the
          ground.
        </p>
        <p>
          Keep exploring more pieces like this in{' '}
          <Link href="/editorial" className="text-blue-600 underline">
            Editorial
          </Link>{' '}
          or head to{' '}
          <Link href="/discover" className="text-blue-600 underline">
            Discover
          </Link>{' '}
          to browse tailored picks.
        </p>
      </div>

      {/* author box */}
      <div className="mt-10 rounded-2xl bg-white px-3 py-4 sm:px-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={authorAvatar}
              alt={article.author}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="space-y-1">
              <p className="text-[14px] leading-tight font-normal text-[#191414]">Written by</p>
              <p className="ml-[8px] text-[16px] leading-tight font-semibold text-[#191414]">
                {article.author}
              </p>
            </div>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M12 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path d="M19 8v6m-3-3h6" />
              <path d="M5 22a7 7 0 0 1 7-7h1" />
            </svg>
            Follow
          </a>
        </div>
      </div>
    </div>
  )
}
