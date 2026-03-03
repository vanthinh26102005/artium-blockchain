// react
import { useMemo } from "react";

// third-party
import { getTimeZones } from "@vvo/tzdb";

export type TimeZoneOption = {
  value: string;
  label: string;
};

const formatOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const minutes = String(absMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
};

export const useTimeZoneOptions = () => {
  // -- derived --
  const options = useMemo<TimeZoneOption[]>(() => {
    return getTimeZones()
      .map((zone) => {
        const offset = formatOffset(zone.currentTimeOffsetInMinutes);
        const labelName = zone.name.replace(/_/g, " ");
        return {
          value: zone.name,
          label: `${offset} ${labelName}`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "en"));
  }, []);

  return { options, isLoading: false };
};
