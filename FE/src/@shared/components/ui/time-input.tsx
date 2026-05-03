import cn from 'classnames'
import { Clock } from 'lucide-react'
import { DateInput, DateSegment, TimeField } from 'react-aria-components'

export type TimeInputProps = {
  className?: string
  inputClassName?: string
  value: any
  onChange: (newValue: any) => void
  hourCycle?: 24 | 12
}
/**
 * TimeInput - React component
 * @returns React element
 */
const TimeInput = ({
  className,
  value,
  onChange,
  hourCycle = 24,
  inputClassName,
  ...props
}: TimeInputProps) => {
  return (
    <TimeField
      className={cn('relative', className)}
      value={value}
      onChange={onChange}
      hourCycle={hourCycle}
      {...props}
    >
      {/* icon */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-center ps-3">
        <Clock size={16} strokeWidth={2} aria-hidden="true" />
      </div>

      {/* input */}
      <DateInput
        className={cn(
          'relative inline-flex h-[44px] w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 ps-9 text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-[#0F6BFF] data-[disabled]:opacity-50',
          inputClassName,
        )}
      >
        {(segment) => (
          <DateSegment
            segment={segment}
            className="data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[disabled]:opacity-50"
          />
        )}
      </DateInput>
    </TimeField>
  )
}

TimeInput.displayName = 'TimeInput'

export { TimeInput }
