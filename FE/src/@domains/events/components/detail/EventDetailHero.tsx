// react
import { useMemo, useState } from "react";

// next
import Image from "next/image";

// third-party
import {
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  HelpCircle,
  Mail,
  Share2,
  XCircle,
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
import { type EventStatus } from "@domains/events/components/cards/EventCard";
import { type HostingEvent } from "@domains/events/state/useHostingEventsStore";

type EventDetailHeroProps = {
  event: HostingEvent;
  rsvpStatus: EventStatus;
  onRsvpChange: (status: EventStatus) => void;
  onInvite: () => void;
  onShare: () => void;
  onCopyLink?: () => void;
  isHosting?: boolean;
  onDeleteHosting?: () => void;
  onEditHosting?: () => void;
};

/**
 * statusStyles - Utility function
 * @returns void
 */
const statusStyles: Record<EventStatus, string> = {
  going: "border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-200",
  maybe: "border-yellow-500 bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  notGoing: "border-rose-500 bg-rose-100 text-rose-700 hover:bg-rose-200",
  rsvp: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
};

const statusLabels: Record<EventStatus, string> = {
  going: "Going",
  maybe: "Maybe",
/**
 * statusLabels - Utility function
 * @returns void
 */
  notGoing: "Not Going",
  rsvp: "RSVP",
};

const StatusIcon = ({ status }: { status: EventStatus }) => {
  if (status === "going") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "maybe") {
/**
 * StatusIcon - React component
 * @returns React element
 */
    return <HelpCircle className="h-4 w-4" />;
  }

  if (status === "notGoing") {
    return <XCircle className="h-4 w-4" />;
  }

  return null;
};

export const EventDetailHero = ({
  event,
  rsvpStatus,
  onRsvpChange,
  onInvite,
  onShare,
  onCopyLink,
  isHosting = false,
  onDeleteHosting,
/**
 * EventDetailHero - React component
 * @returns React element
 */
  onEditHosting,
}: EventDetailHeroProps) => {
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const typeLabels = useMemo(() => {
    const map = new Map<string, string>();
    EVENT_TYPE_OPTIONS.forEach((opt) => map.set(opt.value, opt.label));
    return event.types.map((type) => map.get(type) ?? type);
  }, [event.types]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="relative aspect-[32/9] w-full max-h-[420px] bg-slate-100">
          {event.coverImageUrl ? (
            <Image
/**
 * typeLabels - Utility function
 * @returns void
 */
              src={event.coverImageUrl}
              alt={event.title}
              fill
              className="object-cover"
/**
 * map - Utility function
 * @returns void
 */
              sizes="(min-width: 1280px) 90vw, 100vw"
              priority
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {typeLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto] md:gap-4">
          <h1 className="text-[24px] font-semibold leading-tight text-slate-900 sm:text-[26px]">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end md:gap-3">
            {isHosting ? null : (
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 min-w-[130px] cursor-pointer justify-center gap-2 rounded-full border text-sm font-semibold transition-colors",
                    statusStyles[rsvpStatus]
                  )}
                  onClick={() => setIsRsvpOpen((prev) => !prev)}
                >
                  <StatusIcon status={rsvpStatus} />
                  {statusLabels[rsvpStatus]}
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isRsvpOpen ? (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsRsvpOpen(false)} />
                    <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      {([
                        { value: "going" as EventStatus, label: "Going" },
                        { value: "maybe" as EventStatus, label: "Maybe" },
                        { value: "notGoing" as EventStatus, label: "Not Going" },
                      ]).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            onRsvpChange(option.value);
                            setIsRsvpOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <StatusIcon status={option.value} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="h-11 cursor-pointer justify-center gap-2 rounded-full border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              onClick={onInvite}
            >
              <Mail className="h-4 w-4" />
              Invite
            </Button>

            {isHosting ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 cursor-pointer justify-center gap-2 rounded-full border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                  onClick={onShare}
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
                      className="h-11 w-11 cursor-pointer rounded-full border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-50"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-[10rem] rounded-xl border-slate-200 bg-white p-2 font-inter text-slate-900 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        onEditHosting?.();
                        setIsMenuOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:bg-slate-100"
                    >
                      Edit event
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        onCopyLink?.();
                        setIsMenuOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:bg-slate-100"
                    >
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        onDeleteHosting?.();
                        setIsMenuOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:bg-rose-100"
                    >
                      Delete event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Share event"
                className="h-11 w-11 cursor-pointer rounded-full border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-50"
                onClick={onShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
