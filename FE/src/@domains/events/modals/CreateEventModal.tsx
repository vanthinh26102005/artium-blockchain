// @domains - events
import {
  EventDialog,
  EventDialogContent,
  EventDialogTitle,
} from "@domains/events/modals/EventDialog";

// @domains - events
import { CreateEventForm, type CreateEventFormValues } from "@domains/events/forms/CreateEventForm";
import { type HostingEvent } from "@domains/events/state/useHostingEventsStore";

type CreateEventModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (values: CreateEventFormValues) => void;
  onUpdate?: (id: string, values: CreateEventFormValues) => void;
  editingEvent?: HostingEvent | null;
};

/**
 * CreateEventModal - React component
 * @returns React element
 */
export const CreateEventModal = ({
  open,
  onOpenChange,
  onCreate,
  onUpdate,
  editingEvent,
}: CreateEventModalProps) => {
  const isEditing = Boolean(editingEvent);

  const initialValues = editingEvent
/**
 * isEditing - Utility function
 * @returns void
 */
    ? {
        title: editingEvent.title,
        startDateTime: editingEvent.startDateTime.slice(0, 16),
        endDateTime: editingEvent.endDateTime.slice(0, 16),
        timeZone: editingEvent.timeZone ?? "",
/**
 * initialValues - Utility function
 * @returns void
 */
        locationType: editingEvent.locationType,
        onlineUrl: editingEvent.onlineUrl ?? "",
        address: editingEvent.address ?? "",
        venueDetails: editingEvent.venueDetails ?? "",
        types: editingEvent.types,
        visibility: editingEvent.visibility,
        description: editingEvent.description ?? "",
        coverImage: null,
      }
    : undefined;

  // -- render --
  return (
    <EventDialog open={open} onOpenChange={onOpenChange}>
      <EventDialogContent className="max-h-[85vh] overflow-hidden font-inter">
        <div className="border-b border-slate-200 pb-5 pt-4 text-center">
          <EventDialogTitle className="text-3xl leading-tight">
            {isEditing ? "Edit Event" : "Create Event"}
          </EventDialogTitle>
        </div>
        <CreateEventForm
          key={editingEvent?.id ?? "new-event"}
          onCancel={() => onOpenChange(false)}
          mode={isEditing ? "edit" : "create"}
          initialValues={initialValues}
          initialCoverImageUrl={editingEvent?.coverImageUrl ?? null}
          onSubmitSuccess={async (values) => {
            if (isEditing && editingEvent) {
              await onUpdate?.(editingEvent.id, values);
            } else {
              await onCreate?.(values);
            }
            onOpenChange(false);
          }}
        />
      </EventDialogContent>
    </EventDialog>
  );
};
