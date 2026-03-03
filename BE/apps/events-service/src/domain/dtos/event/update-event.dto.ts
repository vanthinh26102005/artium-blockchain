import { EventStatus, EventType } from '@app/common';
import { EventLocationDto } from './event-location.dto';

export type UpdateEventDto = {
  title?: string;
  description?: string | null;
  type?: EventType | string;
  status?: EventStatus | string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  timezone?: string | null;
  location?: EventLocationDto | null;
  coverImageUrl?: string | null;
  isPublic?: boolean;
  inviteOnly?: boolean;
  requiresRegistration?: boolean;
  maxAttendees?: number | null;
  registrationDeadline?: string | Date | null;
  isFree?: boolean;
  ticketPrice?: string | number | null;
  currency?: string | null;
  externalUrl?: string | null;
  tags?: string[] | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | Date | null;
  publishedAt?: string | Date | null;
};
