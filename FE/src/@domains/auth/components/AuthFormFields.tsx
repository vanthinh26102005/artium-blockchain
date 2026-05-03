import type { ComponentProps } from 'react'
import { Controller, type FieldPath, type FieldValues, useFormContext } from 'react-hook-form'

import { AuthInput } from './AuthInput'
import { AuthOtpCodeInput } from './AuthOtpCodeInput'
import { AuthPasswordInput } from './AuthPasswordInput'

type AuthFormInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof AuthInput>,
  'name' | 'hasError' | 'errorMessage'
> & {
  name: FieldPath<TFieldValues>
  clearRootErrorOnChange?: boolean
}

type AuthFormPasswordInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof AuthPasswordInput>,
  'name' | 'hasError' | 'errorMessage'
> & {
  name: FieldPath<TFieldValues>
  clearRootErrorOnChange?: boolean
}

type AuthFormOtpInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof AuthOtpCodeInput>,
  'value' | 'onChange' | 'onBlur' | 'hasError' | 'errorMessage'
> & {
  name: FieldPath<TFieldValues>
  clearRootErrorOnChange?: boolean
}

/**
 * useFieldError - Custom React hook
 * @returns void
 */
const useFieldError = <TFieldValues extends FieldValues>(name: FieldPath<TFieldValues>) => {
  const { getFieldState, formState } = useFormContext<TFieldValues>()
  return getFieldState(name, formState).error?.message
}

export const AuthFormInput = <TFieldValues extends FieldValues>({
  name,
  clearRootErrorOnChange = true,
  /**
   * AuthFormInput - React component
   * @returns React element
   */
  onChange,
  onBlur,
  ...props
}: AuthFormInputProps<TFieldValues>) => {
  const { register, clearErrors } = useFormContext<TFieldValues>()
  const errorMessage = useFieldError<TFieldValues>(name)
  const {
    ref,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
    ...field
    /**
     * errorMessage - Utility function
     * @returns void
     */
  } = register(name)

  return (
    <AuthInput
      {...props}
      {...field}
      ref={ref}
      onBlur={(event) => {
        fieldOnBlur(event)
        onBlur?.(event)
      }}
      onChange={(event) => {
        if (clearRootErrorOnChange) {
          clearErrors('root')
        }
        fieldOnChange(event)
        onChange?.(event)
      }}
      hasError={Boolean(errorMessage)}
      errorMessage={errorMessage}
    />
  )
}

export const AuthFormPasswordInput = <TFieldValues extends FieldValues>({
  name,
  clearRootErrorOnChange = true,
  onChange,
  onBlur,
  ...props
}: AuthFormPasswordInputProps<TFieldValues>) => {
  const { register, clearErrors } = useFormContext<TFieldValues>()
  const errorMessage = useFieldError<TFieldValues>(name)
  /**
   * AuthFormPasswordInput - React component
   * @returns React element
   */
  const { ref, onBlur: fieldOnBlur, onChange: fieldOnChange, ...field } = register(name)

  return (
    <AuthPasswordInput
      {...props}
      {...field}
      /**
       * errorMessage - Utility function
       * @returns void
       */
      ref={ref}
      onBlur={(event) => {
        fieldOnBlur(event)
        onBlur?.(event)
      }}
      onChange={(event) => {
        if (clearRootErrorOnChange) {
          clearErrors('root')
        }
        fieldOnChange(event)
        onChange?.(event)
      }}
      hasError={Boolean(errorMessage)}
      errorMessage={errorMessage}
    />
  )
}

export const AuthFormOtpInput = <TFieldValues extends FieldValues>({
  name,
  clearRootErrorOnChange = true,
  ...props
}: AuthFormOtpInputProps<TFieldValues>) => {
  const { control, clearErrors } = useFormContext<TFieldValues>()
  const errorMessage = useFieldError<TFieldValues>(name)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <AuthOtpCodeInput
          {...props}
          /**
           * AuthFormOtpInput - React component
           * @returns React element
           */
          value={typeof field.value === 'string' ? field.value : ''}
          onBlur={field.onBlur}
          onChange={(value) => {
            if (clearRootErrorOnChange) {
              clearErrors('root')
            }
            field.onChange(value)
          }}
          hasError={Boolean(errorMessage)}
          /**
           * errorMessage - Utility function
           * @returns void
           */
          errorMessage={errorMessage}
        />
      )}
    />
  )
}
