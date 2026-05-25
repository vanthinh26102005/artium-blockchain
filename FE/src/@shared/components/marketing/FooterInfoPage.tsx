import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Metadata } from '@/components/SEO/Metadata'
import { MarketingLayout } from '@shared/components/layout/MarketingLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { cn } from '@shared/lib/utils'

type FooterPageAction = {
  label: string
  href: string
}

type FooterPageMetric = {
  label: string
  value: string
}

type FooterPageCard = {
  title: string
  body: string
  icon: LucideIcon
}

type FooterPageStep = {
  title: string
  body: string
}

export type FooterInfoPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  primaryAction: FooterPageAction
  secondaryAction?: FooterPageAction
  metrics: FooterPageMetric[]
  cards: FooterPageCard[]
  stepsTitle: string
  stepsDescription: string
  steps: FooterPageStep[]
  noteTitle?: string
  noteBody?: string
}

type FooterInfoPageProps = {
  page: FooterInfoPageData
}

export const FooterInfoPage = ({ page }: FooterInfoPageProps) => {
  return (
    <>
      <Metadata title={page.metaTitle} description={page.metaDescription} />

      <div className="-mx-6 bg-[#f6f6f2] text-[#111111] sm:-mx-8 lg:-mx-12">
        <section className="relative isolate overflow-hidden bg-[#050505] px-6 pt-16 pb-14 text-white sm:px-8 lg:px-12 lg:pt-24 lg:pb-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-[linear-gradient(115deg,rgba(249,115,22,0.22),transparent_28%,rgba(53,201,238,0.18)_52%,transparent_70%,rgba(34,197,94,0.16)),repeating-linear-gradient(90deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_96px),repeating-linear-gradient(0deg,rgba(255,255,255,0.032)_0_1px,transparent_1px_96px)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.2)_0%,rgba(5,5,5,0.86)_100%)]"
          />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.58fr)_minmax(360px,0.42fr)] lg:items-end">
            <div>
              <p className="mb-5 inline-flex min-h-11 max-w-full items-center rounded-[8px] border border-white/14 bg-white/[0.045] px-4 text-[11px] font-semibold tracking-[0.2em] text-white/62 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                {page.eyebrow}
              </p>
              <h1 className="font-monument-grotes max-w-5xl text-[44px] leading-[0.95] font-semibold tracking-normal uppercase sm:text-[64px] lg:text-[88px]">
                {page.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                {page.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={page.primaryAction.href}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  {page.primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {page.secondaryAction ? (
                  <Link
                    href={page.secondaryAction.href}
                    className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/16 px-6 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                  >
                    {page.secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {page.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={cn(
                    'rounded-[8px] border border-white/12 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md',
                    index === 1 ? 'lg:ml-8' : '',
                    index === 2 ? 'lg:ml-16' : '',
                  )}
                >
                  <p className="font-monument-grotes text-3xl font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-[10px] tracking-[0.2em] text-white/48 uppercase">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-3">
            {page.cards.map((card) => {
              const Icon = card.icon
              return (
                <article
                  key={card.title}
                  className="rounded-[8px] border border-black/10 bg-white/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md"
                >
                  <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-[6px] bg-black text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-monument-grotes text-2xl leading-none font-semibold uppercase">
                    {card.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-black/62">{card.body}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="px-6 pb-16 sm:px-8 lg:px-12 lg:pb-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:items-start">
            <div>
              <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-black/42 uppercase">
                Details
              </p>
              <h2 className="font-monument-grotes text-4xl leading-[1] font-semibold uppercase md:text-6xl">
                {page.stepsTitle}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-black/62">
                {page.stepsDescription}
              </p>
            </div>

            <div className="rounded-[8px] border border-black/10 bg-white/72 shadow-[0_24px_80px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md">
              {page.steps.map((step, index) => (
                <div
                  key={step.title}
                  className="grid gap-4 border-b border-black/10 p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)] sm:p-6"
                >
                  <p className="font-monument-grotes text-sm font-semibold text-black/34">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <h3 className="text-base font-semibold text-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/58">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {page.noteTitle && page.noteBody ? (
            <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-3 rounded-[8px] border border-black/10 bg-black p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.14)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-white/42 uppercase">
                  {page.noteTitle}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/66">{page.noteBody}</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Contact team
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}

export const createFooterInfoPageRoute = (page: FooterInfoPageData) => {
  const FooterRoute: NextPageWithLayout = () => <FooterInfoPage page={page} />

  FooterRoute.getLayout = (routePage) => <MarketingLayout>{routePage}</MarketingLayout>
  FooterRoute.displayName = `${page.slug}Route`

  return FooterRoute
}
