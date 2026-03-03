import { registerEnumType } from '@nestjs/graphql';

/**
 * Art event type classification
 * Used in: Event.type
 */
export enum EventType {
  /** Art exhibition or gallery show */
  EXHIBITION = 'EXHIBITION',
  /** Gallery opening reception */
  GALLERY_OPENING = 'GALLERY_OPENING',
  /** Exclusive private viewing for VIP collectors */
  PRIVATE_VIEW = 'PRIVATE_VIEW',
  /** Art workshop or class */
  WORKSHOP = 'WORKSHOP',
  /** Artist talk or lecture */
  ARTIST_TALK = 'ARTIST_TALK',
  /** Art fair or trade show */
  ART_FAIR = 'ART_FAIR',
  /** Virtual/online event */
  ONLINE_EVENT = 'ONLINE_EVENT',
  /** Other event type */
  OTHER = 'OTHER',
}

/**
 * Event publication and lifecycle status
 * Used in: Event.status
 */
export enum EventStatus {
  /** Event created but not published */
  DRAFT = 'DRAFT',
  /** Event published and visible */
  PUBLISHED = 'PUBLISHED',
  /** Event cancelled */
  CANCELLED = 'CANCELLED',
  /** Event finished */
  COMPLETED = 'COMPLETED',
}

registerEnumType(EventType, {
  name: 'EventType',
  description:
    'Art event type (EXHIBITION, GALLERY_OPENING, WORKSHOP, ART_FAIR, etc.)',
});

registerEnumType(EventStatus, {
  name: 'EventStatus',
  description:
    'Event publication status (DRAFT, PUBLISHED, CANCELLED, COMPLETED)',
});
