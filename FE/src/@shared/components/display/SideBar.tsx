import type { ComponentType, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useState } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/ui/tooltip'
import { cn } from '@shared/lib/utils'

type SidebarBadge = 'Pro' | 'Growth' | 'Premier'

type SidebarAccent = {
  marker: string
  tile: string
  icon: string
  text: string
  glow: string
}

interface SidebarItemConfig {
  label: string
  href?: string
  icon: ComponentType<{ className?: string }>
  badge?: SidebarBadge
  unreadCount?: number
  eyebrow: string
  description: string
  accent: SidebarAccent
  activePrefix?: string
}

const accents = {
  blue: {
    marker: 'bg-blue-600',
    tile: 'hover:bg-blue-50 focus-visible:bg-blue-50',
    icon: 'group-hover:text-blue-700 group-focus-visible:text-blue-700',
    text: 'text-blue-700',
    glow: 'shadow-blue-100',
  },
  emerald: {
    marker: 'bg-emerald-600',
    tile: 'hover:bg-emerald-50 focus-visible:bg-emerald-50',
    icon: 'group-hover:text-emerald-700 group-focus-visible:text-emerald-700',
    text: 'text-emerald-700',
    glow: 'shadow-emerald-100',
  },
  red: {
    marker: 'bg-red-500',
    tile: 'hover:bg-red-50 focus-visible:bg-red-50',
    icon: 'group-hover:text-red-600 group-focus-visible:text-red-600',
    text: 'text-red-600',
    glow: 'shadow-red-100',
  },
  violet: {
    marker: 'bg-violet-600',
    tile: 'hover:bg-violet-50 focus-visible:bg-violet-50',
    icon: 'group-hover:text-violet-700 group-focus-visible:text-violet-700',
    text: 'text-violet-700',
    glow: 'shadow-violet-100',
  },
  cyan: {
    marker: 'bg-cyan-600',
    tile: 'hover:bg-cyan-50 focus-visible:bg-cyan-50',
    icon: 'group-hover:text-cyan-700 group-focus-visible:text-cyan-700',
    text: 'text-cyan-700',
    glow: 'shadow-cyan-100',
  },
  amber: {
    marker: 'bg-amber-500',
    tile: 'hover:bg-amber-50 focus-visible:bg-amber-50',
    icon: 'group-hover:text-amber-700 group-focus-visible:text-amber-700',
    text: 'text-amber-700',
    glow: 'shadow-amber-100',
  },
  indigo: {
    marker: 'bg-indigo-600',
    tile: 'hover:bg-indigo-50 focus-visible:bg-indigo-50',
    icon: 'group-hover:text-indigo-700 group-focus-visible:text-indigo-700',
    text: 'text-indigo-700',
    glow: 'shadow-indigo-100',
  },
  slate: {
    marker: 'bg-slate-900',
    tile: 'hover:bg-slate-100 focus-visible:bg-slate-100',
    icon: 'group-hover:text-slate-950 group-focus-visible:text-slate-950',
    text: 'text-slate-700',
    glow: 'shadow-slate-200',
  },
  rose: {
    marker: 'bg-rose-500',
    tile: 'hover:bg-rose-50 focus-visible:bg-rose-50',
    icon: 'group-hover:text-rose-600 group-focus-visible:text-rose-600',
    text: 'text-rose-600',
    glow: 'shadow-rose-100',
  },
} satisfies Record<string, SidebarAccent>

const messagesCount = 2

const topItems: SidebarItemConfig[] = [
  {
    label: 'Home',
    href: '/homepage',
    icon: Home,
    eyebrow: 'Workspace hub',
    description: 'Dashboard, recent activity, and studio highlights.',
    accent: accents.blue,
  },
  {
    label: 'Profile',
    href: '/profile/artiumfan',
    icon: User,
    eyebrow: 'Public identity',
    description: 'View and manage your public artist profile.',
    accent: accents.emerald,
    activePrefix: '/profile',
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: MessageCircle,
    unreadCount: messagesCount,
    eyebrow: 'Collector inbox',
    description: 'Read conversations and reply to collectors.',
    accent: accents.red,
  },
]

