// react
import { ReactNode } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// icons
import { X } from 'lucide-react'

type QuickSellHeaderProps = {
  title: string
  showCloseButton?: boolean
}

/**
 * QuickSellHeader - React component
 * @returns React element
 */
export const QuickSellHeader = ({ title, showCloseButton = true }: QuickSellHeaderProps) => {
  // -- router --
  const router = useRouter()

  // -- handlers --
  /**
   * router - Utility function
   * @returns void
   */
  const handleClose = () => {
    router.push('/inventory')
  }

  // -- render --
  return (
    /**
     * handleClose - Utility function
     * @returns void
     */
    <header className="fixed left-0 right-0 top-0 z-20 border-b border-black/10 bg-white">
      <div className="flex h-[60px] w-full items-center justify-center px-4 lg:h-[80px] lg:px-8">
        <h1 className="text-[16px] font-bold text-[#191414] lg:text-[22px]">{title}</h1>
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#191414] transition hover:bg-[#F5F5F5] lg:right-8"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  )
}
