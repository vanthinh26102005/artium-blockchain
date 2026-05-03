import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChevronDown, type LucideIcon } from 'lucide-react'

interface GroupItem {
  label: string
  href?: string
}

interface PageItemGroupProps {
  label: string
  icon: LucideIcon
  items: GroupItem[]
  badge?: 'Pro' | 'Premier'
}

/**
 * badgeStyles - Utility function
 * @returns void
 */
const badgeStyles: Record<NonNullable<PageItemGroupProps['badge']>, string> = {
  Pro: 'bg-blue-600 text-white',
  Premier: 'bg-amber-400 text-white',
}

export const PageItemGroup = ({ label, icon: Icon, items, badge }: PageItemGroupProps) => {
  const router = useRouter()
  const hasActiveItem = useMemo(
    /**
     * PageItemGroup - React component
     * @returns React element
     */
    () => items.some((item) => (item.href ? router.asPath.startsWith(item.href) : false)),
    [items, router.asPath],
  )
  const [isOpen, setIsOpen] = useState(hasActiveItem)
  /**
   * router - Utility function
   * @returns void
   */

  return (
    <div>
      <button
        /**
         * hasActiveItem - Utility function
         * @returns void
         */
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold text-[#191414] transition hover:bg-slate-100"
      >
        <Icon className="h-5 w-5 text-slate-700" />
        <span>{label}</span>
        {badge ? (
          <span
            className={`ml-auto rounded-full px-2.5 py-1 text-sm font-semibold ${badgeStyles[badge]}`}
          >
            {badge}
          </span>
        ) : null}
        <ChevronDown
          className={`ml-auto h-4 w-4 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen ? (
        <div className="mt-2 space-y-1 pl-10">
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-md px-3 py-1.5 text-sm font-medium text-[#191414] transition hover:bg-slate-100 hover:text-[#191414]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="block rounded-md px-3 py-1.5 text-sm font-medium text-[#191414]"
              >
                {item.label}
              </span>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}
