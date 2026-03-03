// react
import { useState, InputHTMLAttributes } from 'react'

// third-party
import { Eye, EyeOff } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  required?: boolean
  hasError?: boolean
}

export const PasswordInput = ({
  label,
  required = false,
  hasError = false,
  id,
  className,
  ...props
}: PasswordInputProps) => {
  // -- state --
  const [isVisible, setIsVisible] = useState(false)

  // -- handlers --
  const handleToggle = () => {
    setIsVisible((prev) => !prev)
  }

  // -- render --
  return (
    <div className="space-y-2">
      {/* label */}
      <label htmlFor={id} className="text-xs font-bold tracking-[0.2em] text-[#6b6b6b] uppercase">
        {label} {required && <span className="text-[#FF4337]">*</span>}
      </label>

      {/* input wrapper */}
      <div
        className={cn(
          'flex h-[56px] items-center rounded-2xl border border-black/10 px-5 lg:px-7',
          hasError && 'border-[#FF4337]',
        )}
      >
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={cn(
            'h-full flex-1 bg-transparent text-sm text-[#191414] placeholder:text-black/20 focus:outline-none lg:text-base',
            className,
          )}
          {...props}
        />

        {/* toggle visibility */}
        <button
          type="button"
          onClick={handleToggle}
          className="ml-2 text-[#191414] transition hover:text-black"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? (
            <EyeOff className="h-6 w-6 lg:h-7 lg:w-7" />
          ) : (
            <Eye className="h-6 w-6 lg:h-7 lg:w-7" />
          )}
        </button>
      </div>
    </div>
  )
}
