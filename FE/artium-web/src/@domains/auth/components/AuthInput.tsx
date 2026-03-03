// react
import { InputHTMLAttributes } from 'react'

// @shared - components
import { Input } from '@shared/components/ui/input'

// @shared - utils
import { cn } from '@shared/lib/utils'

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  required?: boolean
  hasError?: boolean
}

export const AuthInput = ({
  label,
  required = false,
  hasError = false,
  id,
  className,
  ...props
}: AuthInputProps) => {
  // -- render --
  return (
    <div className="space-y-2">
      {/* label */}
      <label htmlFor={id} className="text-xs font-bold tracking-[0.2em] text-[#6b6b6b] uppercase">
        {label} {required && <span className="text-[#FF4337]">*</span>}
      </label>

      {/* input */}
      <Input
        id={id}
        className={cn(
          'h-[56px] rounded-2xl! border border-black/10 px-5 text-sm text-[#191414] placeholder:text-black/20 focus-visible:ring-0 lg:px-7 lg:text-base',
          hasError && 'border-[#FF4337]',
          className,
        )}
        {...props}
      />
    </div>
  )
}
