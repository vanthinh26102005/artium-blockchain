import type { ReactNode } from 'react'

import { cn } from '@shared/lib/utils'

type BaseFormFieldProps = {
  id?: string
  label: string
  required?: boolean
  errorMessage?: string
  description?: string
  children: ReactNode
  className?: string
  labelClassName?: string
  requiredMarkClassName?: string
  messageClassName?: string
  descriptionClassName?: string
}

export const BaseFormField = ({
  id,
  label,
  required = false,
  errorMessage,
  description,
  children,
  className,
  labelClassName,
  requiredMarkClassName,
  messageClassName,
  descriptionClassName,
}: BaseFormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className={labelClassName}>
        {label} {required && <span className={requiredMarkClassName}>*</span>}
      </label>

      {children}

      {errorMessage ? (
        <p className={messageClassName}>{errorMessage}</p>
      ) : description ? (
        <p className={descriptionClassName}>{description}</p>
      ) : null}
    </div>
  )
}
