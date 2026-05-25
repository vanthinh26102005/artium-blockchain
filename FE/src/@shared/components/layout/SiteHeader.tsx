import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  DollarSign,
  FileText,
  ImagePlus,
  Loader2,
  LogOut,
  Menu,
  Plus,
  User,
  Video,
  Wallet,
} from 'lucide-react'
import {
  ProfileWalletManagerDialog,
  type WalletDialogView,
} from '@domains/profile/components/edit-profile/ProfileWalletManagerDialog'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { useWalletLink } from '@domains/auth/hooks/useWalletLink'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { PostMomentModal } from '@domains/moments/components/modals/PostMomentModal'

const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/editorial', label: 'Editorial' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/auction', label: 'Live Auctions' },
]

const shortenWalletAddress = (address?: string | null) => {
  if (!address) {
    return null
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getUsableAvatarUrl = (avatarUrl?: string | null) => {
  const trimmed = avatarUrl?.trim()
  if (
    !trimmed ||
    trimmed === '/images/logo-dark-mode.png' ||
    trimmed === '/images/default-avatar.png'
  ) {
    return null
  }

  return trimmed
}

type SiteHeaderProps = {
  variant?: 'default' | 'landing'
}

export const SiteHeader = ({ variant = 'default' }: SiteHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)
  const walletLink = useWalletLink()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isPostMomentModalOpen, setIsPostMomentModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [walletDialogView, setWalletDialogView] = useState<WalletDialogView>('manage')

  // Check if current route is a moment detail page
  const isMomentDetailPage = router.pathname === '/profile/[username]/moments/[id]'
  const authRoutes = ['/login', '/sign-up', '/forgot-password', '/reset-password']
  const marketingRoutes = ['/', '/discover', '/editorial', '/pricing', '/auction']
  const isAuthRoute = authRoutes.includes(router.pathname) || router.pathname.startsWith('/auth')
  const isMarketingRoute = marketingRoutes.includes(router.pathname)
  const borderedHeaderRoutes = ['/discover', '/auction']
  const shouldForceHeaderBorder = borderedHeaderRoutes.includes(router.pathname)
  const isEditorialPage = router.pathname === '/editorial'
  const isPricingPage = router.pathname === '/pricing'
  const isTransparentHeaderPage = isEditorialPage || isPricingPage
  const isLandingVariant = variant === 'landing'
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Transparent header pages (Editorial & Pricing) - transparent at top, white when scrolled
  const getTransparentHeaderClasses = () => {
    if (!isTransparentHeaderPage) return ''
    if (isScrolled) {
      return 'bg-white border-b border-slate-200 shadow-sm backdrop-blur-none'
    }
    // Completely transparent at top
    return 'bg-transparent! border-black shadow-none backdrop-blur-none'
  }

  // Marketing header class for non-landing, non-editorial, non-auth routes
  const marketingHeaderClass =
    isScrolled || isMomentDetailPage
      ? 'bg-white border-b border-slate-200 shadow-sm'
      : isMarketingRoute
        ? shouldForceHeaderBorder
          ? 'bg-white border-b border-slate-200 shadow-[0_4px_12px_rgba(15,23,42,0.08)]'
          : 'bg-transparent border-b border-black'
        : 'bg-white/70 border-b border-white/40 shadow-[0_6px_20px_rgba(15,23,42,0.06)]'

  const headerClasses = [
    'sticky top-0 z-50 transition-all duration-300',
    isLandingVariant
      ? isScrolled
        ? 'bg-black border-b border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
        : 'bg-transparent border-b border-black text-white'
      : isAuthRoute
        ? 'bg-transparent shadow-none backdrop-blur-none'
        : 'backdrop-blur-2xl backdrop-saturate-150',
    !isLandingVariant &&
      !isAuthRoute &&
      (isTransparentHeaderPage ? getTransparentHeaderClasses() : marketingHeaderClass),
  ]
    .filter(Boolean)
    .join(' ')

  const walletLabel = shortenWalletAddress(user?.walletAddress)
  const currentWalletAddress = user?.walletAddress ?? null
  const hasRecoverableLogin = Boolean(user?.googleId || user?.email)
  const canRemoveWallet = !currentWalletAddress || hasRecoverableLogin
  const profileHandle = user?.username ?? user?.id ?? user?.email ?? 'profile'
  const profileLabel =
    user?.username ?? user?.displayName ?? user?.fullName ?? walletLabel ?? user?.email ?? 'user'
  const useWhiteNav = isLandingVariant || isAuthRoute || (isTransparentHeaderPage && !isScrolled)
  const avatarFallbackUrl = useWhiteNav
    ? '/images/logo/logo-dark-mode.png'
    : '/images/logo/logo-light-mode.png'
  const avatarUrl = getUsableAvatarUrl(user?.avatarUrl) || avatarFallbackUrl
  const logoSrc = useWhiteNav
    ? '/images/logo/logo-and-text-dark-mode.png'
    : '/images/logo/logo-and-text-light-mode.png'
  const navClasses = [
    'hidden shrink-0 items-center gap-4 text-[12px]! font-semibold tracking-[0.14em] uppercase 2xl:gap-6 2xl:tracking-[0.2em]',
    'min-[1111px]:flex',
  ].join(' ')
  const compactMenuClasses = 'shrink-0 min-[1111px]:hidden'
  const headerIconButtonClasses = useWhiteNav
    ? 'border-white/20 bg-transparent text-white hover:border-white/30 hover:bg-white/10'
    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900'

  const createMenuItems = [
    {
      title: 'Upload inventory',
      description: 'Supports GIF, PNG, JPG, JPEG, HEIC',
      href: '/artworks/upload',
      icon: ImagePlus,
    },
    {
      title: 'Post a Moment',
      description:
        "Videos of your thoughts, comments, or anything you'd like to share. These will appear in your profile and the feed",
      action: () => setIsPostMomentModalOpen(true),
      icon: Video,
    },
    {
      title: 'Create an Invoice',
      description: 'Easily create and send invoices for your artwork sales',
      href: '/artist/invoices/create',
      icon: FileText,
    },
  ]

  const handleOpenWalletManager = () => {
    setWalletDialogView('manage')
    setShowWalletDialog(true)
  }

  const handleWalletDialogOpenChange = (open: boolean) => {
    setShowWalletDialog(open)
    if (!open) {
      setWalletDialogView('manage')
    }
  }

  const handleConnectWallet = async () => {
    const linkedUser = await walletLink.linkWallet()
    if (linkedUser) {
      setWalletDialogView('manage')
    }
  }

  const handleRemoveWallet = async () => {
    if (!canRemoveWallet) {
      return
    }

    const updatedUser = await walletLink.unlinkWallet()
    if (updatedUser) {
      setWalletDialogView('manage')
    }
  }

  return (
    <header
      className={headerClasses}
      style={{
        fontFamily: '"ABC Monument Grotesk", "Segoe UI", Tahoma, sans-serif',
      }}
    >
      <div className="mx-auto flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 sm:py-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4 xl:gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={logoSrc}
              alt="Artium"
              width={140}
              height={36}
              className="h-7 w-auto shrink-0 sm:h-8"
              priority
            />
          </Link>
          <nav className={navClasses}>
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 transition-colors ${
                    useWhiteNav
                      ? isActive
                        ? 'text-white'
                        : 'text-white/70 hover:bg-white/20 hover:text-white'
                      : isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Menu */}
          <div className={compactMenuClasses}>
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm transition ${headerIconButtonClasses}`}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-[min(calc(100vw-2rem),420px)] rounded-[28px]! border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
              >
                {user ? (
                  <>
                    <div className="mb-3 rounded-[24px] border border-slate-200 bg-[#F7F8FA] p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={avatarUrl}
                          alt={profileLabel}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full border border-white object-cover shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            @{profileLabel}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                            {walletLabel ?? user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuItem
                      onSelect={() => {
                        void router.push('/artist/invoices/create')
                        setIsMobileMenuOpen(false)
                      }}
                      className="mb-2 flex cursor-pointer items-center gap-3 rounded-[18px]! bg-blue-600 p-3 text-white transition hover:bg-blue-700 focus:bg-blue-700"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <DollarSign className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">Quick Sell</span>
                        <span className="block text-xs font-medium text-white/75">
                          Create an invoice for a buyer
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <div className="grid gap-2">
                      {createMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem
                            key={item.title}
                            onSelect={() => {
                              if (item.action) {
                                item.action()
                              } else if (item.href) {
                                void router.push(item.href)
                              }
                              setIsMobileMenuOpen(false)
                            }}
                            className="flex cursor-pointer items-start gap-3 rounded-[18px]! border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:bg-slate-50"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-slate-900">
                                {item.title}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-xs leading-5 font-medium text-slate-500">
                                {item.description}
                              </span>
                            </span>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                    <DropdownMenuSeparator className="my-3 bg-slate-200" />
                    <div className="grid grid-cols-2 gap-2">
                      {navLinks.map((link) => (
                        <DropdownMenuItem
                          key={link.href}
                          onSelect={() => {
                            void router.push(link.href)
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex cursor-pointer justify-center rounded-full bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:bg-slate-200"
                        >
                          {link.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="my-3 bg-slate-200" />
                    <DropdownMenuItem
                      onSelect={() => {
                        setIsMobileMenuOpen(false)
                        handleOpenWalletManager()
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-[18px]! p-3"
                    >
                      <Wallet className="h-5 w-5 text-slate-700" />
                      <span className="font-semibold text-slate-900">Wallet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/profile/${encodeURIComponent(profileHandle)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex cursor-pointer items-center gap-3 rounded-[18px]! p-3"
                      >
                        <User className="h-5 w-5 text-slate-700" />
                        <span className="font-semibold text-slate-900">@{profileLabel}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-slate-200" />
                    <DropdownMenuItem
                      disabled={isLoggingOut}
                      onSelect={() => {
                        setIsMobileMenuOpen(false)
                        void logout()
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-[18px]! p-3 text-rose-700 focus:bg-rose-50 focus:text-rose-700 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <LogOut className="h-5 w-5" />
                      )}
                      <span className="font-semibold">
                        {isLoggingOut ? 'Signing out...' : 'Logout'}
                      </span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="mb-3 rounded-[24px] border border-slate-200 bg-[#F7F8FA] p-4">
                      <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Explore Artium
                      </p>
                      <p className="mt-2 text-sm leading-6 font-medium text-slate-600">
                        Discover artists, live auctions, and editorial stories.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {navLinks.map((link) => (
                        <DropdownMenuItem
                          key={link.href}
                          onSelect={() => {
                            void router.push(link.href)
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex cursor-pointer justify-center rounded-full bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:bg-slate-200"
                        >
                          {link.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="my-3 bg-slate-200" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex cursor-pointer items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900"
                      >
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-2 flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Get Started
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Actions */}
          {user ? (
            <>
              <button
                type="button"
                onClick={() => router.push('/artist/invoices/create')}
                className="hidden cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-blue-700 min-[1111px]:inline-flex"
              >
                <DollarSign className="h-4 w-4" />
                Quick Sell
              </button>
              <div className="hidden min-[1111px]:inline-flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Create"
                      className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm transition ${headerIconButtonClasses}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    sideOffset={12}
                    className="w-[320px] max-w-[calc(100vw-2rem)] rounded-3xl! border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:w-[360px]"
                  >
                    <div className="flex flex-col gap-3">
                      {createMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem
                            key={item.title}
                            onSelect={() => {
                              if (item.action) {
                                item.action()
                              } else if (item.href) {
                                router.push(item.href)
                              }
                            }}
                            className="flex w-full cursor-pointer items-start gap-4 rounded-2xl! border border-slate-200/80 bg-white px-4 py-3 text-left text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-md focus:bg-white"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="flex flex-col gap-1">
                              <span className="text-base leading-tight font-semibold text-slate-900">
                                {item.title}
                              </span>
                              <span className="text-sm leading-snug text-slate-500">
                                {item.description}
                              </span>
                            </span>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <button
                type="button"
                aria-label="Wallet"
                onClick={handleOpenWalletManager}
                className={`hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm transition min-[1111px]:inline-flex ${headerIconButtonClasses}`}
              >
                <Wallet className="h-4 w-4" />
              </button>
              <Link
                href={`/profile/${encodeURIComponent(profileHandle)}`}
                className={`hidden min-w-0 cursor-pointer items-center gap-2 text-base font-semibold min-[1111px]:inline-flex ${
                  useWhiteNav ? 'text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span className="max-w-[120px] truncate xl:max-w-[160px]">@{profileLabel}</span>
                <Image
                  src={avatarUrl}
                  alt={profileLabel}
                  width={40}
                  height={40}
                  className={`h-10 w-10 rounded-full object-cover ${
                    useWhiteNav ? 'border border-white/30' : 'border border-slate-200'
                  }`}
                />
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  router.push('/login')
                }}
                className={`hidden min-h-11 cursor-pointer items-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition min-[1111px]:inline-flex ${
                  useWhiteNav
                    ? 'border border-white/20 bg-transparent text-white hover:border-white/30 hover:bg-white/10'
                    : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push('/')
                }}
                className={`hidden min-h-11 cursor-pointer items-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition min-[1111px]:inline-flex ${
                  useWhiteNav
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
      {user ? (
        <ProfileWalletManagerDialog
          open={showWalletDialog}
          onOpenChange={handleWalletDialogOpenChange}
          view={walletDialogView}
          onViewChange={setWalletDialogView}
          currentWalletAddress={currentWalletAddress}
          canRemoveWallet={canRemoveWallet}
          walletError={walletLink.error}
          isLoading={walletLink.isLoading}
          isWrongNetwork={walletLink.isWrongNetwork}
          buttonLabel={
            walletLink.status === 'idle' || walletLink.status === 'error'
              ? currentWalletAddress
                ? 'Change MetaMask Wallet'
                : walletLink.buttonLabel
              : walletLink.buttonLabel
          }
          shortenedAddress={walletLink.shortenedAddress}
          status={walletLink.status}
          targetChainName={walletLink.targetChain.name}
          onConnectWallet={handleConnectWallet}
          onSwitchNetwork={walletLink.switchToTargetChain}
          onRemoveWallet={handleRemoveWallet}
        />
      ) : null}
      <PostMomentModal open={isPostMomentModalOpen} onOpenChange={setIsPostMomentModalOpen} />
    </header>
  )
}
