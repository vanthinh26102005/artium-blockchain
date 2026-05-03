import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { Textarea } from '@shared/components/ui/textarea'
import { cn } from '@shared/lib/utils'

import { BaseFormField } from './BaseFormField'

type BaseTextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
  textareaClassName?: string
  errorTextareaClassName?: string
}

/**
 * BaseTextareaField - React component
 * @returns React element
 */
export const BaseTextareaField = forwardRef<HTMLTextAreaElement, BaseTextareaFieldProps>(
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
      textareaClassName,
      errorTextareaClassName,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const messageId = id ? `${id}-message` : undefined
    const isInvalid = hasError || Boolean(errorMessage)
    const describedBy =
      [props['aria-describedby'], messageId].filter(Boolean).join(' ') || undefined
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
        <Textarea
          ref={ref}
          id={id}
          aria-invalid={props['aria-invalid'] ?? isInvalid}
          aria-describedby={describedBy}
          className={cn(textareaClassName, isInvalid && errorTextareaClassName, className)}
          {...props}
        />
      </BaseFormField>
    )
  },
)

BaseTextareaField.displayName = 'BaseTextareaField'

export type { BaseTextareaFieldProps }
