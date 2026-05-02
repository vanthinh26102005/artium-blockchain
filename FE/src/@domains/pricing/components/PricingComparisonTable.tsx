import React, { useEffect, useRef, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@shared/components/ui/table'
import { Check, Minus } from 'lucide-react'
import { PRICING_PLANS, COMPARISON_FEATURES } from '../constants/pricingData'

type PlanId = 'basic' | 'pro' | 'growth' | 'premier' | string
type PricingPlan = (typeof PRICING_PLANS)[number]
type ComparisonSection = (typeof COMPARISON_FEATURES)[number]
type ComparisonItem = ComparisonSection['items'][number]

type PlanMeta = {
  id: PlanId
  name: string
  priceAmountText: string
  pricePeriodText: string
  showCta: boolean
}

// Height of the site header (min-h-20 = 80px)
const SITE_HEADER_HEIGHT = 80

export const PricingComparisonTable: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false)
  const stickyHeaderRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const plans: PlanMeta[] = PRICING_PLANS.map((p: PricingPlan) => {
    const id = (p?.id ?? '') as PlanId
    const name = (p?.name ?? '') as string

    const monthlyPrice = p?.price?.monthly

    const priceAmountText = typeof monthlyPrice === 'number' ? `$${monthlyPrice}` : ''

    const pricePeriodText = priceAmountText ? '/ month' : ''

    const showCta = id !== 'basic'

    return { id, name, priceAmountText, pricePeriodText, showCta }
  })

  // Detect sticky state using IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible (scrolled past), header is sticky
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: `-${SITE_HEADER_HEIGHT}px 0px 0px 0px`,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const renderValue = (val: string | boolean | undefined) => {
    if (val === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" />
    if (val === false || val === undefined)
      return <Minus className="mx-auto h-5 w-5 text-slate-300" />
    return <span className="font-medium text-slate-700">{val}</span>
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-10">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[340px_1fr] lg:grid-cols-[360px_1fr]">
        {/* Left */}
        <div className="md:max-w-[340px]">
          <h2 className="text-4xl font-semibold text-slate-900">Compare plans</h2>
          <p className="mt-3 text-slate-600">
            Choose the plan that&apos;s right for you.
            <br />
            Whether you&apos;re just starting out or scaling up.
          </p>

          {/* Section labels - aligned with table rows */}
          <div className="mt-[198px]">
            {COMPARISON_FEATURES.map((section: ComparisonSection, idx) => (
              <div key={section?.category ?? idx} className={idx !== 0 ? 'mt-0' : ''}>
                {/* Section title - aligned with empty row in table */}
                <div className="flex h-12 items-center">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {section.category}
                  </h3>
                </div>

                {/* Section items - aligned with table rows */}
                <div className="divide-y divide-slate-200">
                  {section.items.map((item: ComparisonItem, itemIdx) => (
                    <div
                      key={`${section.category}-${item?.name ?? itemIdx}`}
                      className="flex h-14 items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="whitespace-nowrap text-slate-800">{item.name}</span>
                      </div>
                      <span className="text-slate-300">›</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Pricing per Month label */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-slate-900">Pricing per Month</h3>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="min-w-0 rounded-2xl border border-blue-300 bg-white shadow-sm">
          {/* Sentinel for detecting sticky state */}
          <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />

          <div className="flex h-12 items-center justify-center rounded-t-2xl bg-blue-400 text-base font-medium text-white">
            Artitum
          </div>

          {/* Sticky header row - only plan names */}
          <div
            ref={stickyHeaderRef}
            className={`sticky z-30 bg-white transition-shadow duration-200 ${isSticky ? 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : ''
              }`}
            style={{ top: `${SITE_HEADER_HEIGHT}px` }}
          >
            <div className="grid grid-cols-4 border-b border-slate-200">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-center px-4 py-4 text-center"
                >
                  <span className="text-lg font-semibold text-slate-900">{plan.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price and CTA row - below sticky header */}
          <div className="grid grid-cols-4 border-b border-slate-200">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col items-center justify-center px-4 py-6 text-center"
              >
                {/* Price badge */}
                <div className="inline-flex items-baseline justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                  <span className="text-lg font-semibold text-blue-600">{plan.priceAmountText || '$0'}</span>
                  <span className="ml-1 text-xs font-medium text-slate-500">{plan.pricePeriodText || '/ month'}</span>
                </div>

                {/* CTA buttons */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  {plan.showCta ? (
                    <>
                      <button className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                        Subscribe Now
                      </button>
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Start Free Trial
                      </button>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-slate-600">Free Forever</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Table body - feature comparison */}
          <Table className="w-full table-fixed">
            <TableBody>
              {COMPARISON_FEATURES.map((section: ComparisonSection, idx) => (
                <React.Fragment key={section?.category ?? idx}>
                  {/* Empty row for section title alignment */}
                  <TableRow className="h-12">
                    <TableCell colSpan={4} className="border-b-0 p-0" />
                  </TableRow>

                  {/* Data rows for each feature item */}
                  {section.items.map((item: ComparisonItem, itemIdx) => (
                    <TableRow
                      key={`${section.category}-${item?.name ?? itemIdx}`}
                      className="h-14"
                    >
                      <TableCell className="w-1/4 border-b border-slate-200 px-4 py-0 text-center align-middle">
                        {renderValue(item.basic)}
                      </TableCell>
                      <TableCell className="w-1/4 border-b border-slate-200 px-4 py-0 text-center align-middle">
                        {renderValue(item.pro)}
                      </TableCell>
                      <TableCell className="w-1/4 border-b border-slate-200 px-4 py-0 text-center align-middle">
                        {renderValue(item.growth)}
                      </TableCell>
                      <TableCell className="w-1/4 border-b border-slate-200 px-4 py-0 text-center align-middle">
                        {renderValue(item.premier)}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}

              {/* Pricing per Month row - at the bottom */}
              <TableRow className="h-16">
                <TableCell colSpan={4} className="p-0" />
              </TableRow>
            </TableBody>
          </Table>

          {/* Pricing per Month footer row */}
          <div className="grid grid-cols-4 rounded-b-2xl border-t border-slate-200 bg-white py-4">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-center px-4">
                <span className="rounded-lg bg-blue-50 px-4 py-2 text-lg font-bold text-blue-600">
                  {plan.priceAmountText || '$0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
