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
          'border-input bg-background relative inline-flex h-[44px] w-full items-center overflow-hidden rounded-lg border px-3 py-2 ps-9 text-sm whitespace-nowrap shadow-sm shadow-black/5 transition-shadow data-[disabled]:opacity-50 data-[focus-within]:border-[#0F6BFF]',
          inputClassName,
        )}
      >
        {(segment) => (
          <DateSegment
            segment={segment}
            className="data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 text-foreground data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive inline rounded p-0.5 caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[type=literal]:px-0"
          />
        )}
      </DateInput>
    </TimeField>
  )
}

TimeInput.displayName = 'TimeInput'

export { TimeInput }
