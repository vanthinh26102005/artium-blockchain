import { X } from "lucide-react";
import type { DiscoverProfile } from "@domains/discover/mock/mockProfiles";

type SelectedUserChipProps = {
  user: DiscoverProfile;
  onRemove: () => void;
};

export function SelectedUserChip({ user, onRemove }: SelectedUserChipProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className="h-5 w-5 rounded-full object-cover"
      />
      <span className="max-w-[120px] truncate">{user.fullName}</span>
      <button
        type="button"
        onClick={handleRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/60 hover:bg-white/20 transition-colors"
        aria-label={`Remove ${user.fullName}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
