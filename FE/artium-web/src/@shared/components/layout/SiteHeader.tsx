import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Bell, DollarSign, FileText, ImagePlus, Plus, Search, Video, User } from 'lucide-react'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { profileApis, type SellerProfilePayload } from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import { PostMomentModal } from '@domains/moments/components/modals/PostMomentModal'

const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/editorial', label: 'Editorial' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/auction', label: 'Live Auctions' },
]

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
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const sidebarPrefixes = [
    '/homepage',
    '/messages',
    '/portfolio',
    '/custom-website',
    '/events',
    '/inventory',
    '/artist-management',
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
  const authRoutes = ['/login', '/sign-up', '/forgot-password', '/reset-password']
  const marketingRoutes = ['/', '/discover', '/editorial', '/pricing', '/auction']
  const isAuthRoute = authRoutes.includes(router.pathname) || router.pathname.startsWith('/auth')
  const isMarketingRoute = marketingRoutes.includes(router.pathname)
  const borderedHeaderRoutes = ['/discover', '/auction']
  const shouldForceHeaderBorder = borderedHeaderRoutes.includes(router.pathname)
  const isEditorialPage = router.pathname === '/editorial'
  const isPricingPage = router.pathname === '/pricing'
  const isTransparentHeaderPage = isEditorialPage || isPricingPage
  const shouldShowSearch = sidebarPrefixes.some(
    (prefix) => router.asPath === prefix || router.asPath.startsWith(`${prefix}/`),
  )
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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('')
      setSearchResults([])
      setShowResults(false)
      return
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const targetInput = isMobile ? mobileInputRef.current : desktopInputRef.current
    targetInput?.focus()
  }, [isSearchOpen])

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true)
        const response = await profileApis.searchSellerProfiles(searchQuery.trim(), { take: 5 })
        const items = response?.items || []
        setSearchResults(items)
        setShowResults(true)

        // Resolve user slugs in parallel for proper URL navigation
        const slugMap: Record<string, string> = {}
        await Promise.all(
          items.map(async (item) => {
            try {
              const u = await usersApi.getUserById(item.userId)
              slugMap[item.userId] = u.slug || u.username || item.userId
            } catch {
              slugMap[item.userId] = item.userId
            }
          }),
        )
        setResolvedSlugs(slugMap)
      } catch {
        setSearchResults([])
        setShowResults(false)
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

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
    return 'bg-transparent! border-transparent shadow-none backdrop-blur-none'
  }

  // Marketing header class for non-landing, non-editorial, non-auth routes
  const marketingHeaderClass =
    isScrolled || isMomentDetailPage
      ? 'bg-white border-b border-slate-200 shadow-sm'
      : isMarketingRoute
        ? shouldForceHeaderBorder
          ? 'bg-white border-b border-slate-200 shadow-[0_4px_12px_rgba(15,23,42,0.08)]'
          : 'bg-transparent border-b border-transparent'
        : 'bg-white/70 border-b border-white/40 shadow-[0_6px_20px_rgba(15,23,42,0.06)]'

  const headerClasses = [
    'sticky top-0 z-50 transition-all duration-300',
    isLandingVariant
      ? isScrolled
        ? 'bg-black border-b border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
        : 'bg-transparent border-b border-transparent text-white'
      : isAuthRoute
        ? 'bg-transparent border-b border-transparent shadow-none backdrop-blur-none'
        : 'backdrop-blur-2xl backdrop-saturate-150',
    !isLandingVariant &&
    !isAuthRoute &&
    (isTransparentHeaderPage ? getTransparentHeaderClasses() : marketingHeaderClass),
  ]
    .filter(Boolean)
    .join(' ')

  const desktopSearchClasses = [
    'hidden md:flex items-center transition-all duration-300',
    isSearchVisible ? 'ml-3 w-[360px] opacity-100' : 'ml-0 w-0 opacity-0 pointer-events-none',
    showResults ? 'overflow-visible' : 'overflow-hidden',
  ].join(' ')

  const mobileSearchClasses = [
    'md:hidden transition-all duration-300',
    isSearchVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
    showResults ? 'overflow-visible' : 'overflow-hidden',
  ].join(' ')
  const profileHandle = user?.username ?? user?.email ?? 'profile'
  const profileLabel = user?.username ?? user?.email ?? 'user'
  const avatarUrl = user?.avatarUrl ?? '/images/logo-dark-mode.png'
  const useWhiteNav = isLandingVariant || isAuthRoute || (isTransparentHeaderPage && !isScrolled)
  const logoSrc = useWhiteNav
    ? '/images/logo/logo-and-text-dark-mode.png'
    : '/images/logo/logo-and-text-light-mode.png'

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

  return (
    <header
      className={headerClasses}
      style={{
        fontFamily: '"ABC Monument Grotesk", "Segoe UI", Tahoma, sans-serif',
      }}
    >
      <div className="mx-auto flex min-h-20 w-full flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-4 lg:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt="Artium"
              width={140}
              height={36}
              className="h-7 w-auto sm:h-8"
              priority
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-6 text-[14px]! font-semibold tracking-[0.2em] uppercase sm:gap-8 sm:text-xs">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 transition-colors ${useWhiteNav
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
          {shouldShowSearch ? (
            <>
              {!isSearchVisible ? (
                <button
                  type="button"
                  aria-label="Toggle search"
                  aria-expanded={isSearchVisible}
                  onClick={() => setIsSearchOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <Search className="h-4 w-4" />
                </button>
              ) : null}
              <div className={desktopSearchClasses}>
                <div className="relative w-full">
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
                    </button>
                    <input
                      ref={desktopInputRef}
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
                    <div
                      ref={searchResultsRef}
                      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
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
                              console.log('[SiteHeader] Navigating to profile:', slug, profile.displayName)
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
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {profile.displayName}
                              </div>
                              {profile.location && (
                                <div className="text-sm text-slate-500 truncate">{profile.location}</div>
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
                  {showResults && searchQuery.trim() && searchResults && searchResults.length === 0 && !isSearching && (
                    <div
                      ref={searchResultsRef}
                      className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
              </div>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => router.push('/artist/invoices/create')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <DollarSign className="h-4 w-4" />
                Quick Sell
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Create"
                    className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm transition ${isLandingVariant
                      ? 'border-white/20 bg-transparent text-white hover:border-white/30 hover:bg-white/10'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900'
                      }`}
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
              <button
                type="button"
                aria-label="Notifications"
                className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm transition ${isLandingVariant
                  ? 'border-white/20 bg-transparent text-white hover:border-white/30 hover:bg-white/10'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900'
                  }`}
              >
                <Bell className="h-4 w-4" />
              </button>
              <Link
                href={`/profile/${encodeURIComponent(profileHandle)}`}
                className={`hidden cursor-pointer items-center gap-2 text-base font-semibold sm:inline-flex ${isLandingVariant ? 'text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                <span>@{profileLabel}</span>
                <Image
                  src={avatarUrl}
                  alt={profileLabel}
                  width={40}
                  height={40}
                  className={`h-10 w-10 rounded-full object-cover ${isLandingVariant ? 'border border-white/30' : 'border border-slate-200'
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
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition ${isLandingVariant
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
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition ${isLandingVariant
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
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
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
                          console.log('[SiteHeader Mobile] Navigating to profile:', slug, profile.displayName)
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
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {profile.displayName}
                          </div>
                          {profile.location && (
                            <div className="text-sm text-slate-500 truncate">{profile.location}</div>
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
              {showResults && searchQuery.trim() && searchResults && searchResults.length === 0 && !isSearching && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl">
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
