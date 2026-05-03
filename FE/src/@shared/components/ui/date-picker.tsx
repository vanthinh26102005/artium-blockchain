import { useMemo } from 'react'
import { CalendarIcon, XIcon } from 'lucide-react'
import _ from 'lodash'

// @shared - lib
import { cn } from '@shared/lib/utils'
// @shared - constants
import { HUMAN_READABLE_DATE_FORMAT } from '@shared/constants/dateTime'
// @shared - utils
import { dateFormat } from '@shared/utils/datetime'

// local
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

/**
 * DatePicker - React component
 * @returns React element
 */
export function DatePicker({
  className,
  mode = 'single',
  value,
  onChange,
  clearable = false,
  ...props
}: {
  className?: string
  mode: string
  value: any
  onChange: (newValue?: any) => void
  clearable?: boolean
}) {
  // -- display value --
  const displayValue = useMemo(() => {
    if (!value) return value

    /**
     * displayValue - Utility function
     * @returns void
     */
    if (mode === 'single') return dateFormat(value, HUMAN_READABLE_DATE_FORMAT)
    if (mode === 'multiple')
      return _.map(_.take(value || [], 2), (date: Date) =>
        dateFormat(date, HUMAN_READABLE_DATE_FORMAT),
      ).join(', ')
    if (mode === 'range')
      return `${dateFormat(value.from, HUMAN_READABLE_DATE_FORMAT)} - ${dateFormat(
        value.to,
        HUMAN_READABLE_DATE_FORMAT,
      )}`

    throw new Error('Unhandled mode')
  }, [mode, value])

  // -- placeholder --
  const placeholder = useMemo(() => {
    if (mode === 'single') return 'Pick a date'
    if (mode === 'multiple') return 'Pick date(s)'
    if (mode === 'range') return 'Pick a range'

    throw new Error('Unhandled mode')
    /**
     * placeholder - Utility function
     * @returns void
     */
  }, [mode])

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex w-full items-center justify-between rounded-md border px-[15px] py-[11px] text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate text-left">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {displayValue ? (
              <span className="truncate">{displayValue}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>

          {clearable && value && (
            <XIcon
              className="ml-2 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onChange(undefined)
              }}
            />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="start">
        {/* @ts-ignore */}
        <Calendar {...props} mode={mode} selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  )
}