const mainItems: SidebarItemConfig[] = [
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: Store,
    eyebrow: 'Presentation',
    description: 'Curate and preview your public portfolio.',
    accent: accents.violet,
  },
  {
    label: 'Custom Website',
    href: '/custom-website',
    icon: Globe,
    eyebrow: 'Brand site',
    description: 'Customize your branded website and storefront.',
    accent: accents.cyan,
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
    eyebrow: 'Programming',
    description: 'Plan exhibitions, guest lists, and event details.',
    accent: accents.indigo,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: ImageIcon,
    eyebrow: 'Artwork system',
    description: 'Manage artworks, folders, and availability.',
    accent: accents.amber,
  },
  {
    label: 'Artist Management',
    href: '/artist-management',
    icon: Users,
    badge: 'Pro',
    eyebrow: 'Team tools',
    description: 'Coordinate artists and studio relationships.',
    accent: accents.blue,
  },
  {
    label: 'Contact Management',
    href: '/contact-management',
    icon: Contact,
    badge: 'Pro',
    eyebrow: 'CRM',
    description: 'Organize collectors, leads, and notes.',
    accent: accents.emerald,
  },
  {
    label: 'Marketing Email',
    href: '/marketing-email',
    icon: Mail,
    badge: 'Growth',
    eyebrow: 'Campaigns',
    description: 'Create audience emails and campaign updates.',
    accent: accents.violet,
  },
  {
    label: 'Private Views',
    href: '/private-views',
    icon: LayoutPanelLeft,
    badge: 'Premier',
    eyebrow: 'Collector rooms',
    description: 'Share private selections with invited collectors.',
    accent: accents.slate,
  },
  {
    label: 'Promotions',
    href: '/promotions',
    icon: Gift,
    badge: 'Growth',
    eyebrow: 'Offers',
    description: 'Run offers, promotions, and incentives.',
    accent: accents.rose,
  },
  {
    label: 'Refer & earn',
    href: '/refer-and-earn',
    icon: Share2,
    badge: 'Premier',
    eyebrow: 'Partner growth',
    description: 'Invite partners and track referral rewards.',
    accent: accents.cyan,
  },
]

const bottomItems: SidebarItemConfig[] = [
  {
    label: 'Manage Plan',
    href: '/manage-plan',
    icon: BadgeCheck,
    eyebrow: 'Subscription',
    description: 'Review plan access, billing, and upgrades.',
    accent: accents.slate,
  },
]

const workspaceActionItems: SidebarItemConfig[] = [
  {
    label: 'Orders',
    href: '/orders',
    icon: Package,
    eyebrow: 'Sales ops',
    description: 'Track purchases, fulfillment, and order details.',
    accent: accents.indigo,
  },
  {
    label: 'Invoices',
    href: '/artist/invoices',
    icon: DollarSign,
    eyebrow: 'Payments',
    description: 'Create and track client invoices.',
    accent: accents.slate,
  },
  {
    label: 'Auctions',
    href: '/artist/auctions',
    icon: Gavel,
    eyebrow: 'Auction tools',
    description: 'Review auction details and create seller listings.',
    accent: accents.amber,
    activePrefix: '/artist/auctions',
  },
]

const workspaceItem: SidebarItemConfig = {
  label: 'Artium Studio',
  icon: Store,
  eyebrow: 'Workspace',
  description: 'Compact navigation for studio tools.',
  accent: accents.blue,
}

const planBadgeColors: Record<SidebarBadge, string> = {
  Pro: 'bg-blue-600 text-white',
  Growth: 'bg-purple-600 text-white',
  Premier: 'bg-slate-900 text-white',
}

const planBadgeDotColors: Record<SidebarBadge, string> = {
  Pro: 'bg-blue-600 ring-blue-100',
  Growth: 'bg-purple-600 ring-purple-100',
  Premier: 'bg-slate-900 ring-slate-200',
}

const SidebarFlyout = ({
  label,
  eyebrow,
  description,
  accent,
  badge,
  isActive,
}: SidebarItemConfig & {
  isActive?: boolean
}) => (
  <div className="relative w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-900/10">
    <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-slate-200 bg-white" />
    <div className={cn('h-1.5 w-full', accent.marker)} />
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn('text-xs font-bold tracking-[0.22em] uppercase', accent.text)}>
            {eyebrow}
          </p>
          <p className="mt-2 truncate text-xl font-semibold text-slate-950">{label}</p>
        </div>
        {isActive ? (
          <span className="shrink-0 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-white uppercase">
            Active
          </span>
        ) : badge ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] uppercase',
              planBadgeColors[badge],
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
    </div>
  </div>
)

const SidebarItemTooltip = ({
  children,
  item,
  isActive,
}: {
  children: ReactNode
  item: SidebarItemConfig
  isActive?: boolean
}) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        side="right"
        align="center"
        sideOffset={12}
        className="border-0 bg-transparent p-0 shadow-none motion-reduce:transition-none data-[state=closed]:duration-100 data-[state=delayed-open]:duration-150 data-[state=instant-open]:duration-150 data-[side=right]:slide-in-from-left-2"
      >
        <SidebarFlyout {...item} isActive={isActive} />
      </TooltipContent>
    </TooltipPortal>
  </Tooltip>
)

