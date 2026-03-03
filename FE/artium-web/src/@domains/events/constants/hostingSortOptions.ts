export const EVENTS_HOSTING_SORT_OPTIONS = [
  { value: "eventDateNewest", label: "Event Date (Newest)" },
  { value: "eventDateOldest", label: "Event Date (Oldest)" },
  { value: "createdDateNewest", label: "Created Date (Newest)" },
  { value: "createdDateOldest", label: "Created Date (Oldest)" },
  { value: "titleAsc", label: "Title A-Z" },
  { value: "titleDesc", label: "Title Z-A" },
] as const;

export type EventsHostingSortValue =
  (typeof EVENTS_HOSTING_SORT_OPTIONS)[number]["value"];
