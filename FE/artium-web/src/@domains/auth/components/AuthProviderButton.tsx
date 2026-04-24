// react
import type { ReactNode } from 'react'

// third-party
import { Loader2 } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type AuthProviderButtonProps = {
  className?: string
  disabled?: boolean
  icon: ReactNode
  isLoading?: boolean
  label: string
  loadingLabel?: string
  onClick?: () => void
}

export const AuthProviderButton = ({
  className,
  disabled = false,
  icon,
  isLoading = false,
  label,
  loadingLabel,
  onClick,
}: AuthProviderButtonProps) => {
  const isDisabled = disabled || isLoading

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        'flex h-[52px] min-w-0 flex-1 items-center justify-center gap-3 rounded-[32px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {isLoading ? <Loader2 className="h-6 w-6 shrink-0 animate-spin text-[#191414]" /> : icon}
      <span className="truncate">{isLoading && loadingLabel ? loadingLabel : label}</span>
    </button>
  )
}
