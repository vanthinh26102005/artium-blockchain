// react
import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ComponentProps,
  type ReactNode,
} from "react";

// next
import Image from "next/image";

// third-party
import { Check, ChevronDown, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type FieldError } from "react-hook-form";

// @shared - utils
import { cn } from "@shared/lib/utils";

// @shared - components
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";

// @domains - events
import { DateTimePicker } from "@domains/events/components/fields/DateTimePicker";
import {
  EVENT_TYPE_OPTIONS,
  VISIBILITY_OPTIONS,
} from "@domains/events/constants/eventFormOptions";
import { useTimeZoneOptions } from "@domains/events/hooks/useTimeZoneOptions";
import {
  ALLOWED_IMAGE_TYPES,
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  VENUE_LIMIT,
  createEventFormSchema,
  type CreateEventFormValues,
} from "@domains/events/validations/eventForm.schema";

type CreateEventFormProps = {
  onCancel: () => void;
  onSubmitSuccess?: (values: CreateEventFormValues) => Promise<void> | void;
  initialValues?: Partial<CreateEventFormValues>;
  initialCoverImageUrl?: string | null;
  mode?: "create" | "edit";
};

export type { CreateEventFormValues } from "@domains/events/validations/eventForm.schema";

const formatDateTimeLocal = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export const CreateEventForm = ({
  onCancel,
  onSubmitSuccess,
  initialValues,
  initialCoverImageUrl,
  mode = "create",
}: CreateEventFormProps) => {
  const defaultDateTimes = useMemo(() => {
    const now = new Date();
    const base = new Date(now);
    base.setMinutes(0, 0, 0);
    const start = new Date(base);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      startDateTime: formatDateTimeLocal(start),
      endDateTime: formatDateTimeLocal(end),
    };
  }, []);

  // -- state --
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const { options: timeZoneOptions, isLoading } = useTimeZoneOptions();
  const requireCoverImage = !initialCoverImageUrl;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(
      createEventFormSchema({
        requireCoverImage,
      }),
    ),
    defaultValues: {
      title: "",
      startDateTime: defaultDateTimes.startDateTime,
      endDateTime: defaultDateTimes.endDateTime,
      timeZone: "",
      locationType: "in-person",
      types: [],
      address: "",
      venueDetails: "",
      onlineUrl: "",
      visibility: "public",
      description: "",
      coverImage: null,
      ...initialValues,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const titleValue = useWatch({ control, name: "title" }) ?? "";
  const venueValue = useWatch({ control, name: "venueDetails" }) ?? "";
  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const locationType = useWatch({ control, name: "locationType" });
  const coverImage = useWatch({ control, name: "coverImage" });
  const timeZoneValue = useWatch({ control, name: "timeZone" });

  // -- effects --
  useEffect(() => {
    register("coverImage");
  }, [register]);

  const previewUrl = useMemo(() => {
    if (coverImage) {
      return URL.createObjectURL(coverImage);
    }

    return initialCoverImageUrl || null;
  }, [coverImage, initialCoverImageUrl]);

  useEffect(() => {
    if (!coverImage || !previewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [coverImage, previewUrl]);

  useEffect(() => {
    if (!timeZoneOptions.length || timeZoneValue) {
      return;
    }
    const preferredZone =
      timeZoneOptions.find((option) =>
        option.value.includes("Asia/Ho_Chi_Minh"),
      ) ?? timeZoneOptions.find((option) => option.value.includes("Asia/Saigon"));
    if (preferredZone) {
      setValue("timeZone", preferredZone.value, { shouldValidate: true });
      return;
    }
    const current = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matched = timeZoneOptions.find((option) => option.value === current);
    if (matched) {
      setValue("timeZone", matched.value, { shouldValidate: true });
    }
  }, [setValue, timeZoneOptions, timeZoneValue]);

  useEffect(() => {
    if (locationType === "online") {
      setValue("address", "");
      setValue("venueDetails", "");
    } else {
      setValue("onlineUrl", "");
    }
  }, [locationType, setValue]);


  // -- handlers --
  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    setValue("coverImage", file, { shouldValidate: true });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }
    handleFileSelect(Array.from(event.target.files));
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect([file]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setValue("coverImage", null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitForm = useCallback(
    async (values: CreateEventFormValues) => {
      await onSubmitSuccess?.(values);
      onCancel();
    },
    [onCancel, onSubmitSuccess],
  );

  // Scroll to first error field when form validation fails
  const scrollToFirstError = useCallback((errors: Record<string, unknown>) => {
    // Define the order of fields in the form
    const fieldOrder: (keyof CreateEventFormValues)[] = [
      "title",
      "types",
      "startDateTime",
      "endDateTime",
      "timeZone",
      "locationType",
      "onlineUrl",
      "address",
      "venueDetails",
      "visibility",
      "description",
      "coverImage",
    ];

    // Find the first field with an error
    const firstErrorField = fieldOrder.find((field) => errors[field]);
    if (!firstErrorField || !formContainerRef.current) return;

    // Find the element with the error
    const errorElement = formContainerRef.current.querySelector(
      `[name="${firstErrorField}"], [data-field="${firstErrorField}"]`
    ) as HTMLElement;

    if (errorElement) {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the element if it's focusable
      if (typeof errorElement.focus === "function") {
        setTimeout(() => errorElement.focus(), 300);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      return;
    }

    scrollToFirstError(errors as Record<string, unknown>);
  }, [errors, scrollToFirstError]);

  // -- render --
  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex max-h-[75vh] flex-col overflow-hidden"
    >
      <div ref={formContainerRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 pb-8 pt-6">
        <FieldBlock>
          <FieldHeader
            label="Event Title"
            required
            counter={`${titleValue.length}/${TITLE_LIMIT}`}
          />
          <EventInput
            placeholder="Enter event title"
            maxLength={TITLE_LIMIT}
            {...register("title")}
          />
          <FieldErrorMessage error={errors.title} />
        </FieldBlock>

        <FieldBlock>
          <FieldHeader label="Type" required />
            <Controller
              name="types"
              control={control}
              render={({ field }) => (
              <div data-field="types">
                <TypeMultiSelect
                  options={EVENT_TYPE_OPTIONS}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select event type"
                />
              </div>
            )}
          />
          <FieldErrorMessage error={errors.types} />
        </FieldBlock>

        <div className="flex flex-col gap-4">
          <FieldBlock>
            <FieldHeader label="Start Date" required />
            <Controller
              name="startDateTime"
              control={control}
              render={({ field }) => (
                <div data-field="startDateTime">
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                  />
                </div>
              )}
            />
            <FieldErrorMessage error={errors.startDateTime} />
          </FieldBlock>
          <FieldBlock>
            <FieldHeader label="End Date" required />
            <Controller
              name="endDateTime"
              control={control}
              render={({ field }) => (
                <div data-field="endDateTime">
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                  />
                </div>
              )}
            />
            <FieldErrorMessage error={errors.endDateTime} />
          </FieldBlock>
        </div>

        <FieldBlock>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">
              Time Zone<span className="ml-1 text-rose-500">*</span>
            </span>
            <div className="min-w-[240px]" data-field="timeZone">
              <Controller
                name="timeZone"
                control={control}
                render={({ field }) => (
                  <TimeZoneSelect
                    options={timeZoneOptions}
                    value={field.value}
                    onChange={field.onChange}
                    isLoading={isLoading}
                    placeholder="Search..."
                  />
                )}
              />
            </div>
          </div>
          <FieldErrorMessage error={errors.timeZone} />
        </FieldBlock>

        <FieldBlock>
          <FieldHeader label="Location" required />
          <div className="flex flex-wrap gap-6">
            <EventRadioLabel>
                <input
                  type="radio"
                  value="in-person"
                  className="h-4 w-4 accent-blue-600"
                  {...register("locationType")}
                />
              In-person
            </EventRadioLabel>
            <EventRadioLabel>
                <input
                  type="radio"
                  value="online"
                  className="h-4 w-4 accent-blue-600"
                  {...register("locationType")}
                />
              Online
            </EventRadioLabel>
          </div>
          <FieldErrorMessage error={errors.locationType} />
        </FieldBlock>

        {locationType === "online" ? (
          <FieldBlock>
              <EventInput
                placeholder="https://www.example.com"
                {...register("onlineUrl")}
              />
            <FieldErrorMessage error={errors.onlineUrl} />
          </FieldBlock>
        ) : (
          <>
            <FieldBlock>
              <EventInput
                placeholder="Search address"
                {...register("address")}
              />
              <FieldErrorMessage error={errors.address} />
            </FieldBlock>
            <FieldBlock>
              <div className="relative">
                <EventInput
                  placeholder="Venue details (Optional)"
                  maxLength={VENUE_LIMIT}
                  className="pr-14"
                  {...register("venueDetails")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {venueValue.length}/{VENUE_LIMIT}
                </span>
              </div>
              <FieldErrorMessage error={errors.venueDetails} />
            </FieldBlock>
          </>
        )}

        <FieldBlock>
          <FieldHeader label="Visibility" />
          <div className="flex flex-wrap gap-6">
            {VISIBILITY_OPTIONS.map((option) => (
              <EventRadioLabel key={option.value}>
                  <input
                    type="radio"
                    value={option.value}
                    className="h-4 w-4 accent-blue-600"
                    {...register("visibility")}
                  />
                {option.label}
              </EventRadioLabel>
            ))}
          </div>
          <FieldErrorMessage error={errors.visibility} />
        </FieldBlock>

        <FieldBlock>
          <FieldHeader
            label="Description"
            required
            counter={`${descriptionValue.length}/${DESCRIPTION_LIMIT}`}
          />
          <EventTextarea
            rows={5}
            placeholder="Tell people a little more about your event"
            maxLength={DESCRIPTION_LIMIT}
            {...register("description")}
          />
          <FieldErrorMessage error={errors.description} />
        </FieldBlock>

        <FieldBlock>
          <FieldHeader label="Cover Image" required />
          <div
            className={cn(
              "rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center transition",
              isDragging ? "border-blue-500 bg-blue-50" : null,
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex w-full flex-col items-center gap-2">
              {previewUrl ? (
                <div className="flex w-full items-center justify-start gap-4">
                  <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <Image
                      src={previewUrl}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-600 shadow-sm"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-700">
                      Cover image selected
                    </div>
                    <div className="text-xs text-slate-500">
                      PNG, JPG, WebP. Max 2MB.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-semibold text-slate-700">
                    Drag image or upload from device
                  </div>
                  <div className="text-xs text-slate-500">
                    Supported formats: PNG, JPG, WebP. Max: 2MB. A high-resolution image
                    is recommended.
                  </div>
                  <EventButton
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Upload file
                  </EventButton>
                </>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <FieldErrorMessage error={errors.coverImage} />
        </FieldBlock>
      </div>

      <div className="border-t border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <EventButton
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 w-[140px]"
          >
            Close
          </EventButton>
          <EventButton type="submit" className="h-11 w-[140px]">
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
                ? "Update"
                : "Create"}
          </EventButton>
        </div>
      </div>
    </form>
  );
};

type FieldHeaderProps = {
  label: string;
  required?: boolean;
  counter?: string;
};

const FieldHeader = ({ label, required, counter }: FieldHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold uppercase text-slate-500">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {counter ? (
        <span className="text-xs text-slate-400">{counter}</span>
      ) : null}
    </div>
  );
};

const FieldBlock = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-2">{children}</div>;
};

const FieldErrorMessage = ({ error }: { error?: FieldError | { message?: string } }) => {
  if (!error) {
    return null;
  }
  return (
    <p className="text-xs font-medium text-rose-500">
      {String(error.message)}
    </p>
  );
};

const EventInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "h-[44px] w-full rounded-[8px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none",
          className,
        )}
      />
    );
  },
);
EventInput.displayName = "EventInput";

const EventTextarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "min-h-[120px] w-full rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none",
          className,
        )}
      />
    );
  });
EventTextarea.displayName = "EventTextarea";

const EventRadioLabel = ({ children }: { children: ReactNode }) => {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-900">
      {children}
    </label>
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
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className,
      )}
    />
  );
};

type TimeZoneSelectProps = {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
};

const TimeZoneSelect = ({
  options,
  value,
  onChange,
  placeholder,
  isLoading,
}: TimeZoneSelectProps) => {
  // -- state --
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  // -- derived --
  const selectedOption = options.find((option) => option.value === value);
  const selectedIndex = options.findIndex((option) => option.value === value);

  // -- effects --
  useEffect(() => {
    if (isOpen && selectedIndex >= 0) {
      // Wait for the list and items to render
      const timer = setTimeout(() => {
        // Find the selected item
        const selectedItem = document.querySelector('[data-timezone-selected="true"]') as HTMLElement;
        if (!selectedItem) {
          console.log('Selected item not found');
          return;
        }

        // Scroll the item into view, centered
        selectedItem.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedIndex]);

  // -- handlers --
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // -- render --
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          className="flex h-9 w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none"
        >
          <span className={cn(selectedOption ? "text-slate-900" : "text-slate-400")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[230] w-[min(320px,calc(100vw-28px))] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl sm:w-[360px]"
        align="start"
        side="bottom"
        sideOffset={8}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="rounded-xl border-0 bg-white text-slate-900 shadow-none [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-slate-200 [&_[cmdk-input]]:text-slate-900 [&_[cmdk-input]]:placeholder:text-slate-500 [&_[cmdk-input-wrapper]_svg]:text-slate-500">
          <CommandInput
            placeholder={placeholder || "Search..."}
            className="h-10 text-slate-900 placeholder:text-slate-500"
          />
          <CommandList id={listId} className="max-h-[260px] overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-sm text-slate-600">Loading...</div>
            ) : (
              <>
                <CommandEmpty className="py-3 text-center text-sm text-slate-500">No results found.</CommandEmpty>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "cursor-pointer text-slate-900 transition hover:bg-slate-100 active:bg-slate-200",
                        isSelected && "bg-blue-50 text-blue-700"
                      )}
                      data-timezone-selected={isSelected}
                    >
                      {isSelected && <Check className="mr-2 h-4 w-4 text-blue-600" />}
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type TypeMultiSelectProps = {
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

const TypeMultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select event type",
}: TypeMultiSelectProps) => {
  // -- state --
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  // -- derived --
  const selectedOptions = options
    .filter((option) => value.includes(option.value))
    .map((option) => option);
  const MAX_VISIBLE = 3;
  const visibleOptions = selectedOptions.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, selectedOptions.length - MAX_VISIBLE);

  // -- handlers --
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // -- render --
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
                {visibleOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    <span className="max-w-[120px] truncate">{option.label}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleToggle(option.value);
                      }}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/60 text-[10px] hover:bg-white/20"
                      aria-label={`Remove ${option.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {hiddenCount > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    + {hiddenCount} more
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onChange([]);
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
                    onChange([]);
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
        className="z-[230] w-[min(320px,calc(100vw-28px))] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl sm:w-[340px]"
        align="start"
        side="bottom"
        sideOffset={8}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="rounded-xl border-0 bg-white text-slate-900 shadow-none [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-slate-200 [&_[cmdk-input]]:text-slate-900 [&_[cmdk-input]]:placeholder:text-slate-500 [&_[cmdk-input-wrapper]_svg]:text-slate-500">
          <CommandInput
            placeholder="Search..."
            className="h-10 text-slate-900 placeholder:text-slate-500"
          />
          <CommandList id={listId} className="max-h-[240px] overflow-y-auto">
            <CommandEmpty className="py-3 text-center text-sm text-slate-500">No results found.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => handleToggle(option.value)}
                className={cn(
                  "cursor-pointer text-slate-900 transition hover:bg-slate-100 active:bg-slate-200",
                  value.includes(option.value) && "bg-blue-50 text-blue-700",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border border-slate-300",
                    value.includes(option.value)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "bg-white",
                  )}
                >
                  {value.includes(option.value) ? (
                    <Check className="h-3 w-3" />
                  ) : null}
                </span>
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
