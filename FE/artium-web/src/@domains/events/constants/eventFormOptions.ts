export const EVENT_TYPE_OPTIONS = [
  { value: "exhibition", label: "Exhibition" },
  { value: "art-fair", label: "Art Fair" },
  { value: "gallery-opening", label: "Gallery Opening" },
  { value: "workshop", label: "Workshop" },
  { value: "panel-talk", label: "Panel Talk" },
  { value: "studio-visit", label: "Studio Visit" },
  { value: "museum-show", label: "Museum Show" },
  { value: "other", label: "Other" },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
] as const;
