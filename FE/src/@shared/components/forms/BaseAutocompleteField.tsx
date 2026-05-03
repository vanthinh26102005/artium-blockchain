import { useCallback, useMemo, useState, type ChangeEvent } from 'react'

import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

import { BaseFormField } from './BaseFormField'

export type BaseAutocompleteOption = {
  value: string
  label: string
  searchTerms?: string
}

type BaseAutocompleteFieldProps = {
  id?: string
  options: BaseAutocompleteOption[]
  value: string
  onValueChange: (value: string) => void
  label: string
  required?: boolean
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  isLoading?: boolean
  errorMessage?: string
  description?: string
  className?: string
  labelClassName?: string
  requiredMarkClassName?: string
  inputClassName?: string
  dropdownClassName?: string
  optionClassName?: string
  selectedOptionClassName?: string
  messageClassName?: string
  descriptionClassName?: string
  maxVisibleOptions?: number
}

/**
 * BaseAutocompleteField - React component
 * @returns React element
 */
export const BaseAutocompleteField = ({
  id,
  options,
  value,
  onValueChange,
  label,
  required = false,
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  disabled = false,
  isLoading = false,
  errorMessage,
  description,
  className,
  labelClassName,
  requiredMarkClassName,
  inputClassName = 'h-12 rounded-xl border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0',
  dropdownClassName = 'absolute z-50 mt-1 max-h-[240px] w-full overflow-auto rounded-xl border border-[#E5E5E5] bg-white shadow-lg',
  optionClassName = 'w-full px-4 py-3 text-left text-[14px] text-[#191414] transition-colors hover:bg-blue-50',
  selectedOptionClassName = 'bg-blue-50 font-medium text-[#0066FF]',
  messageClassName,
  descriptionClassName,
  maxVisibleOptions = 50,
}: BaseAutocompleteFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const messageId = id ? `${id}-message` : undefined

  const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value])
/**
 * messageId - Utility function
 * @returns void
 */

  const filteredOptions = useMemo(() => {
    if (!search) {
      return options.slice(0, maxVisibleOptions)
    }
/**
 * selectedOption - Utility function
 * @returns void
 */

    const normalizedSearch = search.toLowerCase()
    return options
      .filter((option) => {
        const searchIn = option.searchTerms ?? option.label
/**
 * filteredOptions - Utility function
 * @returns void
 */
        return searchIn.toLowerCase().includes(normalizedSearch)
      })
      .slice(0, maxVisibleOptions)
  }, [maxVisibleOptions, options, search])

  const handleSelect = useCallback(
    (option: BaseAutocompleteOption) => {
      onValueChange(option.value)
/**
 * normalizedSearch - Utility function
 * @returns void
 */
      setSearch(option.label)
      setIsOpen(false)
    },
    [onValueChange],
  )

/**
 * searchIn - Utility function
 * @returns void
 */
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextSearch = event.target.value
      setSearch(nextSearch)
      setIsOpen(true)

      if (selectedOption && nextSearch !== selectedOption.label) {
        onValueChange('')
      }
/**
 * handleSelect - Utility function
 * @returns void
 */
    },
    [onValueChange, selectedOption],
  )

  const handleFocus = useCallback(() => {
    setSearch(selectedOption?.label || '')
    setIsOpen(true)
  }, [selectedOption])

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsOpen(false)
/**
 * handleInputChange - Utility function
 * @returns void
 */
      if (!selectedOption) {
        setSearch('')
      }
    }, 200)
  }, [selectedOption])
/**
 * nextSearch - Utility function
 * @returns void
 */

  const inputValue = isOpen ? search : selectedOption?.label || ''

  return (
    <BaseFormField
      id={id}
      label={label}
      required={required}
      errorMessage={errorMessage}
      description={description}
      messageId={messageId}
      className={cn('relative', className)}
      labelClassName={labelClassName}
      requiredMarkClassName={requiredMarkClassName}
/**
 * handleFocus - Utility function
 * @returns void
 */
      messageClassName={messageClassName}
      descriptionClassName={descriptionClassName}
    >
      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
/**
 * handleBlur - Utility function
 * @returns void
 */
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={messageId}
          className={inputClassName}
        />

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="h-4 w-4 text-[#989898]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
/**
 * inputValue - Utility function
 * @returns void
 */
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className={dropdownClassName}>
          {isLoading ? (
            <div className="p-3 text-center text-sm text-[#989898]">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-sm text-[#989898]">{emptyMessage}</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  handleSelect(option)
                }}
                className={cn(
                  optionClassName,
                  option.value === value && selectedOptionClassName,
                )}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </BaseFormField>
  )
}

export type { BaseAutocompleteFieldProps }
