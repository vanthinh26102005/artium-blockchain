import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Bell,
  DollarSign,
  FileText,
  ImagePlus,
  Menu,
  Plus,
  Search,
  User,
  Video,
} from 'lucide-react'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { profileApis, type SellerProfilePayload } from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import { PostMomentModal } from '@domains/moments/components/modals/PostMomentModal'

/**
 * navLinks - Utility function
 * @returns void
 */
const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/editorial', label: 'Editorial' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/auction', label: 'Live Auctions' },
]

const shortenWalletAddress = (address?: string | null) => {
  if (!address) {
    return null
/**
 * shortenWalletAddress - Utility function
 * @returns void
 */
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const isWalletLocalEmail = (email?: string | null) => Boolean(email?.endsWith('@wallet.local'))

const getUsableAvatarUrl = (avatarUrl?: string | null) => {
  const trimmed = avatarUrl?.trim()
  if (
    !trimmed ||
/**
 * isWalletLocalEmail - Utility function
 * @returns void
 */
    trimmed === '/images/logo-dark-mode.png' ||
    trimmed === '/images/default-avatar.png'
  ) {
    return null
  }
/**
 * getUsableAvatarUrl - Utility function
 * @returns void
 */

  return trimmed
}

/**
 * trimmed - Utility function
 * @returns void
 */
type SiteHeaderProps = {
  variant?: 'default' | 'landing'
}

export const SiteHeader = ({ variant = 'default' }: SiteHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SellerProfilePayload[]>([])
  const [resolvedSlugs, setResolvedSlugs] = useState<Record<string, string>>({})
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isPostMomentModalOpen, setIsPostMomentModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)
/**
 * SiteHeader - React component
 * @returns React element
 */
  const sidebarPrefixes = [
    '/homepage',
    '/messages',
    '/portfolio',
/**
 * router - Utility function
 * @returns void
 */
    '/custom-website',
    '/events',
    '/inventory',
    '/artist-management',
/**
 * user - Custom React hook
 * @returns void
 */
    '/contact-management',
    '/marketing-email',
    '/private-views',
    '/promotions',
    '/refer-and-earn',
    '/manage-plan',
    '/sales/records',
    '/sales/transactions',
    '/profile',
  ]

  // Check if current route is a moment detail page
  const isMomentDetailPage = router.pathname === '/profile/[username]/moments/[id]'
/**
 * desktopInputRef - Utility function
 * @returns void
 */
  const authRoutes = ['/login', '/sign-up', '/forgot-password', '/reset-password']
  const marketingRoutes = ['/', '/discover', '/editorial', '/pricing', '/auction']
  const isAuthRoute = authRoutes.includes(router.pathname) || router.pathname.startsWith('/auth')
  const isMarketingRoute = marketingRoutes.includes(router.pathname)
/**
 * mobileInputRef - Utility function
 * @returns void
 */
  const borderedHeaderRoutes = ['/discover', '/auction']
  const shouldForceHeaderBorder = borderedHeaderRoutes.includes(router.pathname)
  const isEditorialPage = router.pathname === '/editorial'
  const isPricingPage = router.pathname === '/pricing'
/**
 * searchResultsRef - Utility function
 * @returns void
 */
  const isTransparentHeaderPage = isEditorialPage || isPricingPage
  const shouldShowSearch = sidebarPrefixes.some(
    (prefix) => router.asPath === prefix || router.asPath.startsWith(`${prefix}/`),
  )
/**
 * sidebarPrefixes - Utility function
 * @returns void
 */
  const isSearchVisible = shouldShowSearch && isSearchOpen
  const isLandingVariant = variant === 'landing'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isSearchOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setShowResults(false)
      }
/**
 * isMomentDetailPage - Utility function
 * @returns void
 */
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
/**
 * authRoutes - Utility function
 * @returns void
 */
  }, [isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen) {
/**
 * marketingRoutes - Utility function
 * @returns void
 */
      setSearchQuery('')
      setSearchResults([])
      setShowResults(false)
      return
/**
 * isAuthRoute - Utility function
 * @returns void
 */
    }

    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    const targetInput = isMobile ? mobileInputRef.current : desktopInputRef.current
/**
 * isMarketingRoute - Utility function
 * @returns void
 */
    targetInput?.focus()
  }, [isSearchOpen])

  // Debounced search effect
/**
 * borderedHeaderRoutes - Utility function
 * @returns void
 */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
