import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search conversations...',
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div
      className={`relative flex items-center rounded-lg border transition-colors ${
        isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
      }`}
    >
      <Search className="absolute left-3 h-4 w-4 text-slate-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-transparent py-2 pl-9 pr-9 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
