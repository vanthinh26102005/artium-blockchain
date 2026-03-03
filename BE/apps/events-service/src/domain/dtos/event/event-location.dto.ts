export type EventLocationDto = {
  type?: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  venueName?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  virtualUrl?: string;
  accessInstructions?: string;
};
