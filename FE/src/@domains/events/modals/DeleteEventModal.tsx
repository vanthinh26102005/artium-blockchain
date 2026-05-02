// @shared - components
import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogPrimitive,
} from "@shared/components/ui/dialog";
import { X } from "lucide-react";

type DeleteEventModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  eventTitle?: string;
};

export const DeleteEventModal = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  eventTitle,
}: DeleteEventModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-[200] w-full max-w-[420px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border border-slate-200 bg-white font-inter shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header with Title and Close Button */}
          <div className="flex items-start justify-between px-6 pt-5 pb-0">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Delete this event?
            </h2>
            <DialogPrimitive.Close
              className="rounded-sm text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Description */}
          <div className="px-6 pt-4 pb-6">
            <p className="text-sm leading-relaxed text-slate-600">
              This action is permanent and will remove
              {eventTitle ? ` "${eventTitle}"` : " the event"} from your
              dashboard. Anyone you've invited will no longer have access.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="grid grid-cols-2 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-none text-sm font-medium text-slate-800 hover:bg-slate-50"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-none border-l border-slate-200 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Delete Event
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
