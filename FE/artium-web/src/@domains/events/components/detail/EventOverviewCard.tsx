// third-party
import { CalendarRange, Clock4, Globe2, MapPin } from "lucide-react";

// @shared - utils
import { cn } from "@shared/lib/utils";
import { useMockAuth } from "@shared/mocks/mockAuth";

// @domains - events
import { type HostingEvent } from "@domains/events/state/useHostingEventsStore";

type EventOverviewCardProps = {
  event: HostingEvent;
  className?: string;
};

const formatDateRange = (start: string, end: string, timeZone?: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timeZone || undefined,
  };

  const startLabel = new Intl.DateTimeFormat("en-US", options).format(startDate);
  const endLabel = new Intl.DateTimeFormat("en-US", options).format(endDate);
  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

const formatTimeRange = (start: string, end: string, timeZone?: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timeZone || undefined,
  };

  const startLabel = new Intl.DateTimeFormat("en-US", options).format(startDate);
  const endLabel = new Intl.DateTimeFormat("en-US", options).format(endDate);
  const tzLabel = timeZone ? `(${timeZone.replace(/_/g, " ")})` : "(Local time)";
  return `${startLabel} - ${endLabel} ${tzLabel}`;
};

export const EventOverviewCard = ({ event, className }: EventOverviewCardProps) => {
  const { user } = useMockAuth();
  const visibilityLabel = event.visibility === "private" ? "Private event" : "Public event";
  const primaryAddress =
    event.locationType === "online"
      ? "Online event"
      : event.address || event.location || "In-person";
  const venueLine = event.venueDetails?.trim();
  const showVenueLine =
    Boolean(venueLine) &&
    venueLine !== (event.address ?? "").trim();

  const organizer = {
    name: user?.username ? user.username : "Organizer",
    username: user?.username ? `@${user.username}` : "@organizer",
    avatar: user?.avatarUrl || "/images/logo-dark-mode.png",
  };

  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6", className)}>
      <div className="space-y-6 font-inter">
        <h2 className="text-lg font-semibold text-slate-900">Overview</h2>

        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-start gap-3 text-slate-600">
            <MapPin className="mt-0.5 h-5 w-5 text-slate-600" />
            <div className="space-y-1">
              <p className="font-medium text-slate-800">{primaryAddress}</p>
              {event.locationType === "in-person" && showVenueLine ? (
                <p className="text-slate-600">{venueLine}</p>
              ) : null}
              {event.locationType === "online" && event.onlineUrl ? (
                <a
                  className="font-semibold text-blue-600 hover:underline"
                  href={event.onlineUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {event.onlineUrl}
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-600">
            <CalendarRange className="mt-0.5 h-5 w-5 text-slate-600" />
            <div className="space-y-1">
              <p className="font-medium text-slate-800">
                {formatDateRange(event.startDateTime, event.endDateTime, event.timeZone)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-600">
            <Clock4 className="mt-0.5 h-5 w-5 text-slate-600" />
            <div className="space-y-1">
              <p className="font-medium text-slate-800">
                {formatTimeRange(event.startDateTime, event.endDateTime, event.timeZone)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-600">
            <Globe2 className="mt-0.5 h-5 w-5 text-slate-600" />
            <div className="space-y-1">
              <p className="font-medium text-slate-800">{visibilityLabel}</p>
              <p className="text-slate-600">
                {event.visibility === "private"
                  ? "Only invited guests can see this event."
                  : "Anyone can view this event."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900">About this event</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {event.description || "No description provided yet."}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organized by</p>
          <div className="mt-3 flex items-center gap-3">
            <img
              src={organizer.avatar}
              alt={organizer.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{organizer.name}</p>
              <p className="text-xs text-slate-600">{organizer.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
