// react
import { forwardRef, useState, type InputHTMLAttributes } from 'react'

// third-party
import { Eye, EyeOff } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  required?: boolean
  hasError?: boolean
  errorMessage?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, required = false, hasError = false, errorMessage, id, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false)

    const handleToggle = () => {
      setIsVisible((prev) => !prev)
    }

    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-xs font-bold tracking-[0.2em] text-[#6b6b6b] uppercase">
          {label} {required && <span className="text-[#FF4337]">*</span>}
        </label>

        <div
          className={cn(
            'flex h-14 items-center rounded-2xl border border-black/10 px-5 lg:px-7 transition',
            hasError
              ? 'border-[#FF4337]! focus-within:ring-2 focus-within:ring-[#FF4337]/10'
              : 'focus-within:border-black/20',
          )}
        >
          <input
            ref={ref}
            id={id}
            type={isVisible ? 'text' : 'password'}
            className={cn(
              'h-full flex-1 bg-transparent text-sm text-[#191414] placeholder:text-black/20 focus:outline-none lg:text-base',
              className,
            )}
            {...props}
          />

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

        {errorMessage ? <p className="text-sm font-medium text-[#FF4337]">{errorMessage}</p> : null}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
