import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  BadgeCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Contact,
  DollarSign,
  Gift,
  Globe,
  Gavel,
  Home,
  Image as ImageIcon,
  LayoutPanelLeft,
  Loader2,
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
import { cn } from '@shared/lib/utils'

interface SidebarItemConfig {
  label: string
  href?: string
  icon: ComponentType<{ className?: string }>
  badge?: 'Pro' | 'Growth' | 'Premier'
}

const topItems: SidebarItemConfig[] = [
  { label: 'Home', href: '/homepage', icon: Home },
  { label: 'Profile', href: '/profile/artiumfan', icon: User },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
]

const mainItems: SidebarItemConfig[] = [
  { label: 'Portfolio', href: '/portfolio', icon: Store },
  { label: 'Custom Website', href: '/custom-website', icon: Globe },
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

const SidebarItem = ({
  label,
  href,
  icon: Icon,
  badge,
  onUpgradeRequired,
  isExpanded,
}: SidebarItemConfig & { onUpgradeRequired: () => void; isExpanded: boolean }) => {
  const router = useRouter()
  const isActive = href
    ? router.asPath === href ||
      router.asPath.startsWith(`${href}/`) ||
      router.pathname === href ||
      router.pathname.startsWith(`${href}/`)
    : false

  const badgeColors = {
    Pro: 'bg-blue-600 text-white',
    Growth: 'bg-purple-600 text-white',
    Premier: 'bg-slate-900 text-white',
  }

  const handleClick = (e: React.MouseEvent) => {
    if (badge) {
      e.preventDefault()
      onUpgradeRequired()
    }
  }

  const content = (
    <>
      <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-slate-950' : 'text-slate-600')} />
      {isExpanded ? (
        <span
          className={`truncate text-[15px] font-semibold text-[#191414] ${badge ? 'opacity-50' : ''}`}
        >
          {label}
        </span>
      ) : null}
      {label === 'Messages' && messagesCount > 0 ? (
        <span
          className={cn(
            'flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white',
            isExpanded ? 'ml-auto' : 'absolute -top-1 right-1',
          )}
        >
          {messagesCount}
        </span>
      ) : null}
      {badge && isExpanded ? (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
            badgeColors[badge]
          }`}
        >
          {badge}
        </span>
      ) : null}
      {badge && !isExpanded ? (
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-slate-900" />
      ) : null}
    </>
  )

  const className = cn(
    'relative flex w-full items-center rounded-xl py-2.5 transition hover:bg-slate-100',
    isExpanded ? 'gap-3 px-3' : 'justify-center px-0',
    isActive ? 'bg-slate-100' : '',
    badge ? 'cursor-pointer hover:bg-slate-50' : '',
  )

  if (href) {
    return (
      <Link href={href} className={className} onClick={handleClick} title={label}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={handleClick} title={label}>
      {content}
    </button>
  )
}

type SideBarProps = {
  isExpanded: boolean
  onToggle: () => void
}

export const SideBar = ({ isExpanded, onToggle }: SideBarProps) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const logout = useAuthStore((state) => state.logout)
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)

  useEffect(() => {
    if (!isMoreOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
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
      <aside
        className={cn(
          'fixed top-20 left-0 z-40 hidden h-[calc(100vh-80px)] flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-out lg:flex',
          isExpanded ? 'w-[300px]' : 'w-[84px]',
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-slate-100 py-3',
            isExpanded ? 'justify-between px-4' : 'justify-center px-3',
          )}
        >
          {isExpanded ? (
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                Workspace
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">Artium Studio</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {topItems.map((item) => {
              if (item.label === 'Profile') {
                return (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    href={`/profile/${encodeURIComponent(profileHandle)}`}
                    onUpgradeRequired={handleUpgradeRequired}
                    isExpanded={isExpanded}
                  />
                )
              }
              return (
                <SidebarItem
                  key={item.label}
                  {...item}
                  onUpgradeRequired={handleUpgradeRequired}
                  isExpanded={isExpanded}
                />
              )
            })}
          </div>

          <div className="my-4 border-t border-slate-200" />

          <div className="space-y-1">
            {mainItems.slice(0, 5).map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                onUpgradeRequired={handleUpgradeRequired}
                isExpanded={isExpanded}
              />
            ))}
            <SidebarItem
              label="Orders"
              href="/orders"
              icon={Package}
              onUpgradeRequired={handleUpgradeRequired}
              isExpanded={isExpanded}
            />
            <SidebarItem
              label="Invoices"
              href="/artist/invoices"
              icon={DollarSign}
              onUpgradeRequired={handleUpgradeRequired}
              isExpanded={isExpanded}
            />
            <SidebarItem
              label="Auctions"
              href="/artist/auctions/create"
              icon={Gavel}
              onUpgradeRequired={handleUpgradeRequired}
              isExpanded={isExpanded}
            />
            {mainItems.slice(5).map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                onUpgradeRequired={handleUpgradeRequired}
                isExpanded={isExpanded}
              />
            ))}
          </div>

          <div className="my-4 border-t border-slate-200" />

          <div className="space-y-1">
            {bottomItems.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                onUpgradeRequired={handleUpgradeRequired}
                isExpanded={isExpanded}
              />
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
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold text-[#191414] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                ) : (
                  <LogOut className="h-5 w-5 text-slate-700" />
                )}
                {isLoggingOut ? 'Signing out...' : 'Logout'}
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            className={cn(
              'flex w-full items-center rounded-xl py-2.5 text-base font-semibold text-[#191414] transition hover:bg-slate-100',
              isExpanded ? 'gap-3 px-3' : 'justify-center px-0',
            )}
            title="More"
          >
            <MoreVertical className="h-5 w-5 text-slate-500" />
            {isExpanded ? 'More' : null}
          </button>
        </div>
      </aside>

      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
      />
    </>
  )
}
