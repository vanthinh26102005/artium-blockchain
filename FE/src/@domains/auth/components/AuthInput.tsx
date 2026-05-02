// react
import { forwardRef, type InputHTMLAttributes } from 'react'

import { BaseInputField } from '@shared/components/forms'

// @shared - utils
type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  required?: boolean
  hasError?: boolean
  errorMessage?: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, required = false, hasError = false, errorMessage, id, className, ...props }, ref) => {
    return (
      <BaseInputField
        ref={ref}
        id={id}
        label={label}
        required={required}
        hasError={hasError}
        errorMessage={errorMessage}
        containerClassName="space-y-2"
        labelClassName="text-xs font-bold tracking-[0.2em] text-auth-label uppercase"
        requiredMarkClassName="text-auth-error"
        inputClassName="h-12 rounded-lg! border border-black/10 px-5 text-sm text-kokushoku-black placeholder:text-black/20 focus-visible:ring-0 lg:px-7 lg:text-base"
        errorInputClassName="border-auth-error!"
        messageClassName="text-sm font-medium text-auth-error"
        className={className}
        {...props}
      />
    )
  },
)
AuthInput.displayName = 'AuthInput'
