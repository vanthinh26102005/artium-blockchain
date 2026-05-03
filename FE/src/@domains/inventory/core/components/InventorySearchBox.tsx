// react
import type { ChangeEvent } from 'react'

// third-party
import { Search } from 'lucide-react'

// @shared - components
import { Input } from '@shared/components/ui/input'

type InventorySearchBoxProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * InventorySearchBox - React component
 * @returns React element
 */
export const InventorySearchBox = ({
  value,
  onChange,
  placeholder = 'Search artworks',
}: InventorySearchBoxProps) => {
  // -- state --

  // -- derived --

  // -- handlers --
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }
/**
 * handleChange - Utility function
 * @returns void
 */

  // -- render --
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        inputMode="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 rounded-full border-black/10 bg-white pl-9 text-lg! font-medium text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-12"
      />
    </div>
  )
}
