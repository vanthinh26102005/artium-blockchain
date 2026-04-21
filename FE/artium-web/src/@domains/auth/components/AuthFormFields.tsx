import type { ComponentProps } from 'react'
import { Controller, type FieldPath, type FieldValues, useFormContext } from 'react-hook-form'

import { AuthInput } from './AuthInput'
import { OtpCodeInput } from './OtpCodeInput'
import { PasswordInput } from './PasswordInput'

type AuthFormInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof AuthInput>,
  'name' | 'hasError' | 'errorMessage'
> & {
  name: FieldPath<TFieldValues>
  clearRootErrorOnChange?: boolean
}

type AuthFormPasswordInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof PasswordInput>,
  'name' | 'hasError' | 'errorMessage'
> & {
  name: FieldPath<TFieldValues>
  clearRootErrorOnChange?: boolean
}

type AuthFormOtpInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof OtpCodeInput>,
  'value' | 'onChange' | 'onBlur' | 'hasError' | 'errorMessage'
> & {
  name: FieldPath<TFieldValues>
  clearRootErrorOnChange?: boolean
}

const useFieldError = <TFieldValues extends FieldValues>(name: FieldPath<TFieldValues>) => {
  const { getFieldState, formState } = useFormContext<TFieldValues>()
  return getFieldState(name, formState).error?.message
}

export const AuthFormInput = <TFieldValues extends FieldValues>({
  name,
  clearRootErrorOnChange = true,
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
  const {
    ref,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
    ...field
  } = register(name)

  return (
    <PasswordInput
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
        <OtpCodeInput
          {...props}
          value={typeof field.value === 'string' ? field.value : ''}
          onBlur={field.onBlur}
          onChange={(value) => {
            if (clearRootErrorOnChange) {
              clearErrors('root')
            }
            field.onChange(value)
          }}
          hasError={Boolean(errorMessage)}
          errorMessage={errorMessage}
        />
      )}
    />
  )
}
