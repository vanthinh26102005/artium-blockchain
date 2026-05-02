// react
import { useState, useRef, useEffect } from "react";

// third-party
import { ChevronDown, Check } from "lucide-react";

// @shared
import { cn } from "@shared/lib/utils";

// @domains
import { EVENT_TYPE_OPTIONS } from "@domains/events/constants/eventFormOptions";

type MultiSelectEventTypeProps = {
    selectedTypes: string[];
    onSelectionChange: (types: string[]) => void;
};

export const MultiSelectEventType = ({
    selectedTypes,
    onSelectionChange,
}: MultiSelectEventTypeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggleType = (typeValue: string) => {
        if (selectedTypes.includes(typeValue)) {
            // Remove type
            onSelectionChange(selectedTypes.filter((t) => t !== typeValue));
        } else {
            // Add type
            onSelectionChange([...selectedTypes, typeValue]);
        }
    };

    const handleClearAll = () => {
        onSelectionChange([]);
        setIsOpen(false);
    };

    const displayText =
        selectedTypes.length === 0
            ? "Event Type"
            : selectedTypes.length === EVENT_TYPE_OPTIONS.length
                ? "All Types"
                : `Event Type`;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-full border bg-white px-3 font-inter text-[13px] font-semibold text-slate-900 shadow-none transition-colors focus:outline-none md:w-fit",
                    isOpen
                        ? "border-slate-300 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
            >
                <span>{displayText}</span>
                <div className="flex items-center gap-1.5">
                    {selectedTypes.length > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                            {selectedTypes.length}
                        </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                </div>
            </button>

            {/* Backdrop - prevents clicking other filters */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full z-[60] mt-2 w-[220px] rounded-xl border border-slate-200 bg-white p-2 font-inter shadow-lg">
                    {/* Options */}
                    <div>
                        {EVENT_TYPE_OPTIONS.map((option) => {
                            const isSelected = selectedTypes.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleToggleType(option.value)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    <div
                                        className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded border",
                                            isSelected
                                                ? "border-blue-600 bg-blue-600"
                                                : "border-slate-300 bg-white"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <span>{option.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear All Button */}
                    {selectedTypes.length > 0 && (
                        <>
                            <div className="my-2 h-px bg-slate-200" />
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <div className="h-4 w-4" />
                                <span>Clear All</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
