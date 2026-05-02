// react
import { useEffect, useMemo, useState } from "react";

// third-party
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// @shared - components
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";

// @shared - utils
import { cn } from "@shared/lib/utils";

type DateTimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const TIME_STEP_MINUTES = 5;

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const MINUTES = Array.from(
  { length: 60 / TIME_STEP_MINUTES },
  (_, index) => String(index * TIME_STEP_MINUTES).padStart(2, "0"),
);

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
};

const formatDateTimeValue = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const formatDisplay = (value?: string) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const buildCalendar = (viewDate: Date): CalendarCell[][] => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const cells: CalendarCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  while (cells.length < 42) {
    const day = cells.length - (firstDay + daysInMonth) + 1;
    cells.push({
      date: new Date(nextYear, nextMonth, day),
      isCurrentMonth: false,
    });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

export const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Select date & time",
  className,
}: DateTimePickerProps) => {
  // -- state --
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });

  // -- effects --
  // Sync calendar month when external value changes (edit/reset flow).
  useEffect(() => {
    if (!value) {
      return;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewDate(parsed);
    }
  }, [value]);

  // -- derived --
  const selectedDate = useMemo(() => {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }
    return parsed;
  }, [value]);

  const selectedTime = useMemo(() => {
    if (!value) {
      return { hour: "", minute: "" };
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return { hour: "", minute: "" };
    }
    const hh = String(parsed.getHours()).padStart(2, "0");
    const min = String(parsed.getMinutes()).padStart(2, "0");
    return { hour: hh, minute: min };
  }, [value]);

  const calendarWeeks = useMemo(() => buildCalendar(viewDate), [viewDate]);
  const today = useMemo(() => new Date(), []);

  // -- handlers --
  const handlePrevMonth = () => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handleDateSelect = (day: Date) => {
    const hours = selectedTime.hour || "00";
    const minutes = selectedTime.minute || "00";
    const nextDate = new Date(day);
    nextDate.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(formatDateTimeValue(nextDate));
    setViewDate(nextDate);
  };

  const handleHourSelect = (hour: string) => {
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    baseDate.setHours(Number(hour), Number(selectedTime.minute || "00"), 0, 0);
    onChange(formatDateTimeValue(baseDate));
  };

  const handleMinuteSelect = (minute: string) => {
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    baseDate.setHours(Number(selectedTime.hour || "00"), Number(minute), 0, 0);
    onChange(formatDateTimeValue(baseDate));
  };

  // -- render --
  return (
    <>
      <style>{`
        .dtp-scroll-y::-webkit-scrollbar {
          width: 6px;
        }
        .dtp-scroll-y::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 12px;
        }
        .dtp-scroll-y:hover::-webkit-scrollbar-thumb {
          background: rgb(203 213 225);
        }
        .dtp-scroll-y {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          overscroll-behavior: contain;
        }
        .dtp-scroll-x {
          scrollbar-width: none;
          scrollbar-color: transparent transparent;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x;
          -ms-overflow-style: none;
          scrollbar-gutter: stable both-edges;
        }
        .dtp-scroll-x::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Popover modal={false}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-[44px] w-full items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50",
              className,
            )}
          >
            <CalendarDays className="h-4 w-4 text-slate-500" />
            {value ? (
              <span>{formatDisplay(value)}</span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          className="z-[9999] w-[min(360px,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:w-auto sm:min-w-[470px] sm:max-w-[520px]"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_70px_70px] sm:items-start">
            <div className="w-full">
              <div className="mb-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[150px] text-center text-sm font-semibold text-slate-900">
                  {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    {WEEKDAYS.map((day) => (
                      <th
                        key={day}
                        className="h-6 text-[11px] font-medium text-slate-500"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-center">
                  {calendarWeeks.map((week, rowIndex) => (
                    <tr key={rowIndex}>
                      {week.map((cell, cellIndex) => {
                        const isSelected =
                          selectedDate && isSameDay(cell.date, selectedDate);
                        const isToday = isSameDay(cell.date, today);

                        return (
                          <td key={cellIndex} className="p-[2px]">
                            <button
                              type="button"
                              onClick={() => handleDateSelect(cell.date)}
                              className={cn(
                                "flex h-9 w-full items-center justify-center rounded-full text-[13px] transition",
                                cell.isCurrentMonth
                                  ? "text-slate-900 hover:bg-slate-100 active:bg-slate-200"
                                  : "text-slate-300 hover:bg-slate-50",
                                isToday && !isSelected && "font-semibold text-slate-900 ring-1 ring-slate-200",
                                isSelected &&
                                  "!bg-blue-600 !font-semibold !text-white hover:!bg-blue-700 active:!bg-blue-700",
                              )}
                            >
                              {cell.date.getDate()}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hidden flex-col gap-1 border-l border-slate-200 pl-3 sm:flex">
              <div className="text-xs font-semibold text-slate-500">Hour</div>
              <div
                className="dtp-scroll-y max-h-[250px] overflow-y-auto pr-1"
                onWheel={(event) => event.stopPropagation()}
                onMouseEnter={(event) => {
                  event.currentTarget.style.scrollbarColor = "rgb(203 213 225) transparent";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.scrollbarColor = "transparent transparent";
                }}
              >
                <div className="space-y-1">
                  {HOURS.map((hour) => {
                    const isActive = hour === selectedTime.hour;
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleHourSelect(hour)}
                        className={cn(
                          "w-full rounded-full px-2 py-1 text-center text-[13px] font-semibold transition",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200",
                        )}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="hidden flex-col gap-1 border-l border-slate-200 pl-3 sm:flex">
              <div className="text-xs font-semibold text-slate-500">Minute</div>
              <div
                className="dtp-scroll-y max-h-[250px] overflow-y-auto pr-1"
                onWheel={(event) => event.stopPropagation()}
                onMouseEnter={(event) => {
                  event.currentTarget.style.scrollbarColor = "rgb(203 213 225) transparent";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.scrollbarColor = "transparent transparent";
                }}
              >
                <div className="space-y-1">
                  {MINUTES.map((minute) => {
                    const isActive = minute === selectedTime.minute;
                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleMinuteSelect(minute)}
                        className={cn(
                          "w-full rounded-full px-2 py-1 text-center text-[13px] font-semibold transition",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200",
                        )}
                      >
                        {minute}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2 sm:hidden">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Hour</div>
            <div
              className="dtp-scroll-x flex w-full max-w-full min-w-0 flex-nowrap gap-1 overflow-x-auto pb-1 px-3"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
                msOverflowStyle: "none",
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {HOURS.map((hour) => {
                const isActive = hour === selectedTime.hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={cn(
                      "min-w-[46px] rounded-full border border-slate-200 px-3 py-1.5 text-center text-[12px] font-semibold transition",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200",
                    )}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-semibold uppercase text-slate-500">Minute</div>
            <div
              className="dtp-scroll-x flex w-full max-w-full min-w-0 flex-nowrap gap-1 overflow-x-auto pb-1 px-3"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
                msOverflowStyle: "none",
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {MINUTES.map((minute) => {
                const isActive = minute === selectedTime.minute;
                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={cn(
                      "min-w-[46px] rounded-full border border-slate-200 px-3 py-1.5 text-center text-[12px] font-semibold transition",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200",
                    )}
                  >
                    {minute}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
