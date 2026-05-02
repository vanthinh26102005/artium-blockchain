// src/components/multi-select.tsx

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, XCircle, ChevronDown, XIcon, PlusIcon } from 'lucide-react'

import { cn } from '@shared/lib/utils'
import { Separator } from '@shared/components/ui/separator'
import { Button } from '@shared/components/ui/button'
import { Badge } from '@shared/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandLoading,
} from '@shared/components/ui/command'

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
  {
    variants: {
      variant: {
        default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-black bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'inverted',
    },
  },
)

type Option = {
  /** The text to display for the option. */
  label: any
  /** The unique value associated with the option. */
  value: string
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: Option[]

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Is first time loading state
   */
  isFirstTimeLoading?: boolean

  /**
   * Optional controlled state for the value of the search input.
   */
  searchValue?: string

  /**
   * Event handler called when the search value changes.
   */
  onSearchValueChange?: (search: string) => void

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[], action: 'add' | 'remove') => void

  /** The default selected values when the component mounts. */
  defaultValue?: string[]

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string

  /**
   * Placeholder text to be displayed in search bar.
   * Optional, defaults to "Search...".
   */
  searchPlaceholder?: string

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string

  /**
   * Additional class names to apply custom styles to the place-holder.
   * Optional, can be used to add custom styles.
   */
  placeholderClassName?: string

  /**
   * Optional. Callback function triggered when the "Add New Item" button is clicked.
   * This function should handle displaying the dialog or performing the necessary action to add a new item.
   */
  onAddNewItem?: () => void

  /**
   * Optional. Label text for the "Add New Item" button.
   * Defaults to a standard label if not provided.
   */
  addNewItemLabel?: string

  /**
   * Optional, message to display when there are no results.
   * Defaults to "No results found."
   */
  emptyMessage?: string

  /**
   * If true, filtering will be handled manually.
   * Optional, defaults to false.
   */
  manualFilter?: boolean

  /**
   * Callback function triggered when the popover open.
   */
  onPopoverOpen?: () => void
  onPopoverClose?: () => void

  customRenderSelectedOption?: (option: Option) => any
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps & { portal?: boolean }
>(
  (
    {
      options,
      isLoading,
      isFirstTimeLoading,
      searchValue,
      onSearchValueChange,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      searchPlaceholder = 'Search...',
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      asChild = false,
      className,
      manualFilter = false,
      placeholderClassName,
      emptyMessage = 'No results found.',
      onAddNewItem,
      addNewItemLabel,
      onPopoverOpen,
      onPopoverClose,
      customRenderSelectedOption,
      portal = false,
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue ?? [])
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isAnimating] = React.useState(false)

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues, 'remove')
      }
    }

    const toggleOption = (option: string) => {
      const isOptionAlreadySelected = selectedValues.includes(option)
      const newSelectedValues = isOptionAlreadySelected
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues, isOptionAlreadySelected ? 'remove' : 'add')
    }

    const handleClear = () => {
      setSelectedValues([])
      onValueChange([], 'remove')
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount)
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues, 'remove')
    }

    // const toggleAll = () => {
    //   if (selectedValues.length === options.length) {
    //     handleClear()
    //   } else {
    //     const allValues = options.map((option) => option.value)
    //     setSelectedValues(allValues)
    //     onValueChange(allValues)
    //   }
    // }

    React.useEffect(() => {
      if (isPopoverOpen) onPopoverOpen?.()
      return () => {
        if (isPopoverOpen) onPopoverClose?.()
      }
    }, [isPopoverOpen])

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              'flex h-auto min-h-10 w-full items-center justify-between rounded-[8px] border bg-inherit p-1 hover:bg-inherit [&_svg]:pointer-events-auto',
              className,
            )}
          >
            {/* show first time loading state when have selected some values */}
            {isFirstTimeLoading && selectedValues.length > 0 && (
              <span className="text-muted-foreground mx-3 text-sm">Loading...</span>
            )}

            {/* placeholder */}
            {selectedValues.length === 0 && (
              <div className="mx-auto flex w-full items-center justify-between">
                <span
                  className={cn(
                    'text-muted-foreground mx-3 text-xs text-wrap break-words',
                    placeholderClassName,
                  )}
                >
                  {placeholder}
                </span>
                <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
              </div>
            )}

            {/* show selected values after first load */}
            {!isFirstTimeLoading && selectedValues.length > 0 && (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value)
                    if (!option) return null
                    const IconComponent = option?.icon
                    return (
                      <Badge
                        key={value}
                        className={cn(
                          isAnimating ? 'animate-bounce' : '',
                          multiSelectVariants({ variant }),
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                        {customRenderSelectedOption
                          ? customRenderSelectedOption(option)
                          : option.label}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleOption(value)
                          }}
                        />
                      </Badge>
                    )
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        'border-foreground/1 text-foreground bg-transparent hover:bg-transparent',
                        isAnimating ? 'animate-bounce' : '',
                        multiSelectVariants({ variant }),
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="text-muted-foreground mx-2 h-4 cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClear()
                    }}
                  />
                  <Separator orientation="vertical" className="flex h-full min-h-6" />
                  <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                </div>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          style={{ zIndex: 1000 }}
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
          portal={portal}
        >
          <Command
            shouldFilter={!manualFilter} // disable/enable automatic filtering when manual filtering or not
          >
            <CommandInput
              className="border-none text-xs text-[#767676] !ring-transparent"
              placeholder={searchPlaceholder}
              onKeyDown={handleInputKeyDown}
              value={searchValue}
              onValueChange={onSearchValueChange}
            />
            <CommandList>
              {/* loading state */}
              {isLoading && <CommandLoading>Loading...</CommandLoading>}
              {!isLoading && (
                <>
                  {options.length > 0 ? (
                    // list options
                    <CommandGroup className="max-w-[500px] min-w-[300px]">
                      {options.map((option) => {
                        const isSelected = selectedValues.includes(option.value)
                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => toggleOption(option.value)}
                            className="cursor-pointer"
                            value={option.value.toString()}
                          >
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-[#808080]',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible',
                              )}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </div>
                            {option.icon && (
                              <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                            )}
                            <span>{option.label}</span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  ) : (
                    // empty state
                    <div className="py-4 text-center text-sm">{emptyMessage}</div>
                  )}

                  {selectedValues.length > 0 && (
                    <>
                      {/* separator */}
                      <CommandSeparator />

                      {/* actions */}
                      <CommandGroup>
                        <CommandItem
                          onSelect={handleClear}
                          className="flex-1 cursor-pointer justify-center"
                        >
                          Clear
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
            {/* add new item action */}
            {onAddNewItem && (
              <Button
                className="w-full !rounded-none"
                variant="ghost"
                onClick={() => {
                  setIsPopoverOpen(false)
                  onAddNewItem()
                }}
              >
                <PlusIcon className="size-[18px]" /> {addNewItemLabel}
              </Button>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)

MultiSelect.displayName = 'MultiSelect'

export type { Option }
