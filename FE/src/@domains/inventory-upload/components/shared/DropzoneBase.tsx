// react
import React, { useId, useRef, useState } from 'react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type DropzoneBaseProps = {
  title: string
  description?: string
  helperText?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  error?: string
  variant?: 'card' | 'inline'
  hideHeader?: boolean
  containerClassName?: string
  dropzoneClassName?: string
  renderDropzoneContent?: (inputId: string) => React.ReactNode
  onFiles: (files: File[]) => void
  children?: React.ReactNode
}

/**
 * DropzoneBase - React component
 * @returns React element
 */
export const DropzoneBase = ({
  title,
  description,
  helperText,
  accept,
  multiple = false,
  disabled = false,
  error,
  variant = 'card',
  hideHeader = false,
  containerClassName,
  dropzoneClassName,
  renderDropzoneContent,
  onFiles,
  children,
}: DropzoneBaseProps) => {
  // -- state --
  const [isDragging, setIsDragging] = useState(false)

  // -- refs --
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  /**
   * inputRef - Utility function
   * @returns void
   */
  // -- handlers --
  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) {
      return
      /**
       * inputId - Utility function
       * @returns void
       */
    }
    onFiles(Array.from(files))
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    /**
     * handleFiles - Utility function
     * @returns void
     */
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleClick = () => {
    if (disabled) {
      return
    }
    inputRef.current?.click()
  }
  /**
   * handleDrop - Utility function
   * @returns void
   */

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
    /**
     * handleClick - Utility function
     * @returns void
     */
  }

  // -- render --
  const wrapperClassName = cn(
    variant === 'card' ? 'rounded-4xl border border-black/10 bg-white p-4 lg:p-6' : 'space-y-3',
    containerClassName,
  )

  const dropzoneContent = renderDropzoneContent ? (
    renderDropzoneContent(inputId)
  ) : (
    /**
     * handleKeyDown - Utility function
     * @returns void
     */
    <>
      <span className="text-[15px] font-semibold text-[#191414] lg:text-[16px]">
        {disabled ? 'Uploads disabled' : 'Drag & drop or click to upload'}
      </span>
      <span className="mt-1 text-sm text-[#898788]">
        {multiple ? 'Select multiple files if needed.' : 'Single file only.'}
      </span>
    </>
  )

  return (
    <section className={wrapperClassName}>
      {hideHeader ? null : (
        /**
         * wrapperClassName - Utility function
         * @returns void
         */
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.05em] text-black/50 lg:text-[17px]">
              {title}
            </p>
            {description ? (
              <p className="mt-2 text-[15px] font-semibold text-[#191414] lg:text-[16px]">
                {description}
                /** * dropzoneContent - Utility function * @returns void */
              </p>
            ) : null}
            {helperText ? <p className="mt-1 text-sm text-[#898788]">{helperText}</p> : null}
          </div>
        </div>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) {
            setIsDragging(true)
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'mt-4 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-[#F5F5F5] px-4 text-center text-[15px] text-[#898788] transition',
          isDragging && 'border-[#0F6BFF] bg-[#0F6BFF]/5 text-[#0F6BFF]',
          disabled && 'cursor-not-allowed opacity-60',
          dropzoneClassName,
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
        {dropzoneContent}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  )
}
