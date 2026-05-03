// src/components/select.tsx

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, ChevronDown, XIcon } from 'lucide-react'

import { cn } from '@shared/lib/utils'
import { Separator } from '@shared/components/ui/separator'
import { Button } from '@shared/components/ui/button'
import { Text } from '@shared/components/Text'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@shared/components/ui/command'

/**
 * Variants for the -select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
/**
 * selectVariants - Utility function
 * @returns void
 */
const selectVariants = cva('m-1', {
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
    variant: 'default',
  },
})

/**
 * Props for Select component
 */
interface SelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof selectVariants> {
  /**
   * An array of option objects to be displayed in the select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string
    /** The unique value associated with the option. */
    value: string
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>
  }[]

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
   * Callback function triggered when the selected value change.
   * Receives the new selected value.
   */
  onValueChange: (value?: string, action?: 'add' | 'remove') => void

  /** The default selected value when the component mounts. */
  defaultValue?: string

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
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean

  /**
   * If true, renders the select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean

  /**
   * Additional class names to apply custom styles to the select component.
   * Optional, can be used to add custom styles.
   */
  className?: string

  /**
   * If true, allow to clear the selected value.
   * Optional, defaults to false.
   */
  clearable?: boolean

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
}

export const SingleSelect = React.forwardRef<HTMLButtonElement, SelectProps & { portal?: boolean }>(
  (
    {
      /**
       * SingleSelect - React component
       * @returns React element
       */
      options,
      isLoading,
      isFirstTimeLoading,
      searchValue,
      onSearchValueChange,
      onValueChange,
      variant,
      defaultValue,
      placeholder = 'Select option',
      searchPlaceholder = 'Search...',
      modalPopover = false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      asChild = false,
      className,
      clearable = false,
      manualFilter = false,
      onPopoverOpen,
      onPopoverClose,
      portal = false,
      ...props
    },
    ref,
  ) => {
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>(defaultValue)
    const { icon: IconComponent, label } =
      options.find((option) => option.value === selectedValue) || {}
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      } else if (clearable && event.key === 'Backspace' && !event.currentTarget.value) {
        setSelectedValue(undefined)
        onValueChange(undefined, 'remove')
        /**
         * handleInputKeyDown - Utility function
         * @returns void
         */
      }
    }

    const toggleOption = (newSelectedValue?: string) => {
      const isOptionAlreadySelected = selectedValue === newSelectedValue
      if (clearable) newSelectedValue = isOptionAlreadySelected ? undefined : newSelectedValue
      setSelectedValue(newSelectedValue)
      onValueChange(
        newSelectedValue,
        clearable ? (isOptionAlreadySelected ? 'remove' : 'add') : 'add',
      )
    }
    /**
     * toggleOption - Utility function
     * @returns void
     */

    const handleClear = () => {
      if (!clearable) return
      setSelectedValue(undefined)
      /**
       * isOptionAlreadySelected - Utility function
       * @returns void
       */
      onValueChange(undefined, 'remove')
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    // scroll the selected item into view as soon as it rendered
    const selectedItemCallbackRef = (node: any) => {
      if (!node) return
      setTimeout(() => {
        node.scrollIntoView({ block: 'center' })
        /**
         * handleClear - Utility function
         * @returns void
         */
      }, 0)
    }

    React.useEffect(() => {
      if (isPopoverOpen) onPopoverOpen?.()
      return () => {
        if (isPopoverOpen) onPopoverClose?.()
      }
    }, [isPopoverOpen])
    /**
     * handleTogglePopover - Utility function
     * @returns void
     */
    React.useEffect(() => {
      // reset
      if (['', undefined, null].includes(defaultValue)) {
        setSelectedValue(undefined)
      }
    }, [defaultValue])

    return (
      /**
       * selectedItemCallbackRef - Utility function
       * @returns void
       */
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
            {/* show first time loading state when have selected value */}
            {isFirstTimeLoading && selectedValue && (
              <span className="mx-3 text-sm text-muted-foreground">Loading...</span>
            )}

            {/* placeholder */}
            {!selectedValue && (
              <div className="mx-auto flex w-full items-center justify-between">
                <span className="mx-3 text-xs text-muted-foreground">{placeholder}</span>
                <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
              </div>
            )}

            {/* selected value */}
            {!isFirstTimeLoading && selectedValue && (
              <div className="flex w-full items-center justify-between overflow-hidden">
                <div className="flex flex-1 flex-wrap items-center overflow-hidden">
                  <Text className={cn('', selectVariants({ variant }))}>
                    {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                    {label}
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  {clearable && (
                    <>
                      <XIcon
                        className="mx-2 h-4 cursor-pointer text-muted-foreground"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleClear()
                        }}
                      />
                      <Separator orientation="vertical" className="flex h-full min-h-6" />
                    </>
                  )}
                  <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
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
                    <CommandGroup className="min-w-[300px] max-w-[500px]">
                      {options.map((option) => {
                        const isSelected = selectedValue === option.value
                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => toggleOption(option.value)}
                            className="cursor-pointer"
                            value={option.value.toString()}
                            ref={isSelected ? selectedItemCallbackRef : null}
                          >
                            {isSelected && (
                              <CheckIcon className="h-5 w-5 text-primary" strokeWidth={3} />
                            )}
                            {option.icon && (
                              <option.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                            )}
                            <span className="w-full">{option.label}</span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  ) : (
                    // empty state
                    <div className="py-4 text-center text-sm">No results found.</div>
                  )}
                  /** * isSelected - Utility function * @returns void */
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)

SingleSelect.displayName = 'SingleSelect'
