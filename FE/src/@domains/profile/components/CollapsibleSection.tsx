// react
import { useState } from 'react'

// third-party
import { ChevronDown, ChevronUp } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type CollapsibleSectionProps = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export const CollapsibleSection = ({
  title,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border-t border-slate-100', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>
      {isOpen && <div className="animate-in fade-in px-6 pb-6 duration-200">{children}</div>}
    </div>
  )
}
