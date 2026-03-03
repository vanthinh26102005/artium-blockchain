import { EventStatus, EventType } from '@app/common';
import { EventLocationDto } from '../dtos';

const EVENT_TYPE_MAP: Record<string, EventType> = {
  'exhibition': EventType.EXHIBITION,
  'gallery-opening': EventType.GALLERY_OPENING,
  'private-view': EventType.PRIVATE_VIEW,
  'studio-visit': EventType.PRIVATE_VIEW,
  'workshop': EventType.WORKSHOP,
  'artist-talk': EventType.ARTIST_TALK,
  'panel-talk': EventType.ARTIST_TALK,
  'art-fair': EventType.ART_FAIR,
  'online-event': EventType.ONLINE_EVENT,
  'virtual-event': EventType.ONLINE_EVENT,
  'other': EventType.OTHER,
  'museum-show': EventType.OTHER,
};

const EVENT_STATUS_MAP: Record<string, EventStatus> = {
  draft: EventStatus.DRAFT,
  published: EventStatus.PUBLISHED,
  cancelled: EventStatus.CANCELLED,
  completed: EventStatus.COMPLETED,
};

const normalizeKey = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.trim().toLowerCase();
};

export const normalizeEventType = (value?: string | EventType): EventType => {
  if (!value) return EventType.OTHER;
  const direct =
    typeof value === 'string' ? (value as EventType) : value;
  if (Object.values(EventType).includes(direct)) {
    return direct;
  }
  const key = normalizeKey(String(value));
  return key && EVENT_TYPE_MAP[key] ? EVENT_TYPE_MAP[key] : EventType.OTHER;
};

export const normalizeEventStatus = (
  value?: string | EventStatus,
  fallback: EventStatus = EventStatus.PUBLISHED,
): EventStatus => {
  if (!value) return fallback;
  const direct =
    typeof value === 'string' ? (value as EventStatus) : value;
  if (Object.values(EventStatus).includes(direct)) {
    return direct;
  }
  const key = normalizeKey(String(value));
  return key && EVENT_STATUS_MAP[key] ? EVENT_STATUS_MAP[key] : fallback;
};

export const normalizeLocation = (
  location?: EventLocationDto | null,
): EventLocationDto | null => {
  if (!location) return null;
  const type = location.type
    ? location.type.toUpperCase()
    : undefined;
  const normalizedType =
    type === 'PHYSICAL' || type === 'VIRTUAL' || type === 'HYBRID'
      ? (type as 'PHYSICAL' | 'VIRTUAL' | 'HYBRID')
      : undefined;

  return {
    ...location,
    ...(normalizedType ? { type: normalizedType } : {}),
  };
};

export const parseDate = (
  value?: string | Date | null,
): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
