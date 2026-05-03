import { apiFetch, apiPost, encodePathSegment } from '@shared/services/apiClient'

export type EventLocation = {
  type?: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID'
  venueName?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  coordinates?: {
    latitude?: number
    longitude?: number
  }
  virtualUrl?: string
  accessInstructions?: string
}

export type EventApiResponse = {
  id: string
  creatorId: string
  title: string
  description?: string | null
  type: string
  status: string
  startTime?: string | null
  endTime?: string | null
  timezone?: string | null
  location?: EventLocation | null
  coverImageUrl?: string | null
  tags?: string[] | null
  isPublic?: boolean
  inviteOnly?: boolean
  attendeeCount?: number
  createdAt?: string
  updatedAt?: string | null
}

export type CreateEventRequest = {
  title: string
  description?: string
  startDateTime: string
  endDateTime: string
  timeZone?: string
  locationType: 'in-person' | 'online'
  address?: string
  venueDetails?: string
  onlineUrl?: string
  visibility: 'public' | 'private'
  types: string[]
  coverImageUrl?: string | null
}

export type UpdateEventRequest = Partial<CreateEventRequest>

export type SendEventInvitationsRequest = {
  recipients: Array<{
    id?: string
    email: string
    name?: string
  }>
  message?: string
  eventUrl?: string
  senderName?: string
  senderEmail?: string
}

/**
 * eventsApis - Utility function
 * @returns void
 */
const eventsApis = {
  getDiscoverEvents: async (): Promise<EventApiResponse[]> => {
    return apiFetch<EventApiResponse[]>('/events/discover', { auth: false })
  },

  getHostingEvents: async (): Promise<EventApiResponse[]> => {
    return apiFetch<EventApiResponse[]>('/events/hosting')
  },

  getEventById: async (eventId: string): Promise<EventApiResponse> => {
    return apiFetch<EventApiResponse>(`/events/${encodePathSegment(eventId)}`, { auth: false })
  },

  createEvent: async (payload: CreateEventRequest): Promise<EventApiResponse> => {
    return apiPost<EventApiResponse>('/events', payload)
  },

  updateEvent: async (eventId: string, payload: UpdateEventRequest): Promise<EventApiResponse> => {
    return apiFetch<EventApiResponse>(`/events/${encodePathSegment(eventId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  deleteEvent: async (eventId: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/events/${encodePathSegment(eventId)}`, {
      method: 'DELETE',
    })
  },

  sendInvitations: async (
    eventId: string,
    payload: SendEventInvitationsRequest,
  ): Promise<{ success: boolean; invitedCount?: number }> => {
    return apiPost<{ success: boolean; invitedCount?: number }>(
      `/events/${encodePathSegment(eventId)}/invitations`,
      payload,
    )
  },
}

export default eventsApis