/**
 * shouldForceHeaderBorder - Utility function
 * @returns void
 */
      return
    }

    const timeoutId = setTimeout(async () => {
/**
 * isEditorialPage - Utility function
 * @returns void
 */
      try {
        setIsSearching(true)
        const response = await profileApis.searchSellerProfiles(searchQuery.trim(), { take: 5 })
        const items = response?.items || []
/**
 * isPricingPage - Utility function
 * @returns void
 */
        setSearchResults(items)
        setShowResults(true)

        // Resolve user slugs in parallel for proper URL navigation
/**
 * isTransparentHeaderPage - Utility function
 * @returns void
 */
        const slugMap: Record<string, string> = {}
        await Promise.all(
          items.map(async (item) => {
            try {
/**
 * shouldShowSearch - Utility function
 * @returns void
 */
              const u = await usersApi.getUserById(item.userId)
              slugMap[item.userId] = u.slug || u.username || item.userId
            } catch {
              slugMap[item.userId] = item.userId
            }
          }),
/**
 * isSearchVisible - Utility function
 * @returns void
 */
        )
        setResolvedSlugs(slugMap)
      } catch {
        setSearchResults([])
/**
 * isLandingVariant - Utility function
 * @returns void
 */
        setShowResults(false)
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

/**
 * handleScroll - Utility function
 * @returns void
 */
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Click outside to close results
  useEffect(() => {
    if (!showResults) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !desktopInputRef.current?.contains(event.target as Node) &&
        !mobileInputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }
/**
 * handleKeyDown - Utility function
 * @returns void
 */

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showResults])

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
/**
 * isMobile - Utility function
 * @returns void
 */
          : 'bg-transparent border-b border-black'
        : 'bg-white/70 border-b border-white/40 shadow-[0_6px_20px_rgba(15,23,42,0.06)]'

  const headerClasses = [
/**
 * targetInput - Utility function
 * @returns void
 */
    'sticky top-0 z-50 transition-all duration-300',
    isLandingVariant
      ? isScrolled
        ? 'bg-black border-b border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
        : 'bg-transparent border-b border-black text-white'
      : isAuthRoute
        ? 'bg-transparent border-b border-black shadow-none backdrop-blur-none'
        : 'backdrop-blur-2xl backdrop-saturate-150',
    !isLandingVariant &&
      !isAuthRoute &&
      (isTransparentHeaderPage ? getTransparentHeaderClasses() : marketingHeaderClass),
  ]
    .filter(Boolean)
    .join(' ')

/**
 * timeoutId - Utility function
 * @returns void
 */
  const desktopSearchClasses = [
    'hidden min-w-0 items-center transition-all duration-300 lg:flex',
    isSearchVisible
      ? 'ml-2 w-[320px] opacity-100 xl:w-[360px]'
      : 'ml-0 w-0 opacity-0 pointer-events-none',
    showResults ? 'overflow-visible' : 'overflow-hidden',
/**
 * response - Utility function
 * @returns void
 */
  ].join(' ')

  const mobileSearchClasses = [
    'transition-all duration-300 lg:hidden',
/**
 * items - Utility function
 * @returns void
 */
    isSearchVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
    showResults ? 'overflow-visible' : 'overflow-hidden',
  ].join(' ')
  const walletLabel = shortenWalletAddress(user?.walletAddress)
  const profileHandle = user?.username ?? user?.id ?? user?.email ?? 'profile'
  const profileLabel =
    user?.username ??
    user?.displayName ??
/**
 * slugMap - Utility function
 * @returns void
 */
    user?.fullName ??
    walletLabel ??
    (isWalletLocalEmail(user?.email) ? null : user?.email) ??
    'user'
  const useWhiteNav = isLandingVariant || isAuthRoute || (isTransparentHeaderPage && !isScrolled)
  const avatarFallbackUrl = useWhiteNav
    ? '/images/logo/logo-dark-mode.png'
/**
 * u - Utility function
 * @returns void
 */
    : '/images/logo/logo-light-mode.png'
  const avatarUrl = getUsableAvatarUrl(user?.avatarUrl) || avatarFallbackUrl
  const logoSrc = useWhiteNav
    ? '/images/logo/logo-and-text-dark-mode.png'
    : '/images/logo/logo-and-text-light-mode.png'
  const navClasses = [
    'hidden shrink-0 items-center gap-4 text-[12px]! font-semibold tracking-[0.14em] uppercase 2xl:gap-6 2xl:tracking-[0.2em]',
    shouldShowSearch ? '2xl:flex' : 'xl:flex',
  ].join(' ')
  const compactMenuClasses = ['shrink-0', shouldShowSearch ? '2xl:hidden' : 'xl:hidden'].join(' ')
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
/**
 * handleClickOutside - Utility function
 * @returns void
 */
      icon: Video,
    },
    {
      title: 'Create an Invoice',
      description: 'Easily create and send invoices for your artwork sales',
      href: '/artist/invoices/create',
      icon: FileText,
    },
  ]

  return (
    <header
      className={headerClasses}
      style={{
        fontFamily: '"ABC Monument Grotesk", "Segoe UI", Tahoma, sans-serif',
      }}
    >
      <div className="mx-auto flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 sm:py-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4 xl:gap-6">
/**
 * getTransparentHeaderClasses - Utility function
 * @returns void
 */
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
/**
 * for - Utility function
 * @returns void
 */
              const isActive = router.pathname === link.href
              return (
                <Link
                  key={link.href}
/**
 * marketingHeaderClass - Utility function
 * @returns void
 */
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
/**
 * headerClasses - Utility function
 * @returns void
 */
                </Link>
              )
            })}
          </nav>
          {shouldShowSearch ? (
            <>
              {!isSearchVisible ? (
                <button
                  type="button"
                  aria-label="Toggle search"
                  aria-expanded={isSearchVisible}
                  onClick={() => setIsSearchOpen(true)}
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition ${headerIconButtonClasses}`}
                >
                  <Search className="h-4 w-4" />
                </button>
              ) : null}
              <div className={desktopSearchClasses}>
                <div className="relative w-full min-w-0">
/**
 * desktopSearchClasses - Utility function
 * @returns void
 */
                  <div className="flex h-11 w-full items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 text-sm text-slate-900">
                    <button
                      type="button"
                      aria-label="Close search"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setShowResults(false)
                      }}
                      className="text-slate-500 transition hover:text-slate-700"
                    >
                      <Search className="h-4 w-4" />
/**
 * mobileSearchClasses - Utility function
 * @returns void
 */
                    </button>
                    <input
                      ref={desktopInputRef}
                      type="text"
                      placeholder="Search artists by name..."
                      inputMode="search"
                      autoComplete="off"
                      autoCorrect="off"
/**
 * walletLabel - Utility function
 * @returns void
 */
                      spellCheck={false}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-full flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
/**
 * profileHandle - Utility function
 * @returns void
 */
                    />
                    {isSearching && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    )}
/**
 * profileLabel - Utility function
 * @returns void
 */
                  </div>
                  {showResults && searchResults && searchResults.length > 0 && (
                    <div
                      ref={searchResultsRef}
                      className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                        <div className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                          Artists
                        </div>
/**
 * useWhiteNav - Custom React hook
 * @returns void
 */
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((profile) => (
                          <button
/**
 * avatarFallbackUrl - Utility function
 * @returns void
 */
                            key={profile.id || profile.profileId}
                            type="button"
                            onClick={() => {
                              const slug = resolvedSlugs[profile.userId] || profile.userId
                              console.log(
                                '[SiteHeader] Navigating to profile:',
/**
 * avatarUrl - Utility function
 * @returns void
 */
                                slug,
                                profile.displayName,
                              )
                              router.push(`/profile/${encodeURIComponent(slug)}`)
/**
 * logoSrc - Utility function
 * @returns void
 */
                              setIsSearchOpen(false)
                              setShowResults(false)
                              setSearchQuery('')
                            }}
                            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                          >
/**
 * navClasses - Utility function
 * @returns void
 */
                            {profile.profileImageUrl ? (
                              <Image
                                src={profile.profileImageUrl}
                                alt={profile.displayName}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
/**
 * compactMenuClasses - Utility function
 * @returns void
 */
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 ring-2 ring-slate-100">
                                <User className="h-5 w-5 text-slate-500" />
/**
 * headerIconButtonClasses - Utility function
 * @returns void
 */
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-semibold text-slate-900">
                                {profile.displayName}
                              </div>
                              {profile.location && (
/**
 * createMenuItems - Utility function
 * @returns void
 */
                                <div className="truncate text-sm text-slate-500">
                                  {profile.location}
                                </div>
                              )}
                            </div>
                            {profile.isVerified && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {showResults &&
                    searchQuery.trim() &&
                    searchResults &&
                    searchResults.length === 0 &&
                    !isSearching && (
                      <div
                        ref={searchResultsRef}
                        className="absolute top-full right-0 left-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl"
                      >
                        <div className="px-4 py-8 text-center">
                          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <Search className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="text-sm font-medium text-slate-900">No artists found</div>
                          <div className="mt-1 text-sm text-slate-500">
                            Try searching with a different name
                          </div>
                        </div>
                      </div>
                    )}
                </div>
/**
 * isActive - Utility function
 * @returns void
 */
              </div>
            </>
          ) : null}
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
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] p-2">
                {user ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/artist/invoices/create')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                    >
                      <DollarSign className="h-5 w-5 text-slate-700" />
                      <span className="font-semibold text-slate-900">Quick Sell</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/artworks/upload')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                    >
                      <ImagePlus className="h-5 w-5 text-slate-700" />
                      <span className="font-semibold text-slate-900">Upload Inventory</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsPostMomentModalOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                    >
                      <Video className="h-5 w-5 text-slate-700" />
                      <span className="font-semibold text-slate-900">Post a Moment</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/artist/invoices/create')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                    >
                      <FileText className="h-5 w-5 text-slate-700" />
                      <span className="font-semibold text-slate-900">Create Invoice</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    {navLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.href}
                        onClick={() => {
                          router.push(link.href)
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                      >
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => {
                        // TODO: Implement notifications navigation/action
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                    >
                      <Bell className="h-5 w-5 text-slate-700" />
/**
 * slug - Utility function
 * @returns void
 */
                      <span className="font-semibold text-slate-900">Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/profile/${encodeURIComponent(profileHandle)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                      >
                        <User className="h-5 w-5 text-slate-700" />
                        <span className="font-semibold text-slate-900">@{profileLabel}</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {navLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.href}
                        onClick={() => {
                          router.push(link.href)
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                      >
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                      >
                        <span className="font-semibold text-slate-900">Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
                      >
                        <span className="font-semibold text-slate-900">Get Started</span>
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
                className="hidden cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-blue-700 lg:inline-flex"
              >
                <DollarSign className="h-4 w-4" />
                Quick Sell
              </button>
              <div className="hidden lg:inline-flex">
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
                aria-label="Notifications"
                className={`hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm transition lg:inline-flex ${headerIconButtonClasses}`}
              >
                <Bell className="h-4 w-4" />
              </button>
              <Link
                href={`/profile/${encodeURIComponent(profileHandle)}`}
                className={`hidden min-w-0 cursor-pointer items-center gap-2 text-base font-semibold lg:inline-flex ${
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
                className={`hidden cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition lg:inline-flex ${
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
                className={`hidden cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition lg:inline-flex ${
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
      {shouldShowSearch ? (
        <div className={mobileSearchClasses}>
          <div className="px-6 pb-4 sm:px-8 lg:px-12">
            <div className="relative">
              <div className="flex h-11 w-full items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 shadow-sm focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200">
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setShowResults(false)
                  }}
                  className="text-slate-500 transition hover:text-slate-700"
                >
                  <Search className="h-4 w-4" />
                </button>
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search artists by name..."
                  inputMode="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {isSearching && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                )}
              </div>
              {showResults && searchResults && searchResults.length > 0 && (
                <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <div className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                      Artists
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((profile) => (
                      <button
                        key={profile.id || profile.profileId}
                        type="button"
                        onClick={() => {
                          const slug = resolvedSlugs[profile.userId] || profile.userId
                          console.log(
                            '[SiteHeader Mobile] Navigating to profile:',
                            slug,
                            profile.displayName,
                          )
                          router.push(`/profile/${encodeURIComponent(slug)}`)
                          setIsSearchOpen(false)
                          setShowResults(false)
                          setSearchQuery('')
                        }}
                        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                      >
                        {profile.profileImageUrl ? (
                          <Image
                            src={profile.profileImageUrl}
                            alt={profile.displayName}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 ring-2 ring-slate-100">
                            <User className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-900">
                            {profile.displayName}
/**
 * Icon - React component
 * @returns React element
 */
                          </div>
                          {profile.location && (
                            <div className="truncate text-sm text-slate-500">
                              {profile.location}
                            </div>
                          )}
                        </div>
                        {profile.isVerified && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {showResults &&
                searchQuery.trim() &&
                searchResults &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="px-4 py-8 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="text-sm font-medium text-slate-900">No artists found</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Try searching with a different name
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      ) : null}
      <PostMomentModal open={isPostMomentModalOpen} onOpenChange={setIsPostMomentModalOpen} />
    </header>
  )
}

/**
 * slug - Utility function
 * @returns void
 */