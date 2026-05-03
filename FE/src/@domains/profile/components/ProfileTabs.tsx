// next
import Link from 'next/link'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileTabKey } from '@domains/profile/types'

type ProfileTabsProps = {
  tabs: Array<{ key: ProfileTabKey; label: string }>
  activeTab: ProfileTabKey
  onTabChange?: (tab: ProfileTabKey) => void
  tabHrefs?: Partial<Record<ProfileTabKey, string>>
}

/**
 * ProfileTabs - React component
 * @returns React element
 */
export const ProfileTabs = ({ tabs, activeTab, onTabChange, tabHrefs }: ProfileTabsProps) => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full items-center justify-center gap-3 overflow-x-auto border border-slate-200 bg-slate-100 px-3 py-4 shadow-sm sm:gap-6 lg:gap-12">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const href = tabHrefs?.[tab.key]
          const tabClassName = cn(
            /**
             * isActive - Utility function
             * @returns void
             */
            'px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold uppercase tracking-tight rounded-full transition-all whitespace-nowrap',
            isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-800 hover:bg-slate-100',
          )

          /**
           * href - Utility function
           * @returns void
           */
          if (href) {
            return (
              <Link
                key={tab.key}
                /**
                 * tabClassName - Utility function
                 * @returns void
                 */
                href={href}
                className={tabClassName}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            )
          }

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange?.(tab.key)}
              className={tabClassName}
              disabled={!onTabChange}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
