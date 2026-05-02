import { PackageSearch } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

type OrdersEmptyStateProps = {
  isFiltered: boolean
  scopeLabel: string
  onResetFilters: () => void
}

export const OrdersEmptyState = ({
  isFiltered,
  scopeLabel,
  onResetFilters,
}: OrdersEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <PackageSearch className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">
        {isFiltered ? 'No matching orders' : `No ${scopeLabel.toLowerCase()} yet`}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {isFiltered
          ? 'Try a different status or search term. Orders appear here as soon as they match your current filters.'
          : `Your ${scopeLabel.toLowerCase()} will appear here once checkout activity starts flowing through the platform.`}
      </p>
      {isFiltered ? (
        <Button
          type="button"
          variant="outline"
          className="mt-6 border-slate-200 text-slate-900"
          onClick={onResetFilters}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}
