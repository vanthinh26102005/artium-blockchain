// third-party
import { create } from 'zustand'

// @domains - events
import { type EventStatus } from '@domains/events/components/cards/EventCard'

type GuestStats = {
  going: number
  maybe: number
  invited: number
  rsvpStatus: EventStatus
}

type EventDetailState = {
  guestStats: Record<string, GuestStats>
  initializeStats: (eventId: string, initial?: Partial<GuestStats>) => GuestStats
  setRsvpStatus: (eventId: string, nextStatus: EventStatus) => GuestStats
  setInvitedCount: (eventId: string, invited: number) => GuestStats
}

/**
 * buildDefaultStats - Utility function
 * @returns void
 */
const buildDefaultStats = (initial?: Partial<GuestStats>): GuestStats => ({
  going: initial?.going ?? 0,
  maybe: initial?.maybe ?? 0,
  invited: initial?.invited ?? 0,
  rsvpStatus: initial?.rsvpStatus ?? 'rsvp',
})

export const useEventDetailStore = create<EventDetailState>((set, get) => ({
  guestStats: {},

  /**
   * useEventDetailStore - Custom React hook
   * @returns void
   */
  initializeStats: (eventId, initial) => {
    const current = get().guestStats[eventId]
    if (current) {
      return current
    }

    const built = buildDefaultStats(initial)
    /**
     * current - Utility function
     * @returns void
     */
    set((state) => ({
      guestStats: {
        ...state.guestStats,
        [eventId]: built,
      },
    }))
    return built
  },
  /**
   * built - Utility function
   * @returns void
   */

  setRsvpStatus: (eventId, nextStatus) => {
    const stats = get().guestStats[eventId] ?? buildDefaultStats()
    let going = stats.going
    let maybe = stats.maybe

    if (stats.rsvpStatus === 'going') {
      going = Math.max(0, going - 1)
    } else if (stats.rsvpStatus === 'maybe') {
      maybe = Math.max(0, maybe - 1)
    }

    if (nextStatus === 'going') {
      going += 1
      /**
       * stats - Utility function
       * @returns void
       */
    } else if (nextStatus === 'maybe') {
      maybe += 1
    }

    const nextStats: GuestStats = {
      ...stats,
      going,
      maybe,
      rsvpStatus: nextStatus,
    }

    set((state) => ({
      guestStats: {
        ...state.guestStats,
        [eventId]: nextStats,
      },
    }))

    return nextStats
    /**
     * nextStats - Utility function
     * @returns void
     */
  },

  setInvitedCount: (eventId, invited) => {
    const stats = get().guestStats[eventId] ?? buildDefaultStats()
    const nextStats: GuestStats = {
      ...stats,
      invited: Math.max(0, invited),
    }

    set((state) => ({
      guestStats: {
        ...state.guestStats,
        [eventId]: nextStats,
      },
    }))

    return nextStats
  },
}))

export type { GuestStats }
/**
 * stats - Utility function
 * @returns void
 */

/**
 * nextStats - Utility function
 * @returns void
 */
