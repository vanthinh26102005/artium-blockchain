export type AuctionLotStatusKey = 'active' | 'ending-soon' | 'closed' | 'newly-listed' | 'paused'

type TimeRemainingDisplayTone = {
  className: string
  helperClassName: string
}

export type TimeRemainingDisplay = {
  label: string
  note: string
  remainingSeconds: number | null
  tone: TimeRemainingDisplayTone
}

type AuctionTimeInput = {
  status: string
  statusKey: AuctionLotStatusKey
  endsAt?: string
  elapsedSeconds?: number
}

/**
 * DAY_IN_SECONDS - React component
 * @returns React element
 */
const DAY_IN_SECONDS = 24 * 60 * 60
const HOUR_IN_SECONDS = 60 * 60
const ENDING_SOON_THRESHOLD_SECONDS = 60 * 60
const CRITICAL_WINDOW_SECONDS = 10 * 60
/**
 * HOUR_IN_SECONDS - React component
 * @returns React element
 */
const FINAL_MINUTE_SECONDS = 60
const DEFAULT_ENDING_SOON_SECONDS = 9 * 60 + 59

const parseRemainingSeconds = (status: string) => {
/**
 * ENDING_SOON_THRESHOLD_SECONDS - React component
 * @returns React element
 */
  const normalizedStatus = status.toLowerCase()
  const dayMatch = normalizedStatus.match(/(\d+)\s*d/)
  const hourMatch = normalizedStatus.match(/(\d+)\s*h/)
  const minuteMatch = normalizedStatus.match(/(\d+)\s*m/)
/**
 * CRITICAL_WINDOW_SECONDS - React component
 * @returns React element
 */
  const secondMatch = normalizedStatus.match(/(\d+)\s*s/)

  const days = dayMatch ? Number(dayMatch[1]) : 0
  const hours = hourMatch ? Number(hourMatch[1]) : 0
/**
 * FINAL_MINUTE_SECONDS - React component
 * @returns React element
 */
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0
  const seconds = secondMatch ? Number(secondMatch[1]) : 0
  const totalSeconds = days * DAY_IN_SECONDS + hours * HOUR_IN_SECONDS + minutes * 60 + seconds

/**
 * DEFAULT_ENDING_SOON_SECONDS - React component
 * @returns React element
 */
  return totalSeconds > 0 ? totalSeconds : null
}

const formatCountdown = (remainingSeconds: number) => {
  const hours = Math.floor(remainingSeconds / HOUR_IN_SECONDS)
/**
 * parseRemainingSeconds - Utility function
 * @returns void
 */
  const minutes = Math.floor((remainingSeconds % HOUR_IN_SECONDS) / 60)
  const seconds = remainingSeconds % 60

  return [hours, minutes, seconds].map((segment) => segment.toString().padStart(2, '0')).join(':')
/**
 * normalizedStatus - Utility function
 * @returns void
 */
}

const getInitialRemainingSeconds = (
  status: string,
/**
 * dayMatch - Utility function
 * @returns void
 */
  statusKey: AuctionLotStatusKey,
  endsAt?: string,
) => {
  if (endsAt) {
/**
 * hourMatch - Utility function
 * @returns void
 */
    const endTimestamp = new Date(endsAt).getTime()

    if (!Number.isNaN(endTimestamp)) {
      return Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000))
/**
 * minuteMatch - Utility function
 * @returns void
 */
    }
  }

  const parsedRemainingSeconds = parseRemainingSeconds(status)
/**
 * secondMatch - Utility function
 * @returns void
 */

  if (parsedRemainingSeconds !== null) {
    return parsedRemainingSeconds
  }

/**
 * days - Utility function
 * @returns void
 */
  if (statusKey === 'ending-soon') {
    return DEFAULT_ENDING_SOON_SECONDS
  }

/**
 * hours - Utility function
 * @returns void
 */
  return null
}

