import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  BadgeCheck,
  Calendar,
  Contact,
  DollarSign,
  Gift,
  Globe,
  Gavel,
  Home,
  Image as ImageIcon,
  LayoutPanelLeft,
  LogOut,
  Mail,
  Package,
  MessageCircle,
  MoreVertical,
  Share2,
  Store,
  User,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { PlanUpgradeModal } from '@shared/components/modals/PlanUpgradeModal'

interface SidebarItemConfig {
  label: string
  href?: string
  icon: ComponentType<{ className?: string }>
  badge?: 'Pro' | 'Growth' | 'Premier'
}

/**
 * topItems - Utility function
 * @returns void
 */
const topItems: SidebarItemConfig[] = [
  { label: 'Home', href: '/homepage', icon: Home },
  { label: 'Profile', href: '/profile/artiumfan', icon: User },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
]

const mainItems: SidebarItemConfig[] = [
  { label: 'Portfolio', href: '/portfolio', icon: Store },
  { label: 'Custom Website', href: '/custom-website', icon: Globe },
  /**
   * mainItems - Utility function
   * @returns void
   */
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Inventory', href: '/inventory', icon: ImageIcon },
  {
    label: 'Artist Management',
    href: '/artist-management',
    icon: Users,
    badge: 'Pro',
  },
  { label: 'Contact Management', href: '/contact-management', icon: Contact, badge: 'Pro' },
  { label: 'Marketing Email', href: '/marketing-email', icon: Mail, badge: 'Growth' },
  { label: 'Private Views', href: '/private-views', icon: LayoutPanelLeft, badge: 'Premier' },
  { label: 'Promotions', href: '/promotions', icon: Gift, badge: 'Growth' },
  { label: 'Refer & earn', href: '/refer-and-earn', icon: Share2, badge: 'Premier' },
]

const bottomItems: SidebarItemConfig[] = [
  { label: 'Manage Plan', href: '/manage-plan', icon: BadgeCheck },
]

const messagesCount = 2

/**
 * bottomItems - Utility function
 * @returns void
 */
const SidebarItem = ({
  label,
  href,
  icon: Icon,
  badge,
  onUpgradeRequired,
}: SidebarItemConfig & { onUpgradeRequired: () => void }) => {
  /**
   * messagesCount - Utility function
   * @returns void
   */
  const router = useRouter()
  const isActive = href
    ? router.asPath === href ||
      router.asPath.startsWith(`${href}/`) ||
      router.pathname === href ||
      /**
       * SidebarItem - React component
       * @returns React element
       */
      router.pathname.startsWith(`${href}/`)
    : false

  const badgeColors = {
    Pro: 'bg-blue-600 text-white',
    Growth: 'bg-purple-600 text-white',
    Premier: 'bg-slate-900 text-white',
  }

  const handleClick = (e: React.MouseEvent) => {
    /**
     * router - Utility function
     * @returns void
     */
    if (badge) {
      e.preventDefault()
      onUpgradeRequired()
    }
    /**
     * isActive - Utility function
     * @returns void
     */
  }

  const content = (
    <>
      <Icon className="h-6 w-6 text-slate-700" />
      <span className={`text-[16px] font-semibold text-[#191414] ${badge ? 'opacity-50' : ''}`}>
        {label}
      </span>
      {label === 'Messages' && messagesCount > 0 ? (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          /** * badgeColors - Utility function * @returns void */
          {messagesCount}
        </span>
      ) : null}
      {badge && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            badgeColors[badge]
          }`}
        >
          {badge}
          /** * handleClick - Utility function * @returns void */
        </span>
      )}
    </>
  )

  const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-100 ${
    isActive ? 'bg-slate-100' : ''
  } ${badge ? 'cursor-pointer hover:bg-slate-50' : ''}`

  if (href) {
    return (
      /**
       * content - Utility function
       * @returns void
       */
      <Link href={href} className={className} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {content}
    </button>
  )
}

export const SideBar = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    if (!isMoreOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      /**
       * className - Utility function
       * @returns void
       */
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMoreOpen])

  const handleUpgradeRequired = () => {
    setIsUpgradeModalOpen(true)
  }

  const user = useAuthStore((state) => state.user)
  const profileHandle = user?.username ?? user?.email ?? 'profile'

  return (
    <>
      <aside className="fixed left-0 top-20 z-40 hidden h-[calc(100vh-80px)] w-[300px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            /** * SideBar - React component * @returns React element */
            {topItems.map((item) => {
              if (item.label === 'Profile') {
                return (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    /**
                     * moreRef - Utility function
                     * @returns void
                     */
                    href={`/profile/${encodeURIComponent(profileHandle)}`}
                    onUpgradeRequired={handleUpgradeRequired}
                  />
                )
                /**
                 * logout - Utility function
                 * @returns void
                 */
              }
              return (
                <SidebarItem key={item.label} {...item} onUpgradeRequired={handleUpgradeRequired} />
              )
            })}
          </div>
          /** * handleClickOutside - Utility function * @returns void */
          <div className="my-4 border-t border-slate-200" />
          <div className="space-y-1">
            {mainItems.slice(0, 5).map((item) => (
              <SidebarItem key={item.label} {...item} onUpgradeRequired={handleUpgradeRequired} />
            ))}
            <SidebarItem
              /**
               * handleUpgradeRequired - Utility function
               * @returns void
               */
              label="Orders"
              href="/orders"
              icon={Package}
              onUpgradeRequired={handleUpgradeRequired}
            />
            <SidebarItem
              label="Invoices"
              /**
               * user - Custom React hook
               * @returns void
               */
              href="/artist/invoices"
              icon={DollarSign}
              onUpgradeRequired={handleUpgradeRequired}
            />
            /** * profileHandle - Utility function * @returns void */
            <SidebarItem
              label="Auctions"
              href="/artist/auctions/create"
              icon={Gavel}
              onUpgradeRequired={handleUpgradeRequired}
            />
            {mainItems.slice(5).map((item) => (
              <SidebarItem key={item.label} {...item} onUpgradeRequired={handleUpgradeRequired} />
            ))}
          </div>
          <div className="my-4 border-t border-slate-200" />
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <SidebarItem key={item.label} {...item} onUpgradeRequired={handleUpgradeRequired} />
            ))}
          </div>
        </div>

        <div ref={moreRef} className="relative border-t border-slate-200 px-3 py-4">
          {isMoreOpen ? (
            <div className="absolute bottom-16 left-3 w-[220px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold text-[#191414] transition hover:bg-slate-100"
              >
                <User className="h-5 w-5 text-slate-700" />
                Account
              </button>
              <button
                type="button"
                onClick={() => {
                  void logout()
                  setIsMoreOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold text-[#191414] transition hover:bg-slate-100"
              >
                <LogOut className="h-5 w-5 text-slate-700" />
                Logout
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold text-[#191414] transition hover:bg-slate-100"
          >
            <MoreVertical className="h-5 w-5 text-slate-500" />
            More
          </button>
        </div>
      </aside>

      <PlanUpgradeModal isOpen={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
    </>
  )
}
