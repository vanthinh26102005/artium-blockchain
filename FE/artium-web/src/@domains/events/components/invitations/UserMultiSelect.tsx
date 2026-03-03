import { useState, useId } from "react";
import { Check, ChevronDown, X } from "lucide-react";

// @shared
import { cn } from "@shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";

// @domains
import { mockProfiles, type DiscoverProfile } from "@domains/discover/mock/mockProfiles";
import { SelectedUserChip } from "./SelectedUserChip";

type UserMultiSelectProps = {
  value: string[]; // Array of user IDs
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function UserMultiSelect({
  value,
  onChange,
  placeholder = "Search users to invite...",
}: UserMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  // Get selected users
  const selectedUsers = mockProfiles.filter((profile) =>
    value.includes(profile.id)
  );

  const MAX_VISIBLE = 3;
  const visibleUsers = selectedUsers.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, selectedUsers.length - MAX_VISIBLE);

  const handleToggle = (userId: string) => {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    onChange(value.filter((id) => id !== userId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 focus:outline-none"
        >
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {value.length ? (
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                {visibleUsers.map((user) => (
                  <SelectedUserChip
                    key={user.id}
                    user={user}
                    onRemove={() => handleRemoveUser(user.id)}
                  />
                ))}
                {hiddenCount > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    + {hiddenCount} more
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleClearAll();
                      }}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] hover:bg-slate-100"
                      aria-label="Clear selection"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {value.length ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleClearAll();
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="h-5 w-px bg-slate-200" />
              </>
            ) : null}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[230] w-[min(380px,calc(100vw-28px))] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl sm:w-[420px]"
        align="start"
        side="bottom"
        sideOffset={8}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="rounded-xl border-0 bg-white text-slate-900 shadow-none [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-slate-200 [&_[cmdk-input]]:text-slate-900 [&_[cmdk-input]]:placeholder:text-slate-500 [&_[cmdk-input-wrapper]_svg]:text-slate-500">
          <CommandInput
            placeholder="Search by name or username..."
            className="h-10 text-slate-900 placeholder:text-slate-500"
          />
          <CommandList id={listId} className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-3 text-center text-sm text-slate-500">
              No users found.
            </CommandEmpty>
            {mockProfiles.map((profile) => (
              <CommandItem
                key={profile.id}
                value={`${profile.fullName} ${profile.username}`}
                onSelect={() => handleToggle(profile.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 py-3 text-slate-900 transition hover:bg-slate-100 active:bg-slate-200",
                  value.includes(profile.id) && "bg-blue-50 text-blue-700"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300",
                    value.includes(profile.id)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "bg-white"
                  )}
                >
                  {value.includes(profile.id) ? <Check className="h-3 w-3" /> : null}
                </span>
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold">{profile.fullName}</span>
                    {profile.isVerified && (
                      <svg
                        className="h-4 w-4 shrink-0 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="truncate text-xs text-slate-500">
                    @{profile.username}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
