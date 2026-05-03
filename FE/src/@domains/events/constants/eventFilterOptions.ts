/**
 * EVENT_STATUS_OPTIONS - React component
 * @returns React element
 */
export const EVENT_STATUS_OPTIONS = [
  { value: "all", label: "All events" },
  { value: "upcoming", label: "Upcoming events" },
  { value: "ongoing", label: "Ongoing events" },
  { value: "past", label: "Past events" },
] as const;

export type EventStatusValue =
  (typeof EVENT_STATUS_OPTIONS)[number]["value"];

export const EVENT_DATE_SORT_OPTIONS = [
  { value: "newest", label: "Event Date (Newest)" },
  { value: "oldest", label: "Event Date (Oldest)" },
/**
 * EVENT_DATE_SORT_OPTIONS - React component
 * @returns React element
 */
] as const;

export type EventDateSortValue =
  (typeof EVENT_DATE_SORT_OPTIONS)[number]["value"];
