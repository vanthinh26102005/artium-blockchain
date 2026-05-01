import { forwardRef, useState, type InputHTMLAttributes } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@shared/lib/utils'

import { BaseFormField } from './BaseFormField'

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

    return (
      <BaseFormField
        id={id}
        label={label}
        required={required}
        errorMessage={errorMessage}
        description={description}
        className={containerClassName}
        labelClassName={labelClassName}
        requiredMarkClassName={requiredMarkClassName}
        messageClassName={messageClassName}
        descriptionClassName={descriptionClassName}
      >
        <div className={cn(fieldContainerClassName, hasError && errorFieldContainerClassName)}>
          <input
            ref={ref}
            id={id}
            type={isVisible ? 'text' : 'password'}
            className={cn(inputClassName, className)}
            {...props}
          />

          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            className={toggleButtonClassName}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            {isVisible ? <EyeOff className={iconClassName} /> : <Eye className={iconClassName} />}
          </button>
        </div>
      </BaseFormField>
    )
  },
)

BasePasswordInputField.displayName = 'BasePasswordInputField'

export type { BasePasswordInputFieldProps }
