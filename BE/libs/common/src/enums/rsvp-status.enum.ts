/**
 * Event RSVP response status
 * Used in: EventRsvp.status
 */
export enum RSVPStatus {
  /** Invitation sent, awaiting response */
  PENDING = 'pending',
  /** User accepted invitation */
  ACCEPTED = 'accepted',
  /** User declined invitation */
  DECLINED = 'declined',
}
