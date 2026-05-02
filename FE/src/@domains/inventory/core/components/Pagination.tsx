// @shared - components
import { Button } from '@shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (nextPage: number) => void
  onPageSizeChange: (nextSize: number) => void
}

export const Pagination = ({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  // -- state --

  // -- derived --
  const isPrevDisabled = page <= 1
  const isNextDisabled = page >= totalPages

  // -- handlers --
  const handlePrev = () => {
    onPageChange(page - 1)
  }

  const handleNext = () => {
    onPageChange(page + 1)
  }

  // -- render --
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/10 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="font-medium">Page</span>
        <span className="font-semibold text-slate-900">{page}</span>
        <span>of</span>
        <span className="font-semibold text-slate-900">{totalPages}</span>
        <span className="text-slate-400">|</span>
        <span>Total: {total}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <span>Page size</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-9 w-auto rounded-full border-black/10 bg-white px-3 text-sm text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={isPrevDisabled}
          className="disabled:bg-muted disabled:text-muted-foreground"
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={isNextDisabled}
          className="disabled:bg-muted disabled:text-muted-foreground"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
