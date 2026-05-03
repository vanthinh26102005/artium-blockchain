import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

/**
 * dateFormat - Utility function
 * @returns void
 */
export const dateFormat = (date: Date | string, format?: string): string => {
  return dayjs(date).format(format)
}

export const getLocalTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
/**
 * getLocalTimezone - Utility function
 * @returns void
 */
