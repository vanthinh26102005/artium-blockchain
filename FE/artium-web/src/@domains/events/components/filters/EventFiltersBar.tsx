// react
import { ChangeEvent } from "react";

// third-party
import { Search } from "lucide-react";

// @shared - components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@shared/components/ui/select";

// @domains - events
import {
    EVENT_STATUS_OPTIONS,
    type EventStatusValue,
} from "@domains/events/constants/eventFilterOptions";
import { MultiSelectEventType } from "@domains/events/components/filters/MultiSelectEventType";
import {
    EVENTS_HOSTING_SORT_OPTIONS,
    type EventsHostingSortValue,
} from "@domains/events/constants/hostingSortOptions";

type EventFiltersBarProps = {
    statusFilter: EventStatusValue;
    onStatusChange: (value: EventStatusValue) => void;
    eventTypeFilter: string[];
    onEventTypeChange: (value: string[]) => void;
    dateSortFilter: EventsHostingSortValue;
    onDateSortChange: (value: EventsHostingSortValue) => void;
    searchQuery: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const EventFiltersBar = ({
    statusFilter,
    onStatusChange,
    eventTypeFilter,
    onEventTypeChange,
    dateSortFilter,
    onDateSortChange,
    searchQuery,
    onSearchChange,
}: EventFiltersBarProps) => {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            {/* Filters Group - Below search on mobile, left side on desktop */}
            <div className="order-2 grid grid-cols-3 gap-2 md:order-1 md:flex md:flex-wrap md:items-center">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger
                        aria-label="Filter by status"
                        className="h-10 w-full cursor-pointer rounded-full border border-slate-200 bg-white px-3 font-inter text-[13px] font-semibold text-slate-900 shadow-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus:!border focus:!border-slate-300 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 data-[state=open]:border-slate-300 data-[state=open]:bg-slate-50 md:w-fit"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 bg-white font-inter text-slate-900 shadow-lg">
                        {EVENT_STATUS_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-[13px] font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Event Type Filter */}
                <MultiSelectEventType
                    selectedTypes={eventTypeFilter}
                    onSelectionChange={onEventTypeChange}
                />

                {/* Date Sort Filter */}
                <Select value={dateSortFilter} onValueChange={onDateSortChange}>
                    <SelectTrigger
                        aria-label="Sort by date"
                        className="h-10 w-full cursor-pointer rounded-full border border-slate-200 bg-white px-3 font-inter text-[13px] font-semibold text-slate-900 shadow-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus:!border focus:!border-slate-300 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 data-[state=open]:border-slate-300 data-[state=open]:bg-slate-50 md:w-fit"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 bg-white font-inter text-slate-900 shadow-lg">
                        {EVENTS_HOSTING_SORT_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-[13px] font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Search Input - On top on mobile, right side on desktop */}
            <div className="relative order-1 w-full md:order-2 md:ml-auto md:min-w-[160px] md:max-w-[400px] md:flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by title, location, artist or gallery name"
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 font-inter text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-slate-300 focus:outline-none focus:ring-0"
                />
            </div>
        </div>
    );
};
