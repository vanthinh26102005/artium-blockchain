// @shared - components
import { Button } from '@shared/components/ui/button'

type UploadStepHeaderProps = {
  title: string
  onClose?: () => void
}

/**
 * UploadStepHeader - React component
 * @returns React element
 */
export const UploadStepHeader = ({ title, onClose }: UploadStepHeaderProps) => {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 border-b border-black/10 bg-white">
      <div className="flex h-[60px] w-full items-center justify-center px-4 lg:h-[80px] lg:px-8">
        <h1 className="text-[16px] font-bold text-[#191414] lg:text-[22px]">{title}</h1>
        {onClose ? (
          <div className="absolute right-4 lg:right-8">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full border border-black/10 bg-white text-[11px] font-semibold text-[#191414] hover:bg-[#F5F5F5] lg:text-[12px]"
            >
              Close
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