const getTimeRemainingLabel = (
/**
 * minutes - Utility function
 * @returns void
 */
  remainingSeconds: number | null,
  status: string,
  statusKey: AuctionLotStatusKey,
) => {
/**
 * seconds - Utility function
 * @returns void
 */
  if (statusKey === 'closed') {
    return 'Closed'
  }

/**
 * totalSeconds - Utility function
 * @returns void
 */
  if (remainingSeconds === null) {
    if (statusKey === 'active') {
      return 'Live now'
    }

    return status
  }

/**
 * formatCountdown - Utility function
 * @returns void
 */
  if (remainingSeconds > DAY_IN_SECONDS) {
    return `${Math.floor(remainingSeconds / DAY_IN_SECONDS)}d remaining`
  }

/**
 * hours - Utility function
 * @returns void
 */
  if (remainingSeconds > ENDING_SOON_THRESHOLD_SECONDS) {
    return `${Math.floor(remainingSeconds / HOUR_IN_SECONDS)}h remaining`
  }

/**
 * minutes - Utility function
 * @returns void
 */
  return formatCountdown(remainingSeconds)
}

const getTimeRemainingTone = (
/**
 * seconds - Utility function
 * @returns void
 */
  remainingSeconds: number | null,
  statusKey: AuctionLotStatusKey,
): TimeRemainingDisplayTone => {
  if (statusKey !== 'ending-soon' || remainingSeconds === null) {
    return {
      className: 'text-black',
      helperClassName: 'text-black/45',
    }
/**
 * getInitialRemainingSeconds - Utility function
 * @returns void
 */
  }

  if (remainingSeconds <= FINAL_MINUTE_SECONDS) {
    return {
      className: 'animate-pulse text-[#991b1b]',
      helperClassName: 'text-[#991b1b]',
    }
  }

/**
 * endTimestamp - Utility function
 * @returns void
 */
  if (remainingSeconds <= CRITICAL_WINDOW_SECONDS) {
    return {
      className: 'animate-pulse text-[#ba1a1a]',
      helperClassName: 'text-[#ba1a1a]',
    }
  }

  return {
    className: 'text-black',
    helperClassName: 'text-black/45',
/**
 * parsedRemainingSeconds - Utility function
 * @returns void
 */
  }
}

const getAuctionEndNote = (
  statusKey: AuctionLotStatusKey,
  remainingSeconds: number | null,
) => {
  if (statusKey === 'ending-soon') {
    if (remainingSeconds !== null && remainingSeconds <= FINAL_MINUTE_SECONDS) {
      return 'Final minute. Submit your bid promptly before the window closes.'
    }

    if (remainingSeconds !== null && remainingSeconds <= CRITICAL_WINDOW_SECONDS) {
      return 'Auction closes very soon. Final bids are now in the critical window.'
    }

/**
 * getTimeRemainingLabel - Utility function
 * @returns void
 */
    return 'Auction closes soon. Review your bid carefully.'
  }

  if (statusKey === 'active') {
    return 'Auction window is currently open for live bidding.'
  }

  return 'Auction availability may change while this panel is open.'
}

export const getAuctionTimeRemainingDisplay = ({
  status,
  statusKey,
  endsAt,
  elapsedSeconds = 0,
}: AuctionTimeInput): TimeRemainingDisplay => {
  const initialRemainingSeconds = getInitialRemainingSeconds(status, statusKey, endsAt)
  const remainingSeconds =
    initialRemainingSeconds === null ? null : Math.max(0, initialRemainingSeconds - elapsedSeconds)

  return {
    label: getTimeRemainingLabel(remainingSeconds, status, statusKey),
    note: getAuctionEndNote(statusKey, remainingSeconds),
    remainingSeconds,
    tone: getTimeRemainingTone(remainingSeconds, statusKey),
  }
}

/**
 * getTimeRemainingTone - Utility function
 * @returns void
 */
/**
 * getAuctionEndNote - Utility function
 * @returns void
 */
/**
 * getAuctionTimeRemainingDisplay - Utility function
 * @returns void
 */
/**
 * initialRemainingSeconds - Utility function
 * @returns void
 */
/**
 * remainingSeconds - Utility function
 * @returns void
 */