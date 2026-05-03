import {
  type TextareaHTMLAttributes,
  useMemo,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type FieldError } from "react-hook-form";

// @shared
import { cn } from "@shared/lib/utils";

// @domains - events
import { type InviteEventFormValues } from "@domains/events/types/invitation";
import type { HostingEvent } from "@domains/events/state/useHostingEventsStore";
import { inviteEventFormSchema } from "@domains/events/validations/eventForm.schema";

type InviteEventFormProps = {
  event: HostingEvent;
  onCancel: () => void;
  onPreview: (recipientEmails: string[]) => void;
  onSubmitSuccess: (recipientEmails: string[], message?: string) => Promise<void>;
};

/**
 * EMAIL_PATTERN - React component
 * @returns React element
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const EMPTY_EMAILS: string[] = [];

const parseEmails = (value: string) =>
/**
 * EMPTY_EMAILS - React component
 * @returns React element
 */
  value
    .split(/[,;\n\s]+/)
    .map((email) => email.trim())
    .filter(Boolean);

/**
 * parseEmails - Utility function
 * @returns void
 */
export function InviteEventForm({
  event,
  onCancel,
  onPreview,
  onSubmitSuccess,
}: InviteEventFormProps) {
  const {
    control,
    handleSubmit,
/**
 * InviteEventForm - React component
 * @returns React element
 */
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InviteEventFormValues>({
    resolver: zodResolver(inviteEventFormSchema),
    defaultValues: {
      recipientEmails: [],
      personalMessage: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchedRecipientEmails = useWatch({ control, name: "recipientEmails" });
  const recipientEmails = watchedRecipientEmails ?? EMPTY_EMAILS;
  const personalMessage = useWatch({ control, name: "personalMessage" }) ?? "";
  const [emailInput, setEmailInput] = useState("");

  const invalidEmails = useMemo(
    () => recipientEmails.filter((email) => !EMAIL_PATTERN.test(email)),
    [recipientEmails],
  );

  const mergeInputEmails = (emails: string[]) => {
    const parsed = parseEmails(emailInput);
/**
 * watchedRecipientEmails - Utility function
 * @returns void
 */
    if (!parsed.length) {
      return emails;
    }
    const unique = Array.from(
/**
 * recipientEmails - Utility function
 * @returns void
 */
      new Set([...emails, ...parsed].map((email) => email.toLowerCase())),
    );
    setEmailInput("");
    return unique.map(
/**
 * personalMessage - Utility function
 * @returns void
 */
      (email) => emails.find((item) => item.toLowerCase() === email) ?? email,
    );
  };

  const handleFormSubmit = async (values: InviteEventFormValues) => {
    const mergedEmails = mergeInputEmails(values.recipientEmails);
/**
 * invalidEmails - Utility function
 * @returns void
 */
    if (mergedEmails.length !== values.recipientEmails.length) {
      setValue("recipientEmails", mergedEmails, { shouldValidate: true });
    }
    await onSubmitSuccess(mergedEmails, values.personalMessage);
  };

  const handlePreviewClick = () => {
    const mergedEmails = mergeInputEmails(recipientEmails);
/**
 * mergeInputEmails - Utility function
 * @returns void
 */
    if (mergedEmails.length !== recipientEmails.length) {
      setValue("recipientEmails", mergedEmails, { shouldValidate: true });
    }
    onPreview(mergedEmails);
/**
 * parsed - Utility function
 * @returns void
 */
  };

  const handleAddEmails = () => {
    const nextEmails = parseEmails(emailInput);
    if (!nextEmails.length) {
      return;
    }
/**
 * unique - Utility function
 * @returns void
 */

    const unique = Array.from(
      new Set([...recipientEmails, ...nextEmails].map((email) => email.toLowerCase())),
    );

    const merged = unique.map((email) =>
      recipientEmails.find((item) => item.toLowerCase() === email) ?? email,
    );

    setEmailInput("");
    return merged;
  };
/**
 * handleFormSubmit - Utility function
 * @returns void
 */

  const handleAddFromInput = () => {
    const merged = handleAddEmails();
    if (merged) {
/**
 * mergedEmails - Utility function
 * @returns void
 */
      return merged;
    }
    return recipientEmails;
  };

  const handleRemoveEmail = (email: string) => {
    const next = recipientEmails.filter(
      (item) => item.toLowerCase() !== email.toLowerCase(),
    );
    return next;
/**
 * handlePreviewClick - Utility function
 * @returns void
 */
  };

  return (
    <form
/**
 * mergedEmails - Utility function
 * @returns void
 */
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex max-h-[75vh] flex-col overflow-hidden bg-slate-50"
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 pb-8 pt-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Event invitation
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {event.title}
/**
 * handleAddEmails - Utility function
 * @returns void
 */
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Send a personalized invitation to collectors, friends, or collaborators.
          </p>
/**
 * nextEmails - Utility function
 * @returns void
 */
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <FieldHeader
            label="Recipient Emails"
            required
            helper="Enter one or more email addresses. Use commas or press Enter to add."
          />
/**
 * unique - Utility function
 * @returns void
 */
          <Controller
            name="recipientEmails"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
/**
 * merged - Utility function
 * @returns void
 */
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const next = handleAddFromInput();
                        field.onChange(next);
                      }
                    }}
                    placeholder="Add email addresses"
                    className="h-[42px] w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
/**
 * handleAddFromInput - Utility function
 * @returns void
 */
                  />
                  <button
                    type="button"
                    onClick={() => field.onChange(handleAddFromInput())}
/**
 * merged - Utility function
 * @returns void
 */
                    className="h-[42px] rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Add
                  </button>
                </div>
                {field.value?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((email) => (
                      <span
                        key={email}
/**
 * handleRemoveEmail - Utility function
 * @returns void
 */
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {email}
                        <button
/**
 * next - Utility function
 * @returns void
 */
                          type="button"
                          onClick={() => field.onChange(handleRemoveEmail(email))}
                          className="text-slate-400 hover:text-slate-600"
                          aria-label={`Remove ${email}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          />
          <FieldErrorMessage error={errors.recipientEmails} />
          {invalidEmails.length > 0 && (
            <p className="text-xs text-rose-500">
              Invalid emails: {invalidEmails.join(", ")}
            </p>
          )}
          {recipientEmails.length > 0 && (
            <p className="text-xs text-slate-600">
              {recipientEmails.length} {recipientEmails.length === 1 ? "recipient" : "recipients"} added
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <FieldHeader
            label="Message"
            helper="Optional note to include in the invitation."
          />
          <Controller
            name="personalMessage"
            control={control}
            render={({ field }) => (
              <EventTextarea
                {...field}
                placeholder="Add a personal note to your invitation..."
                rows={4}
              />
            )}
          />
          <p className="mt-2 text-xs text-slate-500">
            {personalMessage ? personalMessage.length : 0} characters
/**
 * next - Utility function
 * @returns void
 */
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <EventButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </EventButton>
          <EventButton
            type="button"
            variant="outline"
            onClick={handlePreviewClick}
            disabled={recipientEmails.length === 0 || invalidEmails.length > 0 || isSubmitting}
          >
            Preview Email
          </EventButton>
          <EventButton
            type="submit"
            disabled={recipientEmails.length === 0 || invalidEmails.length > 0 || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Invitations"}
          </EventButton>
        </div>
      </div>
    </form>
  );
}

// --- Helper Components ---

type FieldHeaderProps = {
  label: string;
  required?: boolean;
  helper?: string;
};

const FieldHeader = ({ label, required, helper }: FieldHeaderProps) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {helper && <p className="text-xs text-slate-600">{helper}</p>}
    </div>
  );
};

const FieldErrorMessage = ({
  error,
}: {
  error?: FieldError | { message?: string };
}) => {
  if (!error) {
    return null;
  }
  return (
    <p className="text-xs font-medium text-rose-500">{String(error.message)}</p>
  );
};

type EventButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

const EventButton = ({
  variant = "primary",
  className,
  ...props
}: EventButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className
      )}
    />
  );
};

const EventTextarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none",
        className,
      )}
    />
  );
};

/**
 * FieldHeader - React component
 * @returns React element
 */
/**
 * FieldErrorMessage - React component
 * @returns React element
 */
/**
 * EventButton - React component
 * @returns React element
 */
/**
 * EventTextarea - React component
 * @returns React element
 */