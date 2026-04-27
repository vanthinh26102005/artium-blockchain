// react
import { forwardRef, type InputHTMLAttributes } from 'react'

import { BasePasswordInputField } from '@shared/components/forms'

type AuthPasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  required?: boolean
  hasError?: boolean
  errorMessage?: string
}

export const AuthPasswordInput = forwardRef<HTMLInputElement, AuthPasswordInputProps>(
  ({ label, required = false, hasError = false, errorMessage, id, className, ...props }, ref) => {
    return (
      <BasePasswordInputField
        ref={ref}
        id={id}
        label={label}
        required={required}
        hasError={hasError}
        errorMessage={errorMessage}
        containerClassName="space-y-2"
        labelClassName="text-xs font-bold tracking-[0.2em] text-auth-label uppercase"
        requiredMarkClassName="text-auth-error"
        messageClassName="text-sm font-medium text-auth-error"
        fieldContainerClassName="flex h-14 items-center rounded-2xl border border-black/10 px-5 transition focus-within:border-black/20 lg:px-7"
        errorFieldContainerClassName="border-auth-error! focus-within:ring-2 focus-within:ring-auth-error/10"
        inputClassName="h-full flex-1 bg-transparent text-sm text-kokushoku-black placeholder:text-black/20 focus:outline-none lg:text-base"
        toggleButtonClassName="ml-2 text-kokushoku-black transition hover:text-black"
        iconClassName="h-6 w-6 lg:h-7 lg:w-7"
        className={className}
        {...props}
      />
    )
  },
)
AuthPasswordInput.displayName = 'AuthPasswordInput'
