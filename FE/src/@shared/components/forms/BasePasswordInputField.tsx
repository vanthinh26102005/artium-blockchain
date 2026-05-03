import { forwardRef, useState, type InputHTMLAttributes } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@shared/lib/utils'

import { BaseFormField } from './BaseFormField'
import { Button } from '../ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

type BasePasswordInputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
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
  fieldContainerClassName?: string
  errorFieldContainerClassName?: string
  inputClassName?: string
  toggleButtonClassName?: string
  iconClassName?: string
}

/**
 * BasePasswordInputField - React component
 * @returns React element
 */
export const BasePasswordInputField = forwardRef<HTMLInputElement, BasePasswordInputFieldProps>(
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
      fieldContainerClassName,
      errorFieldContainerClassName,
      inputClassName,
      toggleButtonClassName,
      iconClassName,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false)
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
        <InputGroup
          className={cn(fieldContainerClassName, isInvalid && errorFieldContainerClassName)}
        >
          <InputGroupInput
            ref={ref}
            id={id}
            type={isVisible ? 'text' : 'password'}
            aria-invalid={props['aria-invalid'] ?? isInvalid}
            aria-describedby={describedBy}
            className={cn(inputClassName, className)}
            {...props}
          />
          <InputGroupAddon className="p-0! bg-transparent" align="inline-end">
            <Button
              type="button"
              onClick={() => setIsVisible((prev) => !prev)}
              className={toggleButtonClassName}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
            >
              {isVisible ? <EyeOff className={iconClassName} /> : <Eye className={iconClassName} />}
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </BaseFormField>
    )
  },
)

BasePasswordInputField.displayName = 'BasePasswordInputField'

export type { BasePasswordInputFieldProps }
