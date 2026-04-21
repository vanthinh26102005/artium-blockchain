import { useRef } from 'react'
import { cn } from '@shared/lib/utils'

type OtpCodeInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  length?: number
  hasError?: boolean
  disabled?: boolean
  description?: string
  errorMessage?: string
}

const buildOtpDigits = (value: string, length: number) =>
  Array.from({ length }, (_, index) => value[index] ?? '')

export const OtpCodeInput = ({
  id,
  label,
  value,
  onChange,
  length = 6,
  hasError = false,
  disabled = false,
  description,
  errorMessage,
}: OtpCodeInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = buildOtpDigits(value.replace(/\D/g, '').slice(0, length), length)

  const commitValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\D/g, '').slice(0, length))
  }

  const handleDigitChange = (index: number, nextValue: string) => {
    const normalizedDigit = nextValue.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = normalizedDigit
    commitValue(nextDigits)

    if (normalizedDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      inputRefs.current[index + 1]?.select()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const nextDigits = [...digits]
      nextDigits[index - 1] = ''
      commitValue(nextDigits)
      inputRefs.current[index - 1]?.focus()
      inputRefs.current[index - 1]?.select()
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
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
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    if (!pastedDigits) {
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
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={`${id}-0`} className="text-xs font-bold tracking-[0.2em] text-[#6b6b6b] uppercase">
          {label} <span className="text-[#FF4337]">*</span>
        </label>
        {errorMessage ? (
          <p className="text-sm font-medium text-[#FF4337]">{errorMessage}</p>
        ) : description ? (
          <p className="text-sm text-[#6b6b6b]">{description}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3">
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
            disabled={disabled}
            aria-label={`${label} digit ${index + 1}`}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            onPaste={handlePaste}
            className={cn(
              'h-16 w-12 rounded-2xl border border-black/10 bg-white text-center text-2xl font-semibold text-[#191414] shadow-sm outline-none transition sm:h-[72px] sm:w-14 sm:text-[28px]',
              hasError
                ? 'border-[#FF4337] focus:border-[#FF4337] focus:ring-2 focus:ring-[#FF4337]/10'
                : 'focus:border-black',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          />
        ))}
      </div>
    </div>
  )
}