const SidebarItem = ({
  label,
  href,
  icon: Icon,
  badge,
  unreadCount,
  activePrefix,
  onUpgradeRequired,
  ...item
}: SidebarItemConfig & { onUpgradeRequired: () => void }) => {
  const router = useRouter()
  const activePath = activePrefix ?? href
  const isActive = href
    ? router.asPath === href ||
      router.asPath.startsWith(`${href}/`) ||
      router.pathname === href ||
      router.pathname.startsWith(`${href}/`) ||
      (activePath
        ? router.asPath.startsWith(`${activePath}/`) ||
          router.asPath === activePath ||
          router.pathname.startsWith(`${activePath}/`) ||
          router.pathname === activePath
        : false)
    : false

  const handleClick = (e: ReactMouseEvent) => {
    if (badge) {
      e.preventDefault()
      onUpgradeRequired()
    }
  }

  const config = {
    ...item,
    label,
    href,
    icon: Icon,
    badge,
    unreadCount,
    activePrefix,
  }

  const ariaLabel =
    unreadCount && unreadCount > 0
      ? `${label}, ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`
      : label

  const content = (
    <>
      <span
        className={cn(
          'absolute left-0 h-5 w-1 rounded-r-full opacity-0 transition-all duration-200 group-hover:opacity-60 group-focus-visible:opacity-60',
          item.accent.marker,
          isActive && 'opacity-100',
        )}
      />
      <Icon
        className={cn(
          'relative z-10 h-5 w-5 shrink-0 text-slate-600 transition-all duration-200 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none',
          item.accent.icon,
          isActive ? item.accent.text : '',
        )}
      />
      {unreadCount && unreadCount > 0 ? (
        <span className="absolute top-1.5 right-1.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
          {unreadCount}
        </span>
      ) : null}
      {badge ? (
        <span
          className={cn(
            'absolute top-2 right-2 z-20 h-2.5 w-2.5 rounded-full shadow-sm ring-4',
            planBadgeDotColors[badge],
          )}
        />
      ) : null}
    </>
  )

  const className = cn(
    'group relative flex h-11 w-full items-center justify-center rounded-2xl px-0 transition-all duration-200 hover:translate-x-0.5 focus-visible:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none',
    item.accent.tile,
    isActive ? 'bg-slate-100 shadow-sm' : '',
    badge ? 'cursor-pointer' : '',
  )

  const trigger = href ? (
    <Link href={href} className={className} onClick={handleClick} aria-label={ariaLabel}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} onClick={handleClick} aria-label={ariaLabel}>
      {content}
    </button>
  )

  return (
    <SidebarItemTooltip item={config} isActive={isActive}>
      {trigger}
    </SidebarItemTooltip>
  )
}

export const SideBar = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)

  const handleUpgradeRequired = () => {
    setIsUpgradeModalOpen(true)
  }

  const user = useAuthStore((state) => state.user)
  const profileHandle = user?.username ?? user?.email ?? 'profile'

  return (
    <>
      <TooltipProvider>
        <aside className="fixed top-20 left-0 z-40 hidden h-[calc(100vh-80px)] w-[84px] flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex items-center justify-center border-b border-slate-100 px-3 py-3">
            <SidebarItemTooltip item={workspaceItem}>
              <div
                className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 hover:translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 focus-visible:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                aria-label="Artium Studio workspace"
              >
                <span className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white transition-transform group-hover:scale-105">
                  A
                </span>
              </div>
            </SidebarItemTooltip>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1.5">
              {topItems.map((item) => {
                if (item.label === 'Profile') {
                  return (
                    <SidebarItem
                      key={item.label}
                      {...item}
                      href={`/profile/${encodeURIComponent(profileHandle)}`}
                      onUpgradeRequired={handleUpgradeRequired}
                    />
                  )
                }
                return (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    onUpgradeRequired={handleUpgradeRequired}
                  />
                )
              })}
            </div>

            <div className="my-4 border-t border-slate-200" />

            <div className="space-y-1.5">
              {mainItems.slice(0, 5).map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  onUpgradeRequired={handleUpgradeRequired}
                />
              ))}
              {workspaceActionItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  onUpgradeRequired={handleUpgradeRequired}
                />
              ))}
              {mainItems.slice(5).map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  onUpgradeRequired={handleUpgradeRequired}
                />
              ))}
            </div>

            <div className="my-4 border-t border-slate-200" />

            <div className="space-y-1.5">
              {bottomItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  onUpgradeRequired={handleUpgradeRequired}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 px-3 py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group relative flex h-11 w-full items-center justify-center rounded-2xl px-0 transition-all duration-200 hover:translate-x-0.5 hover:bg-slate-100 focus-visible:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none"
                  aria-label="More"
                >
                  <span className="absolute left-0 h-5 w-1 rounded-r-full bg-slate-900 opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60" />
                  <MoreVertical className="relative z-10 h-5 w-5 text-slate-500 transition-all duration-200 group-hover:scale-105 group-hover:text-slate-950 group-focus-visible:scale-105 group-focus-visible:text-slate-950 motion-reduce:transform-none" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={12}
                className="w-[260px] rounded-2xl border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-900/10"
              >
                <DropdownMenuItem className="gap-3 rounded-xl px-4 py-4 text-lg! font-semibold text-slate-900">
                  <User className="h-6 w-6 text-slate-600" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void logout()
                  }}
                  disabled={isLoggingOut}
                  className="gap-3 rounded-xl px-4 py-4 text-lg! font-semibold text-slate-900"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                  ) : (
                    <LogOut className="h-6 w-6 text-slate-600" />
                  )}
                  {isLoggingOut ? 'Signing out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      </TooltipProvider>

      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
      />
    </>
  )
}
