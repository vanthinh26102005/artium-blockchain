// third-party
import { Users } from "lucide-react";

// @shared - utils
import { cn } from "@shared/lib/utils";

type EventGuestsCardProps = {
  going: number;
  maybe: number;
  invited: number;
  className?: string;
  onSeeAll?: () => void;
};

export const EventGuestsCard = ({
  going,
  maybe,
  invited,
  className,
  onSeeAll,
}: EventGuestsCardProps) => {
  const stats = [
    { label: "Going", value: going },
    { label: "Maybe", value: maybe },
    { label: "Invited", value: invited },
  ];

  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Guests</p>
          </div>
        </div>
        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="cursor-pointer text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            See all
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="px-2">
            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
