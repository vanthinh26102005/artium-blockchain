// @shared - components
import { Button } from '@shared/components/ui/button'

// @shared - utils
import { cn } from '@shared/lib/utils'

type UploadStickyFooterProps = {
  step: number
  totalSteps: number
  onCancel: () => void
  onPrev: () => void
  onNext: () => void
  isNextDisabled?: boolean
}

/**
 * UploadStickyFooter - React component
 * @returns React element
 */
export const UploadStickyFooter = ({
  step,
  totalSteps,
  onCancel,
  onPrev,
  onNext,
  isNextDisabled = false,
}: UploadStickyFooterProps) => {
  const isFirstStep = step <= 1
  const isLastStep = step >= totalSteps
  const progressPercent = Math.min(100, (step / totalSteps) * 100)
/**
 * isFirstStep - Utility function
 * @returns void
 */

  return (
    <footer className="fixed right-0 bottom-0 left-0 z-20 w-full">
      <div className="flex h-[60px] w-full items-center justify-between gap-4 border-t border-black/10 bg-white px-4 py-4 lg:h-[80px] lg:px-8">
/**
 * isLastStep - Utility function
 * @returns void
 */
        <div className="flex flex-1 items-center">
          <Button
            type="button"
            variant="outline"
/**
 * progressPercent - Utility function
 * @returns void
 */
            onClick={isFirstStep ? onCancel : onPrev}
            className="text-kokushoku-black h-[40px] rounded-full border-black/10 px-6 text-[14px] font-semibold hover:shadow disabled:opacity-40 lg:h-[44px]"
          >
            {isFirstStep ? 'Cancel' : 'Previous'}
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 lg:gap-2">
          <span className="text-kokushoku-black/60 text-[12px] font-bold tracking-wider uppercase lg:text-[14px]">
            Step {step} of {totalSteps}
          </span>
          <div className="h-1.5 w-48 rounded-full bg-emerald-100 lg:h-2 lg:w-64">
            <div
              className={cn(
                'h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out',
                progressPercent === 0 && 'w-0',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-end gap-5">
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className="bg-primary flex h-[40px] flex-1 items-center justify-center rounded-full border border-black px-6 text-[14px] font-semibold whitespace-nowrap text-white hover:shadow disabled:opacity-40 lg:h-[44px] lg:flex-none"
          >
            {isLastStep ? 'Publish Artwork' : 'Continue'}
          </Button>
        </div>
      </div>
    </footer>
  )
}
