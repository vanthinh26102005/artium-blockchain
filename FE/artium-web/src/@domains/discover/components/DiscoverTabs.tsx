// @domains - discover
import { DISCOVER_TABS, type DiscoverTabKey } from '@domains/discover/constants/discoverTabs'

type DiscoverTabsProps = {
  activeTabKey: DiscoverTabKey
  onTabChange: (tabKey: DiscoverTabKey) => void
}

const baseTabClasses =
  'inline-flex h-[43px] shrink-0 items-center justify-center rounded-full border px-3 text-sm font-medium uppercase leading-[21px] tracking-[0.3px] transition-colors'
const activeTabClasses = 'border-black bg-black text-white'
const inactiveTabClasses =
  'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'

export const DiscoverTabs = ({ activeTabKey, onTabChange }: DiscoverTabsProps) => {
  // -- state --

  // -- derived --

  // -- handlers --
  const handleTabClick = (tabKey: DiscoverTabKey) => {
    onTabChange(tabKey)
  }

  // -- render --
  return (
    <div className="w-full overflow-x-auto">
      {/* tab list */}
      <div className="flex w-max flex-nowrap items-center gap-2" role="tablist">
        {DISCOVER_TABS.map((tab) => {
          const isActive = tab.key === activeTabKey

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${baseTabClasses} ${isActive ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
