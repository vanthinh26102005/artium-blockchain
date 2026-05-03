// react
import { useMemo, useState } from "react";

// next
import Image from "next/image";

// third-party
import {
  Copy,
  Lock,
  Mail,
  MoreHorizontal,
  PencilLine,
  Share2,
  Trash2,
  Unlock,
} from "lucide-react";

// @shared - components
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";

// @shared - utils
import { cn } from "@shared/lib/utils";

// @domains - events
import { EVENT_TYPE_OPTIONS } from "@domains/events/constants/eventFormOptions";
import { type HostingEvent } from "@domains/events/state/useHostingEventsStore";

type HostingEventCardProps = {
  event: HostingEvent;
  className?: string;
  onInvite?: (event: HostingEvent) => void;
  onShare?: (event: HostingEvent) => void;
  onEdit?: (event: HostingEvent) => void;
  onCopyLink?: (event: HostingEvent) => void;
  onDelete?: (event: HostingEvent) => void;
  onClick?: (eventId: string) => void;
};

/**
 * typeLabelMap - Utility function
 * @returns void
 */
const typeLabelMap = new Map<string, string>(
  EVENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

const formatBadge = (date: Date, timeZone?: string) => {
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
/**
 * formatBadge - Utility function
 * @returns void
 */
    timeZone,
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
/**
 * month - Utility function
 * @returns void
 */
    timeZone,
  }).format(date);
  return { month, day };
};

const formatMeta = (event: HostingEvent) => {
  const date = new Date(event.startDateTime);
/**
 * day - Utility function
 * @returns void
 */
  const timeZone = event.timeZone || undefined;
  const weekdayTime = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
  return `${event.location} - ${weekdayTime}`;
};
/**
 * formatMeta - Utility function
 * @returns void
 */

export const HostingEventCard = ({
  event,
  className,
/**
 * date - Utility function
 * @returns void
 */
  onInvite,
  onShare,
  onEdit,
  onCopyLink,
/**
 * timeZone - Utility function
 * @returns void
 */
  onDelete,
  onClick,
}: HostingEventCardProps) => {
  const badge = formatBadge(new Date(event.startDateTime), event.timeZone);
/**
 * weekdayTime - Utility function
 * @returns void
 */
  const meta = formatMeta(event);
  const typeText = useMemo(() => {
    if (!event.types.length) {
      return "Other";
    }
    return event.types.map((type) => typeLabelMap.get(type) ?? type).join(", ");
  }, [event.types]);
  const attendeesLabel = `${event.attendees} attendee${event.attendees === 1 ? "" : "s"}`;
  const isPrivate = event.visibility === "private";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
/**
 * HostingEventCard - React component
 * @returns React element
 */
      onClick(event.id);
    }
  };

  const handleMenuSelect = (
    eventAction?: (event: HostingEvent) => void,
  ) => (selectEvent: Event) => {
    selectEvent.preventDefault();
    selectEvent.stopPropagation();
    setIsMenuOpen(false);
    eventAction?.(event);
  };

/**
 * badge - Utility function
 * @returns void
 */
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border border-slate-200 bg-white font-inter shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition hover:shadow-[0_10px_22px_rgba(15,23,42,0.12)]",
/**
 * meta - Utility function
 * @returns void
 */
        onClick && "cursor-pointer",
        className,
      )}
      onClick={handleCardClick}
/**
 * typeText - Utility function
 * @returns void
 */
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="relative aspect-video w-full">
          {event.coverImageUrl ? (
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
/**
 * attendeesLabel - Utility function
 * @returns void
 */
              className="object-cover"
              unoptimized
            />
          ) : (
/**
 * isPrivate - Utility function
 * @returns void
 */
            <div className="h-full w-full bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
          )}
        </div>

        <div className="absolute right-4 top-4 flex flex-col items-center rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
/**
 * handleCardClick - Utility function
 * @returns void
 */
            {badge.month}
          </span>
          <span className="text-lg font-semibold text-slate-900">
            {badge.day}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 px-4 pb-4 pt-3">
/**
 * handleMenuSelect - Utility function
 * @returns void
 */
        <div className="break-words font-inter text-xs font-normal leading-none text-slate-500">
          {meta}
        </div>

        <h3 className="break-words font-inter text-lg font-semibold leading-none text-slate-900">
          {event.title}
        </h3>

        <p className="flex flex-wrap items-center gap-1 font-inter text-xs leading-none text-muted-foreground">
          <span>{typeText}</span>
          <span className="text-slate-400">-</span>
          <span className="whitespace-nowrap">{attendeesLabel}</span>
          {isPrivate ? (
            <Lock
              className="ml-1 inline-block h-[16px] w-[16px] align-text-bottom"
              strokeWidth="1.5"
            />
          ) : (
            <Unlock
              className="ml-1 inline-block h-[16px] w-[16px] align-text-bottom"
              strokeWidth="1.5"
            />
          )}
        </p>

        <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer justify-center gap-2 rounded-full border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={(e) => {
              e.stopPropagation();
              onInvite?.(event);
            }}
          >
            <Mail className="h-4 w-4" />
            Invite
          </Button>

          <Button
            type="button"
            variant="outline"
            className="cursor-pointer justify-center gap-2 rounded-full border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(event);
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="More actions"
                className="h-10 w-10 cursor-pointer rounded-full border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[10rem] rounded-xl border-slate-200 bg-white p-2 font-inter text-slate-900 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onSelect={handleMenuSelect(onEdit)}
                className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:bg-slate-100"
              >
                <PencilLine className="h-4 w-4" />
                Edit event
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleMenuSelect(onCopyLink)}
                className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:bg-slate-100"
              >
                <Copy className="h-4 w-4" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleMenuSelect(onDelete)}
                className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
};
