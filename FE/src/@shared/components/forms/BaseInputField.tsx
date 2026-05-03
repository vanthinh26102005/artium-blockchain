import { forwardRef, type InputHTMLAttributes } from 'react'

import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

import { BaseFormField } from './BaseFormField'

type BaseInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  required?: boolean
  hasError?: boolean
  errorMessage?: string
  description?: string
  containerClassName?: string
  labelClassName?: string
  requiredMarkClassName?: string
  messageClassName?: string
  descriptionClassName?: string
  inputClassName?: string
  errorInputClassName?: string
}

/**
 * BaseInputField - React component
 * @returns React element
 */
export const BaseInputField = forwardRef<HTMLInputElement, BaseInputFieldProps>(
  (
    {
      label,
      required = false,
      hasError = false,
      errorMessage,
      description,
      containerClassName,
      labelClassName,
      requiredMarkClassName,
      messageClassName,
      descriptionClassName,
      inputClassName,
      errorInputClassName,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const messageId = id ? `${id}-message` : undefined
    const isInvalid = hasError || Boolean(errorMessage)
    const describedBy = [props['aria-describedby'], messageId].filter(Boolean).join(' ') || undefined
/**
 * messageId - Utility function
 * @returns void
 */

    return (
      <BaseFormField
        id={id}
/**
 * isInvalid - Utility function
 * @returns void
 */
        label={label}
        required={required}
        errorMessage={errorMessage}
        description={description}
/**
 * describedBy - Utility function
 * @returns void
 */
        messageId={messageId}
        className={containerClassName}
        labelClassName={labelClassName}
        requiredMarkClassName={requiredMarkClassName}
        messageClassName={messageClassName}
        descriptionClassName={descriptionClassName}
      >
        <Input
          ref={ref}
          id={id}
          aria-invalid={props['aria-invalid'] ?? isInvalid}
          aria-describedby={describedBy}
          className={cn(inputClassName, isInvalid && errorInputClassName, className)}
          {...props}
        />
      </BaseFormField>
    )
  },
)

BaseInputField.displayName = 'BaseInputField'

export type { BaseInputFieldProps }
