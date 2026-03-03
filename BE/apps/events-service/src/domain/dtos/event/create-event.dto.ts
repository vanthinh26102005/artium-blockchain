import { EventStatus, EventType } from '@app/common';
import { EventLocationDto } from './event-location.dto';

export type CreateEventDto = {
  creatorId: string;
  title: string;
  description?: string;
  type?: EventType | string;
  status?: EventStatus | string;
  startTime?: string | Date;
  endTime?: string | Date;
  timezone?: string;
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
};
