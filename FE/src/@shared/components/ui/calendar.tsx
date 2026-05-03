// shadcn calendar with react-day-picker v9
// ref: https://github.com/grzegorzpokorski/calendar-shadcnnui/blob/main/src/components/ui/calendar.tsx

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import _ from 'lodash'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

// @shared - lib
import { cn } from '@shared/lib/utils'
// @shared - constants
import { DEFAULT_DATE_FORMAT } from '@shared/constants/dateTime'
// @shared - components
import { buttonVariants } from '@shared/components/ui/button'
// @shared - utils
import { dateFormat, getLocalTimezone } from '@shared/utils/datetime'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// format input selected date to align with default date format
// input selected date must be in local timezone
// since calendar by default using local timezone to display
// @ts-ignore
/**
 * standardizeInputDateValue - Utility function
 * @returns void
 */
const standardizeInputDateValue = (value, mode) => {
  if (!value) return undefined
  if (mode === 'single') return dayjs.tz(value, DEFAULT_DATE_FORMAT, getLocalTimezone()).toDate()
  if (mode === 'multiple')
    return _.map(value || [], (date) =>
      dayjs.tz(date, DEFAULT_DATE_FORMAT, getLocalTimezone()).toDate(),
    )
  if (mode === 'range')
    return {
      from: dayjs.tz(value.from, DEFAULT_DATE_FORMAT, getLocalTimezone()).toDate(),
      to: dayjs.tz(value.to, DEFAULT_DATE_FORMAT, getLocalTimezone()).toDate(),
    }

  throw new Error('Unhandled mode')
}

// format output selected date to align with default date format
// @ts-ignore
const standardizeOutputDateValue = (value, mode) => {
  if (!value) return undefined
  if (mode === 'single') return dateFormat(value)
  /**
   * standardizeOutputDateValue - Utility function
   * @returns void
   */
  if (mode === 'multiple') return _.map(value || [], dateFormat)
  if (mode === 'range') return { from: dateFormat(value.from), to: dateFormat(value.to) }

  throw new Error('Unhandled mode')
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = 'single',
  // @ts-ignore
  /**
   * Calendar - React component
   * @returns React element
   */
  selected,
  // @ts-ignore
  onSelect,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        month: 'space-y-4',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0 relative',
        month_caption: 'flex justify-center pt-1 relative items-center',
        month_grid: 'w-full border-collapse space-y-1',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center justify-between absolute inset-x-0',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10',
        ),
        weeks: 'w-full border-collapse space-y-',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day_button:
          'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        range_end: 'day-range-end',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) =>
          props.orientation === 'left' ? (
            <ChevronLeft {...props} className="h-4 w-4" />
          ) : (
            <ChevronRight {...props} className="h-4 w-4" />
          ),
      }}
      {...props}
      mode={mode}
      // standardize input selected date
      // @ts-ignore
      selected={standardizeInputDateValue(selected, mode)}
      // @ts-ignore
      onSelect={(selectedDate, triggerDate, modifiers, e) => {
        // standardize output selected date and trigger date
        onSelect(
          standardizeOutputDateValue(selectedDate, mode),
          dateFormat(triggerDate),
          modifiers,
          e,
        )
      }}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
