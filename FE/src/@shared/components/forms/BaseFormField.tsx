import type { ReactNode } from 'react'

import { cn } from '@shared/lib/utils'

export type BaseFormFieldProps = {
  id?: string
  label: string
  required?: boolean
  errorMessage?: string
  description?: string
  messageId?: string
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
  messageId,
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
        <p id={messageId} className={messageClassName}>
          {errorMessage}
        </p>
      ) : description ? (
        <p id={messageId} className={descriptionClassName}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
