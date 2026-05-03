import { cn } from '@shared/lib/utils'
import type { OrderTimelineStep } from '../types/orderTypes'
import { formatOrderDateTime } from '../utils/orderPresentation'

type OrderTimelineProps = {
  steps: OrderTimelineStep[]
}

/**
 * OrderTimeline - React component
 * @returns React element
 */
export const OrderTimeline = ({ steps }: OrderTimelineProps) => {
  return (
    <div className="space-y-5">
      {steps.map((step, index) => (
        <div key={step.key} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'mt-1 h-3.5 w-3.5 rounded-full border-2',
                step.state === 'complete' && 'border-emerald-600 bg-emerald-600',
                step.state === 'current' && 'border-blue-600 bg-white',
                step.state === 'upcoming' && 'border-slate-300 bg-white',
              )}
            />
            {index < steps.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
          </div>
          <div className="pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{step.label}</h3>
              {step.date ? (
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  {formatOrderDateTime(step.date)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
