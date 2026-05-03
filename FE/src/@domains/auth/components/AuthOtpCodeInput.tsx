import { useRef } from 'react'
import { cn } from '@shared/lib/utils'
import { BaseFormField } from '@shared/components/forms'

type AuthOtpCodeInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  length?: number
  required?: boolean
  hasError?: boolean
  disabled?: boolean
  description?: string
  errorMessage?: string
}

/**
 * buildOtpDigits - Utility function
 * @returns void
 */
const buildOtpDigits = (value: string, length: number) =>
  Array.from({ length }, (_, index) => value[index] ?? '')

export const AuthOtpCodeInput = ({
  id,
  label,
  /**
   * AuthOtpCodeInput - React component
   * @returns React element
   */
  value,
  onChange,
  onBlur,
  length = 6,
  required = false,
  hasError = false,
  disabled = false,
  description,
  errorMessage,
}: AuthOtpCodeInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = buildOtpDigits(value.replace(/\D/g, '').slice(0, length), length)

  const commitValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\D/g, '').slice(0, length))
  }
  /**
   * inputRefs - Utility function
   * @returns void
   */

  const handleDigitChange = (index: number, nextValue: string) => {
    const normalizedDigit = nextValue.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    /**
     * digits - Utility function
     * @returns void
     */
    nextDigits[index] = normalizedDigit
    commitValue(nextDigits)

    if (normalizedDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      /**
       * commitValue - Utility function
       * @returns void
       */
      inputRefs.current[index + 1]?.select()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const nextDigits = [...digits]
      /**
       * handleDigitChange - Utility function
       * @returns void
       */
      nextDigits[index - 1] = ''
      commitValue(nextDigits)
      inputRefs.current[index - 1]?.focus()
      inputRefs.current[index - 1]?.select()
      /**
       * normalizedDigit - Utility function
       * @returns void
       */
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      /**
       * nextDigits - Utility function
       * @returns void
       */
      inputRefs.current[index - 1]?.select()
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      inputRefs.current[index + 1]?.select()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    const pastedDigits = event.clipboardData
      /**
       * handleKeyDown - Utility function
       * @returns void
       */
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    if (!pastedDigits) {
      /**
       * nextDigits - Utility function
       * @returns void
       */
      return
    }

    const nextDigits = buildOtpDigits(pastedDigits, length)
    commitValue(nextDigits)

    const focusIndex = Math.min(pastedDigits.length, length) - 1
    if (focusIndex >= 0) {
      inputRefs.current[focusIndex]?.focus()
      inputRefs.current[focusIndex]?.select()
    }
  }

  return (
    <BaseFormField
      id={`${id}-0`}
      label={label}
      required={required}
      errorMessage={errorMessage}
      description={description}
      className="space-y-3"
      /**
       * handlePaste - Utility function
       * @returns void
       */
      labelClassName="text-xs font-bold tracking-[0.2em] text-auth-label uppercase"
      requiredMarkClassName="text-auth-error"
      messageClassName="text-sm font-medium text-auth-error"
      descriptionClassName="text-sm text-auth-label"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        /** * pastedDigits - Utility function * @returns void */
        {digits.map((digit, index) => (
          <input
            key={`${id}-${index}`}
            ref={(node) => {
              inputRefs.current[index] = node
            }}
            id={`${id}-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            /**
             * nextDigits - Utility function
             * @returns void
             */
            disabled={disabled}
            aria-label={`${label} digit ${index + 1}`}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onBlur={onBlur}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            /**
             * focusIndex - Utility function
             * @returns void
             */
            onPaste={handlePaste}
            className={cn(
              'h-16 w-12 rounded-2xl border border-black/10 bg-white text-center text-2xl font-semibold text-kokushoku-black shadow-sm outline-none transition sm:h-[72px] sm:w-14 sm:text-[28px]',
              hasError
                ? 'border-auth-error focus:border-auth-error focus:ring-2 focus:ring-auth-error/10'
                : 'focus:border-black',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          />
        ))}
      </div>
    </BaseFormField>
  )
}
