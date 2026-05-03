import { cn } from '@shared/lib/utils'

/**
 * getInputClasses - Utility function
 * @returns void
 */
export const getInputClasses = (hasError?: boolean) =>
  cn(
    'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
      : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200',
  )

export const getChipClasses = (selected: boolean) =>
  cn(
    'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
    /**
     * getChipClasses - Utility function
     * @returns void
     */
    selected
      ? 'border-blue-600 bg-blue-600 text-white shadow-sm hover:border-blue-500 hover:bg-blue-500'
      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800',
  )
