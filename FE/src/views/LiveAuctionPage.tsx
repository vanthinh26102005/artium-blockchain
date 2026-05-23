import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Gavel,
  Grid2X2,
  LayoutList,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { BidEditingModal, type BidOrderStatusPayload } from '@domains/auction/components'
import { useAuctionLots } from '@domains/auction/hooks/useAuctionLots'
import { useAuctionRealtime } from '@domains/auction/hooks/useAuctionRealtime'
import {
  formatAuctionEth,
  formatAuctionEthInputValue,
  formatAuctionEthValue,
  normalizeAuctionEthValue,
} from '@domains/auction/utils'
import type {
  AuctionFilterCategoryKey,
  AuctionFilterStatusKey,
  AuctionLot,
  AuctionLotStatusKey,
} from '@domains/auction/types'
import { Skeleton } from '@shared/components/ui/skeleton'
import { Metadata } from '@/components/SEO/Metadata'

type AuctionCategoryKey = AuctionFilterCategoryKey

type AuctionStatusKey = AuctionFilterStatusKey

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const bodyFont = {
  fontFamily: 'Inter, "Segoe UI", Tahoma, sans-serif',
} satisfies CSSProperties

const categoryOptions: Array<{ key: AuctionCategoryKey; label: string; helper: string }> = [
  { key: 'all', label: 'ALL WORKS', helper: 'Show every category' },
  { key: 'architectural', label: 'ARCHITECTURAL', helper: 'Built-form studies and facades' },
  { key: 'sculpture', label: 'SCULPTURE', helper: 'Objects, forms, and physical studies' },
  { key: 'digital', label: 'DIGITAL', helper: 'Synthetic and virtual compositions' },
  { key: 'installation', label: 'INSTALLATION', helper: 'Spatial and large-scale works' },
]

const statusOptions: Array<{ key: AuctionStatusKey; label: string; helper: string }> = [
  { key: 'all', label: 'ALL STATUSES', helper: 'Show every auction state' },
  { key: 'active', label: 'ACTIVE BIDDING', helper: 'Lots currently accepting bids' },
  { key: 'ending-soon', label: 'ENDING SOON', helper: 'Auctions closing shortly' },
  { key: 'closed', label: 'CLOSED', helper: 'Completed auctions' },
  { key: 'newly-listed', label: 'NEWLY LISTED', helper: 'Freshly opened lots' },
  { key: 'paused', label: 'PAUSED / RESERVE', helper: 'Paused or reserve not met' },
]

const MIN_ETH = 0
const MAX_ETH = 3
const PRICE_RANGE_STEP = 0.0001
const ITEMS_PER_PAGE = 24

const statusBadgeClass: Record<AuctionLotStatusKey, string> = {
  active: 'bg-[#16a34a]',
  'ending-soon': 'bg-[#dc2626]',
  closed: 'bg-[#9ca3af]',
  'newly-listed': 'bg-[#2563eb]',
  paused: 'bg-[#eab308]',
}

const lotActionLabel: Record<AuctionLotStatusKey, string> = {
  active: 'Place Bid',
  'ending-soon': 'Place Bid',
  'newly-listed': 'Enter Auction',
  paused: 'View Artwork',
  closed: 'View Results',
}

const clampEthValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return MIN_ETH
  }

  return normalizeAuctionEthValue(Math.min(MAX_ETH, Math.max(MIN_ETH, value)))
}

const parseEthInput = (value: string, fallback: number) => {
  const trimmed = value.trim()
  const withoutLeadingPlus = trimmed.startsWith('+') ? trimmed.slice(1) : trimmed
  const normalized = withoutLeadingPlus.replace(',', '.')

  if (!/^(?:\d+|\d*\.\d+)$/.test(normalized)) {
    return fallback
  }

  const parsed = Number.parseFloat(normalized)

  return clampEthValue(parsed)
}

const formatPriceRangeValue = (value: number) => {
  if (value >= MAX_ETH) {
    return `${formatAuctionEthValue(MAX_ETH)}+`
  }

  return formatAuctionEthValue(value)
}

const isBidActionStatus = (statusKey: AuctionLotStatusKey) =>
  statusKey === 'active' || statusKey === 'ending-soon' || statusKey === 'newly-listed'

const isSameAuction = (lot: AuctionLot, auctionId: string) =>
  lot.auctionId === auctionId || lot.onChainOrderId === auctionId || lot.artworkId === auctionId

const AuctionLotCardSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <article
    className={`overflow-hidden rounded-[8px] border border-black/10 bg-white/82 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] md:p-4 ${
      viewMode === 'list'
        ? 'md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-stretch md:gap-5'
        : ''
    }`}
  >
    <Skeleton
      className={`rounded-[6px] bg-[#ecefeb] ${
        viewMode === 'grid'
          ? 'mb-5 aspect-[4/5] md:mb-6 md:aspect-[3/4]'
          : 'mb-4 aspect-[5/4] md:mb-0 md:aspect-auto md:h-full md:w-full'
      }`}
    />
    <div className={`space-y-4 ${viewMode === 'list' ? 'md:py-2' : ''}`}>
      <div className={`${viewMode === 'list' ? 'border-b border-[#c4c7c7]/30 pb-4' : ''}`}>
        <Skeleton className="h-5 w-3/4 rounded-[4px] bg-[#ecefeb]" />
        <Skeleton className="mt-3 h-3 w-32 rounded-[4px] bg-[#ecefeb]" />
        {viewMode === 'list' ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full rounded-[4px] bg-[#ecefeb]" />
            <Skeleton className="h-3 w-5/6 rounded-[4px] bg-[#ecefeb]" />
          </div>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-4 border-[#c4c7c7]/30 pt-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-[4px] bg-[#ecefeb]" />
          <Skeleton className="h-6 w-24 rounded-[4px] bg-[#ecefeb]" />
        </div>
        <Skeleton className="h-9 w-24 rounded-[6px] bg-[#ecefeb]" />
      </div>
    </div>
  </article>
)

const LiveAuctionPage = () => {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AuctionCategoryKey>('all')
  const [selectedStatus, setSelectedStatus] = useState<AuctionStatusKey>('all')
  const [appliedMinPrice, setAppliedMinPrice] = useState(MIN_ETH)
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(MAX_ETH)
  const [mobileSelectedCategory, setMobileSelectedCategory] = useState<AuctionCategoryKey>('all')
  const [mobileSelectedStatus, setMobileSelectedStatus] = useState<AuctionStatusKey>('all')
  const [mobileAppliedMinPrice, setMobileAppliedMinPrice] = useState(MIN_ETH)
  const [mobileAppliedMaxPrice, setMobileAppliedMaxPrice] = useState(MAX_ETH)
  const [mobileMinInputValue, setMobileMinInputValue] = useState(
    formatAuctionEthInputValue(MIN_ETH),
  )
  const [mobileMaxInputValue, setMobileMaxInputValue] = useState(
    formatAuctionEthInputValue(MAX_ETH),
  )
  const [draftMinPrice, setDraftMinPrice] = useState(MIN_ETH)
  const [draftMaxPrice, setDraftMaxPrice] = useState(MAX_ETH)
  const [minInputValue, setMinInputValue] = useState(formatAuctionEthInputValue(MIN_ETH))
  const [maxInputValue, setMaxInputValue] = useState(formatAuctionEthInputValue(MAX_ETH))
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [selectedBidLot, setSelectedBidLot] = useState<AuctionLot | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const categoryRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const priceRangeRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const mobileFilterButtonRef = useRef<HTMLButtonElement>(null)
  const mobileFilterCloseButtonRef = useRef<HTMLButtonElement>(null)
  const selectedCategoryOption =
    categoryOptions.find((option) => option.key === selectedCategory) ?? categoryOptions[0]
  const selectedStatusOption =
    statusOptions.find((option) => option.key === selectedStatus) ?? statusOptions[0]
  const mobileSelectedCategoryOption =
    categoryOptions.find((option) => option.key === mobileSelectedCategory) ?? categoryOptions[0]
  const mobileSelectedStatusOption =
    statusOptions.find((option) => option.key === mobileSelectedStatus) ?? statusOptions[0]
  const minPercent = ((draftMinPrice - MIN_ETH) / (MAX_ETH - MIN_ETH)) * 100
  const maxPercent = ((draftMaxPrice - MIN_ETH) / (MAX_ETH - MIN_ETH)) * 100
  const mobileMinPercent = ((mobileAppliedMinPrice - MIN_ETH) / (MAX_ETH - MIN_ETH)) * 100
  const mobileMaxPercent = ((mobileAppliedMaxPrice - MIN_ETH) / (MAX_ETH - MIN_ETH)) * 100
  const { lots, isLoading, error, refresh, refreshAuctionById } = useAuctionLots({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    minBidEth: appliedMinPrice > MIN_ETH ? appliedMinPrice : undefined,
    maxBidEth: appliedMaxPrice < MAX_ETH ? appliedMaxPrice : undefined,
    skip: 0,
    take: 50,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const syncViewportMode = (event?: MediaQueryList | MediaQueryListEvent) => {
      setIsMobileViewport((event ?? mediaQuery).matches)
    }

    syncViewportMode()
    mediaQuery.addEventListener('change', syncViewportMode)

    return () => mediaQuery.removeEventListener('change', syncViewportMode)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!categoryRef.current?.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }

      if (!statusRef.current?.contains(event.target as Node)) {
        setIsStatusOpen(false)
      }

      if (!priceRangeRef.current?.contains(event.target as Node)) {
        setIsPriceRangeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [isMobileFiltersOpen])

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return
    }

    mobileFilterCloseButtonRef.current?.focus()

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileFiltersOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isMobileFiltersOpen])

  useEffect(() => {
    if (isMobileFiltersOpen) {
      return
    }

    mobileFilterButtonRef.current?.focus()
  }, [isMobileFiltersOpen])

  const syncMobileFiltersWithApplied = () => {
    setMobileSelectedCategory(selectedCategory)
    setMobileSelectedStatus(selectedStatus)
    setMobileAppliedMinPrice(appliedMinPrice)
    setMobileAppliedMaxPrice(appliedMaxPrice)
    setMobileMinInputValue(formatAuctionEthInputValue(appliedMinPrice))
    setMobileMaxInputValue(formatAuctionEthInputValue(appliedMaxPrice))
  }

  const applyDesktopPriceRange = () => {
    const nextMin = Math.min(parseEthInput(minInputValue, draftMinPrice), draftMaxPrice)
    const nextMax = Math.max(parseEthInput(maxInputValue, draftMaxPrice), nextMin)

    setCurrentPage(1)
    setDraftMinPrice(nextMin)
    setDraftMaxPrice(nextMax)
    setMinInputValue(formatAuctionEthInputValue(nextMin))
    setMaxInputValue(formatAuctionEthInputValue(nextMax))
    setAppliedMinPrice(nextMin)
    setAppliedMaxPrice(nextMax)
    setIsPriceRangeOpen(false)
  }

  const openMobileFilters = () => {
    syncMobileFiltersWithApplied()
    setIsMobileFiltersOpen(true)
  }

  const resetDesktopFilters = () => {
    setCurrentPage(1)
    setSelectedCategory('all')
    setSelectedStatus('all')
    setAppliedMinPrice(MIN_ETH)
    setAppliedMaxPrice(MAX_ETH)
    setDraftMinPrice(MIN_ETH)
    setDraftMaxPrice(MAX_ETH)
    setMinInputValue(formatAuctionEthInputValue(MIN_ETH))
    setMaxInputValue(formatAuctionEthInputValue(MAX_ETH))
    setIsCategoryOpen(false)
    setIsStatusOpen(false)
    setIsPriceRangeOpen(false)
  }

  const resetMobileFilters = () => {
    setMobileSelectedCategory('all')
    setMobileSelectedStatus('all')
    setMobileAppliedMinPrice(MIN_ETH)
    setMobileAppliedMaxPrice(MAX_ETH)
    setMobileMinInputValue(formatAuctionEthInputValue(MIN_ETH))
    setMobileMaxInputValue(formatAuctionEthInputValue(MAX_ETH))
  }

  const applyMobileFilters = () => {
    const nextMin = Math.min(
      parseEthInput(mobileMinInputValue, mobileAppliedMinPrice),
      mobileAppliedMaxPrice,
    )
    const nextMax = Math.max(parseEthInput(mobileMaxInputValue, mobileAppliedMaxPrice), nextMin)

    setMobileAppliedMinPrice(nextMin)
    setMobileAppliedMaxPrice(nextMax)
    setMobileMinInputValue(formatAuctionEthInputValue(nextMin))
    setMobileMaxInputValue(formatAuctionEthInputValue(nextMax))
    setCurrentPage(1)
    setSelectedCategory(mobileSelectedCategory)
    setSelectedStatus(mobileSelectedStatus)
    setAppliedMinPrice(nextMin)
    setAppliedMaxPrice(nextMax)
    setIsMobileFiltersOpen(false)
  }

  const filterLots = (
    sourceLots: AuctionLot[],
    category: AuctionCategoryKey,
    status: AuctionStatusKey,
    minPrice: number,
    maxPrice: number,
  ) =>
    sourceLots.filter((lot) => {
      const matchesCategory = category === 'all' ? true : lot.categoryKey === category
      const matchesMinPrice = minPrice > MIN_ETH ? lot.bidValue >= minPrice : true
      const matchesMaxPrice = maxPrice < MAX_ETH ? lot.bidValue <= maxPrice : true
      const matchesStatus = status === 'all' ? true : lot.statusKey === status

      return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStatus
    })

  const visibleLots = useMemo(
    () => filterLots(lots, selectedCategory, selectedStatus, appliedMinPrice, appliedMaxPrice),
    [appliedMaxPrice, appliedMinPrice, lots, selectedCategory, selectedStatus],
  )
  const mobilePreviewLots = useMemo(
    () =>
      filterLots(
        lots,
        mobileSelectedCategory,
        mobileSelectedStatus,
        mobileAppliedMinPrice,
        mobileAppliedMaxPrice,
      ),
    [
      lots,
      mobileAppliedMaxPrice,
      mobileAppliedMinPrice,
      mobileSelectedCategory,
      mobileSelectedStatus,
    ],
  )
  const totalPages = Math.max(1, Math.ceil(visibleLots.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const displayedLots = useMemo(
    () => visibleLots.slice(pageStart, pageStart + ITEMS_PER_PAGE),
    [pageStart, visibleLots],
  )
  const effectiveViewMode = isMobileViewport ? 'list' : viewMode
  const displayedAuctionIds = useMemo(
    () => displayedLots.map((lot) => lot.auctionId),
    [displayedLots],
  )
  const isInitialLoading = isLoading && lots.length === 0
  const skeletonLots = useMemo(
    () => Array.from({ length: effectiveViewMode === 'grid' ? 8 : 5 }),
    [effectiveViewMode],
  )
  const refreshAuctionAndSelection = useCallback(
    async (auctionId: string) => {
      const refreshedLot = await refreshAuctionById(auctionId)

      setSelectedBidLot((currentLot) =>
        currentLot && isSameAuction(currentLot, auctionId) ? refreshedLot : currentLot,
      )

      return refreshedLot
    },
    [refreshAuctionById],
  )
  const handleRealtimeAuctionChange = useCallback(
    (auctionId: string) => {
      void refreshAuctionAndSelection(auctionId).catch(() => refresh())
    },
    [refresh, refreshAuctionAndSelection],
  )

  useAuctionRealtime({
    auctionIds: displayedAuctionIds,
    onAuctionChange: handleRealtimeAuctionChange,
  })

  const activeSelectedBidLot = selectedBidLot
    ? (lots.find((lot) => isSameAuction(lot, selectedBidLot.auctionId)) ?? selectedBidLot)
    : null

  const resultsLabel = `${visibleLots.length} result${visibleLots.length === 1 ? '' : 's'}`
  const mobilePreviewLabel = `${mobilePreviewLots.length} result${mobilePreviewLots.length === 1 ? '' : 's'}`
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    appliedMinPrice !== MIN_ETH ||
    appliedMaxPrice !== MAX_ETH
  const visibleLotsLabel = `${visibleLots.length} ${visibleLots.length === 1 ? 'lot' : 'lots'}`
  const footerLabel = hasActiveFilters
    ? `Page ${safeCurrentPage} of ${totalPages} • ${visibleLotsLabel} matching filters`
    : `Page ${safeCurrentPage} of ${totalPages} • ${visibleLotsLabel} loaded`
  const emptyStateTitle = hasActiveFilters
    ? 'No live auctions match your filters.'
    : 'No live auctions available.'
  const emptyStateBody = hasActiveFilters
    ? 'Adjust or clear your filters to view other auction lots.'
    : 'No live auctions are available right now. Please check back soon.'
  const featuredLot =
    displayedLots.find((lot) => isBidActionStatus(lot.statusKey)) ?? visibleLots[0] ?? lots[0]
  const liveLotCount = visibleLots.filter((lot) => isBidActionStatus(lot.statusKey)).length
  const endingSoonLotCount = visibleLots.filter((lot) => lot.statusKey === 'ending-soon').length
  const totalBidValue = visibleLots.reduce((sum, lot) => sum + lot.bidValue, 0)
  const highestBidLot = visibleLots.reduce<AuctionLot | null>(
    (currentHighest, lot) =>
      !currentHighest || lot.bidValue > currentHighest.bidValue ? lot : currentHighest,
    null,
  )
  const heroStats = [
    {
      icon: Activity,
      value: liveLotCount,
      label: 'Live lots',
      helper: 'accepting bids',
    },
    {
      icon: Timer,
      value: endingSoonLotCount,
      label: 'Closing soon',
      helper: 'watch closely',
    },
    {
      icon: TrendingUp,
      value: formatAuctionEth(totalBidValue),
      label: 'Visible volume',
      helper: highestBidLot ? `Top lot ${formatAuctionEth(highestBidLot.bidValue)}` : 'No bids yet',
    },
  ]

  const scrollResultsToTop = () => {
    if (typeof window === 'undefined') {
      return
    }

    const resultsTop = resultsRef.current?.getBoundingClientRect().top

    if (typeof resultsTop !== 'number') {
      return
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const stickyHeaderOffset = isMobile ? 96 : 128

    window.scrollTo({
      top: Math.max(0, window.scrollY + resultsTop - stickyHeaderOffset),
      behavior: 'smooth',
    })
  }

  const handlePageChange = (nextPage: number) => {
    if (nextPage === safeCurrentPage) {
      return
    }

    setCurrentPage(nextPage)
    scrollResultsToTop()
  }

  const openBidModal = (lot: AuctionLot) => {
    if (!isBidActionStatus(lot.statusKey)) {
      return
    }

    setSelectedBidLot(lot)
  }

  const handleViewOrderStatus = ({ lot }: BidOrderStatusPayload) => {
    if (!lot.onChainOrderId) {
      return
    }

    void router.push(`/auction/bids/${encodeURIComponent(lot.onChainOrderId)}`)
  }

  return (
    <>
      <Metadata
        title="Live Auctions | Artium"
        description="A curated auction showcase for architectural masterworks and digital artifacts on Artium."
      />
      <div className="min-h-screen overflow-hidden bg-[#f6f6f2] text-[#1a1c1c]" style={bodyFont}>
        <main className="mx-auto max-w-[1600px] px-4 pt-8 pb-20 sm:px-6 md:px-10 md:pt-12 xl:px-12">
          <header className="relative mb-8 overflow-hidden rounded-[8px] border border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#f5f7f1_50%,#eaf7f6_100%)] shadow-[0_24px_90px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.86)]">
            <div
              aria-hidden="true"
              className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[#f97316]/14 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#35c9ee]/14 blur-3xl"
            />
            <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.72fr)] lg:p-9 xl:p-10">
              <div className="flex min-w-0 flex-col justify-center py-2">
                <p className="mb-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md">
                  <Gavel className="h-4 w-4 text-[#f97316]" />
                  Live bidding room
                </p>
                <h1
                  className={`${spaceGrotesk.className} max-w-4xl text-[46px] leading-[0.92] font-bold tracking-normal text-slate-950 uppercase sm:text-[68px] xl:text-[88px]`}
                >
                  Live Auctions
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Browse verified auction lots, compare live bid signals, and enter the bidding flow
                  without losing sight of price, category, or closing urgency.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={scrollResultsToTop}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold tracking-[0.08em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950/30 focus-visible:outline-none"
                    style={headlineFont}
                  >
                    Explore lots
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/artist/auctions"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/64 px-6 text-sm font-bold tracking-[0.08em] text-slate-950 uppercase transition hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-950/30 focus-visible:outline-none"
                    style={headlineFont}
                  >
                    Seller tools
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {heroStats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="rounded-[8px] border border-black/10 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-md"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[6px] bg-slate-950 text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-2xl font-bold text-slate-950" style={headlineFont}>
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{stat.helper}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="min-w-0">
                {featuredLot ? (
                  <article className="group h-full overflow-hidden rounded-[8px] border border-black/10 bg-white/78 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.11),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md">
                    <div className="relative min-h-[300px] overflow-hidden rounded-[6px] bg-slate-100 sm:min-h-[420px] lg:min-h-full">
                      {featuredLot.imageSrc ? (
                        <Image
                          src={featuredLot.imageSrc}
                          alt={featuredLot.imageAlt}
                          fill
                          sizes="(max-width: 1024px) 92vw, 38vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full min-h-[320px] items-center justify-center text-[11px] tracking-[0.18em] text-slate-400 uppercase">
                          Image syncing
                        </div>
                      )}
                      <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/86 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-950 uppercase backdrop-blur-md">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusBadgeClass[featuredLot.statusKey]} ${
                            featuredLot.statusKey === 'active' ||
                            featuredLot.statusKey === 'ending-soon'
                              ? 'animate-pulse'
                              : ''
                          }`}
                        />
                        {featuredLot.status}
                      </div>
                    </div>
                    <div className="grid gap-4 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
                      <div className="min-w-0">
                        <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                          Featured lot
                        </p>
                        <h2
                          className="text-3xl leading-none font-bold tracking-normal text-slate-950 uppercase sm:text-4xl"
                          style={headlineFont}
                        >
                          {featuredLot.title}
                        </h2>
                        <Link
                          href={`/artworks/${featuredLot.artworkId}`}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-slate-500 uppercase transition hover:text-slate-950"
                          style={headlineFont}
                        >
                          View artwork details
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        <div className="rounded-full border border-slate-200 bg-white px-4 py-2">
                          <p className="text-[9px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                            Current bid
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-950" style={headlineFont}>
                            {formatAuctionEth(featuredLot.bidValue)}
                          </p>
                        </div>
                        {isBidActionStatus(featuredLot.statusKey) ? (
                          <button
                            type="button"
                            onClick={() => openBidModal(featuredLot)}
                            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold tracking-[0.12em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950/30 focus-visible:outline-none"
                            style={headlineFont}
                          >
                            {lotActionLabel[featuredLot.statusKey]}
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <Link
                            href={`/artworks/${featuredLot.artworkId}`}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold tracking-[0.12em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950/30 focus-visible:outline-none"
                            style={headlineFont}
                          >
                            {lotActionLabel[featuredLot.statusKey]}
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ) : (
                  <div className="h-full min-h-[420px] rounded-[8px] border border-black/10 bg-white/70 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                    <Skeleton className="h-full min-h-[390px] rounded-[6px] bg-[#ecefeb]" />
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="sticky top-20 z-20 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-black/10 bg-white/82 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl md:static md:p-4">
            <div className="hidden flex-wrap items-center gap-3 md:flex">
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusOpen(false)
                    setIsPriceRangeOpen(false)
                    setIsCategoryOpen((prev) => !prev)
                  }}
                  className="group min-h-14 rounded-[8px] border border-slate-200 bg-white/74 px-4 py-2 text-left transition hover:border-slate-300 hover:bg-white focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                  aria-expanded={isCategoryOpen}
                  aria-haspopup="listbox"
                >
                  <span className="mb-2 block text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                    Category
                  </span>
                  <span
                    className="flex items-center gap-2 text-sm font-bold text-black transition-colors group-hover:text-black/70"
                    style={headlineFont}
                  >
                    {selectedCategoryOption.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isCategoryOpen ? (
                  <div className="absolute top-full left-0 z-20 mt-3 min-w-[300px] rounded-[8px] border border-black/10 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.15)] backdrop-blur-xl">
                    <div className="space-y-1" role="listbox" aria-label="Category options">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => {
                            setCurrentPage(1)
                            setSelectedCategory(option.key)
                            setIsCategoryOpen(false)
                          }}
                          className={`block w-full rounded-[6px] px-3 py-3 text-left transition-colors ${
                            option.key === selectedCategory
                              ? 'bg-slate-950 text-white'
                              : 'text-black hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-sm font-bold uppercase" style={headlineFont}>
                            {option.label}
                          </span>
                          <span
                            className={`mt-1 block text-[11px] tracking-[0.08em] uppercase ${
                              option.key === selectedCategory ? 'text-white/70' : 'text-[#747777]'
                            }`}
                          >
                            {option.helper}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div ref={statusRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(false)
                    setIsPriceRangeOpen(false)
                    setIsStatusOpen((prev) => !prev)
                  }}
                  className="group min-h-14 rounded-[8px] border border-slate-200 bg-white/74 px-4 py-2 text-left transition hover:border-slate-300 hover:bg-white focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                  aria-expanded={isStatusOpen}
                  aria-haspopup="listbox"
                >
                  <span className="mb-2 block text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                    Status
                  </span>
                  <span
                    className="flex items-center gap-2 text-sm font-bold text-black transition-colors group-hover:text-black/70"
                    style={headlineFont}
                  >
                    {selectedStatusOption.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isStatusOpen ? (
                  <div className="absolute top-full left-0 z-20 mt-3 min-w-[300px] rounded-[8px] border border-black/10 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.15)] backdrop-blur-xl">
                    <div className="space-y-1" role="listbox" aria-label="Status options">
                      {statusOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => {
                            setCurrentPage(1)
                            setSelectedStatus(option.key)
                            setIsStatusOpen(false)
                          }}
                          className={`block w-full rounded-[6px] px-3 py-3 text-left transition-colors ${
                            option.key === selectedStatus
                              ? 'bg-slate-950 text-white'
                              : 'text-black hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-sm font-bold uppercase" style={headlineFont}>
                            {option.label}
                          </span>
                          <span
                            className={`mt-1 block text-[11px] tracking-[0.08em] uppercase ${
                              option.key === selectedStatus ? 'text-white/70' : 'text-[#747777]'
                            }`}
                          >
                            {option.helper}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div ref={priceRangeRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(false)
                    setIsStatusOpen(false)
                    if (!isPriceRangeOpen) {
                      setDraftMinPrice(appliedMinPrice)
                      setDraftMaxPrice(appliedMaxPrice)
                      setMinInputValue(formatAuctionEthInputValue(appliedMinPrice))
                      setMaxInputValue(formatAuctionEthInputValue(appliedMaxPrice))
                    }

                    setIsPriceRangeOpen((prev) => !prev)
                  }}
                  className="group min-h-14 rounded-[8px] border border-slate-200 bg-white/74 px-4 py-2 text-left transition hover:border-slate-300 hover:bg-white focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                  aria-expanded={isPriceRangeOpen}
                  aria-haspopup="dialog"
                >
                  <span className="mb-2 block text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                    Price Range
                  </span>
                  <span
                    className="flex items-center gap-2 text-sm font-bold text-black transition-colors group-hover:text-black/70"
                    style={headlineFont}
                  >
                    {formatPriceRangeValue(appliedMinPrice)} ETH -{' '}
                    {formatPriceRangeValue(appliedMaxPrice)} ETH
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isPriceRangeOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isPriceRangeOpen ? (
                  <div
                    role="dialog"
                    aria-label="Price range filter"
                    className="absolute top-full left-0 z-20 mt-3 w-[min(92vw,390px)] rounded-[8px] border border-black/10 bg-white/95 px-4 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:px-5 sm:py-5"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-extrabold tracking-[0.2em] text-[#8a8a8a] uppercase">
                        Range (ETH)
                      </span>
                      <span className="text-lg font-black text-black" style={bodyFont}>
                        {formatPriceRangeValue(draftMinPrice)} -{' '}
                        {formatPriceRangeValue(draftMaxPrice)}
                      </span>
                    </div>

                    <div className="relative mb-6 px-2">
                      <div className="h-1 rounded-full bg-slate-950" />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-[0_0_0_2px_rgba(15,23,42,0.14)]"
                        style={{ left: `calc(${minPercent}% - 12px)` }}
                      />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-[0_0_0_2px_rgba(15,23,42,0.14)]"
                        style={{ left: `calc(${maxPercent}% - 12px)` }}
                      />
                      <input
                        type="range"
                        min={MIN_ETH}
                        max={MAX_ETH}
                        step={PRICE_RANGE_STEP}
                        value={draftMinPrice}
                        onChange={(event) => {
                          const nextValue = clampEthValue(
                            Math.min(Number(event.target.value), draftMaxPrice),
                          )
                          setDraftMinPrice(nextValue)
                          setMinInputValue(formatAuctionEthInputValue(nextValue))
                        }}
                        className="auction-range-input absolute inset-x-0 top-1/2 z-10 h-11 -translate-y-1/2 opacity-0"
                        aria-label="Minimum ETH range"
                      />
                      <input
                        type="range"
                        min={MIN_ETH}
                        max={MAX_ETH}
                        step={PRICE_RANGE_STEP}
                        value={draftMaxPrice}
                        onChange={(event) => {
                          const nextValue = clampEthValue(
                            Math.max(Number(event.target.value), draftMinPrice),
                          )
                          setDraftMaxPrice(nextValue)
                          setMaxInputValue(formatAuctionEthInputValue(nextValue))
                        }}
                        className="auction-range-input absolute inset-x-0 top-1/2 z-20 h-11 -translate-y-1/2 opacity-0"
                        aria-label="Maximum ETH range"
                      />
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <label className="block">
                        <span className="mb-2 block text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                          Min
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={minInputValue}
                          onChange={(event) => setMinInputValue(event.target.value)}
                          onBlur={() => {
                            const nextValue = Math.min(
                              parseEthInput(minInputValue, draftMinPrice),
                              draftMaxPrice,
                            )
                            setDraftMinPrice(nextValue)
                            setMinInputValue(formatAuctionEthInputValue(nextValue))
                          }}
                          className="h-14 w-full rounded-[6px] border border-[#e5e7eb] px-4 text-[1.35rem] text-black transition outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                          Max
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={maxInputValue}
                          onChange={(event) => setMaxInputValue(event.target.value)}
                          onBlur={() => {
                            const nextValue = Math.max(
                              parseEthInput(maxInputValue, draftMaxPrice),
                              draftMinPrice,
                            )
                            setDraftMaxPrice(nextValue)
                            setMaxInputValue(formatAuctionEthInputValue(nextValue))
                          }}
                          className="h-14 w-full rounded-[6px] border border-[#e5e7eb] px-4 text-[1.35rem] text-black transition outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={applyDesktopPriceRange}
                      className="min-h-11 w-full rounded-full bg-slate-950 px-5 py-3.5 text-center text-[13px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                      style={headlineFont}
                    >
                      Apply Range
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-normal">
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={effectiveViewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none ${
                    effectiveViewMode === 'grid'
                      ? 'rounded-full bg-slate-950 text-white'
                      : 'text-black/40 hover:text-black'
                  }`}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={effectiveViewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none ${
                    effectiveViewMode === 'list'
                      ? 'rounded-full bg-slate-950 text-white'
                      : 'text-black/40 hover:text-black'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
              <p
                className="hidden text-xs tracking-[0.22em] text-[#747777] uppercase md:block"
                style={headlineFont}
              >
                Showing {resultsLabel}
              </p>
              <button
                type="button"
                onClick={resetDesktopFilters}
                disabled={!hasActiveFilters}
                className={`hidden min-h-11 items-center text-xs tracking-[0.22em] uppercase transition focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none md:inline-flex ${
                  hasActiveFilters
                    ? 'cursor-pointer text-black hover:text-black/60'
                    : 'cursor-not-allowed text-black/30'
                }`}
                style={headlineFont}
              >
                Clear Filters
              </button>
              <p
                className="text-[11px] tracking-[0.2em] text-[#747777] uppercase md:hidden"
                style={headlineFont}
              >
                {resultsLabel}
              </p>
              <button
                ref={mobileFilterButtonRef}
                type="button"
                onClick={openMobileFilters}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs tracking-[0.18em] text-black uppercase transition hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none md:hidden"
                style={headlineFont}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Open Filters
              </button>
            </div>
          </section>

          {error ? (
            <section className="mb-8 rounded-[8px] border border-[#dc2626]/20 bg-[#fff7f7] px-6 py-5 shadow-[0_18px_50px_rgba(127,29,29,0.06)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm leading-7 text-[#7f1d1d]">
                  We could not sync the latest auction state. Refresh auctions, review the newest
                  bid data, and try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void refresh()
                  }}
                  className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                  style={headlineFont}
                >
                  Refresh
                </button>
              </div>
            </section>
          ) : null}

          <section
            ref={resultsRef}
            className={
              effectiveViewMode === 'grid'
                ? 'grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid grid-cols-1 gap-5'
            }
          >
            {isInitialLoading
              ? skeletonLots.map((_, index) => (
                  <AuctionLotCardSkeleton
                    key={`auction-skeleton-${index}`}
                    viewMode={effectiveViewMode}
                  />
                ))
              : displayedLots.map((lot) => (
                  <article
                    key={lot.artworkId}
                    className={`group overflow-hidden rounded-[8px] border border-black/10 bg-white/82 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-black/18 hover:shadow-[0_26px_70px_rgba(15,23,42,0.13)] md:p-4 ${
                      effectiveViewMode === 'list'
                        ? 'md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-stretch md:gap-5'
                        : ''
                    }`}
                  >
                    <div
                      className={`relative overflow-hidden rounded-[6px] bg-[#f7f7f7] ${
                        effectiveViewMode === 'grid'
                          ? 'mb-5 aspect-[4/5] md:mb-6 md:aspect-[3/4]'
                          : 'mb-4 aspect-[5/4] md:mb-0 md:aspect-auto md:h-full md:w-full'
                      }`}
                    >
                      {lot.imageSrc ? (
                        <Image
                          src={lot.imageSrc}
                          alt={lot.imageAlt}
                          fill
                          sizes={
                            effectiveViewMode === 'grid'
                              ? '(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 768px) 44vw, 92vw'
                              : '(min-width: 768px) 280px, 92vw'
                          }
                          className="object-cover transition-all duration-700 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full min-h-64 items-center justify-center px-6 text-center text-[11px] tracking-[0.2em] text-[#747777] uppercase">
                          Image syncing
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 backdrop-blur-md">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusBadgeClass[lot.statusKey]} ${
                            lot.statusKey === 'active' || lot.statusKey === 'ending-soon'
                              ? 'animate-pulse'
                              : ''
                          }`}
                        />
                        <span className="text-[10px] tracking-[0.08em] text-black uppercase">
                          {lot.status}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`space-y-4 ${
                        effectiveViewMode === 'list'
                          ? 'flex min-w-0 flex-col justify-between md:py-2'
                          : ''
                      }`}
                    >
                      <div
                        className={`flex items-start justify-between gap-3 ${
                          effectiveViewMode === 'list' ? 'border-b border-[#c4c7c7]/30 pb-4' : ''
                        }`}
                      >
                        <div>
                          <h2
                            className={`font-bold text-black uppercase ${
                              effectiveViewMode === 'grid'
                                ? 'text-lg tracking-[-0.04em]'
                                : 'text-2xl tracking-[0.02em] md:text-3xl'
                            }`}
                            style={headlineFont}
                          >
                            {lot.title}
                          </h2>
                          <Link
                            href={`/artworks/${lot.artworkId}`}
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] text-black/55 uppercase transition hover:text-black"
                            style={headlineFont}
                          >
                            View artwork details
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                          {effectiveViewMode === 'list' ? (
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#747777]">
                              Verified collectible with on-chain provenance, active bidding, and a
                              curator-selected presentation format designed for quick comparison.
                            </p>
                          ) : null}
                        </div>
                        <ShieldCheck className="h-5 w-5 shrink-0 text-[#747777] transition-colors group-hover:text-black" />
                      </div>
                      <div
                        className={`flex gap-4 border-[#c4c7c7]/30 ${
                          effectiveViewMode === 'grid'
                            ? 'items-end justify-between border-t pt-4'
                            : 'items-end justify-between rounded-[8px] bg-slate-50 px-4 py-3'
                        }`}
                      >
                        <div>
                          <p className="mb-1 text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                            Current Bid
                          </p>
                          <p
                            className={`font-bold text-black uppercase ${
                              effectiveViewMode === 'grid' ? 'text-lg' : 'text-2xl md:text-3xl'
                            }`}
                            style={headlineFont}
                          >
                            {formatAuctionEth(lot.bidValue)}
                          </p>
                        </div>
                        {isBidActionStatus(lot.statusKey) ? (
                          <button
                            type="button"
                            onClick={() => openBidModal(lot)}
                            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-center text-[10px] font-bold tracking-[0.16em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                            style={headlineFont}
                          >
                            {lotActionLabel[lot.statusKey]}
                          </button>
                        ) : (
                          <Link
                            href={`/artworks/${lot.artworkId}`}
                            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-center text-[10px] font-bold tracking-[0.16em] text-white uppercase transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                            style={headlineFont}
                          >
                            {lotActionLabel[lot.statusKey]}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
          </section>

          {!error && !isInitialLoading && visibleLots.length === 0 ? (
            <section className="mt-12 rounded-[8px] border border-black/10 bg-white/72 px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <p className="text-sm tracking-[0.14em] text-black uppercase" style={headlineFont}>
                {emptyStateTitle}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#747777]">
                {emptyStateBody}
              </p>
            </section>
          ) : null}

          <section className="mt-24 flex flex-col items-center gap-8">
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                  className={`min-h-11 rounded-full border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none ${
                    safeCurrentPage === 1
                      ? 'cursor-not-allowed border-black/15 text-black/25'
                      : 'border-black/25 bg-white/70 text-black hover:bg-slate-950 hover:text-white'
                  }`}
                  style={headlineFont}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1
                  const isActive = pageNumber === safeCurrentPage

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`min-h-11 min-w-11 rounded-full border px-3 py-2 text-[11px] tracking-[0.18em] uppercase transition focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none ${
                        isActive
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-black/25 bg-white/70 text-black hover:border-slate-950 hover:bg-slate-950 hover:text-white'
                      }`}
                      style={headlineFont}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className={`min-h-11 rounded-full border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none ${
                    safeCurrentPage === totalPages
                      ? 'cursor-not-allowed border-black/15 text-black/25'
                      : 'border-black/25 bg-white/70 text-black hover:bg-slate-950 hover:text-white'
                  }`}
                  style={headlineFont}
                >
                  Next
                </button>
              </div>
            ) : null}
            <p className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">{footerLabel}</p>
          </section>
        </main>

        {isMobileFiltersOpen ? (
          <div
            className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-auction-filters-title"
              className="ml-auto flex h-full w-full max-w-md flex-col bg-[#f8faf6]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#c4c7c7]/30 px-6 py-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                    Filter Auctions
                  </p>
                  <p
                    id="mobile-auction-filters-title"
                    className="mt-1 text-lg font-bold text-black uppercase"
                    style={headlineFont}
                  >
                    Previewing {mobilePreviewLabel}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={resetMobileFilters}
                    className="min-h-11 rounded-full border border-black/15 bg-white px-3 py-2 text-[11px] font-bold tracking-[0.18em] text-black uppercase transition hover:border-black hover:bg-black hover:text-white focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                    style={headlineFont}
                  >
                    Clear
                  </button>
                  <button
                    ref={mobileFilterCloseButtonRef}
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="min-h-11 rounded-full border border-black bg-black px-3 py-2 text-[11px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                    style={headlineFont}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                      Category
                    </span>
                    <span
                      className="text-[11px] tracking-[0.14em] text-black uppercase"
                      style={headlineFont}
                    >
                      {mobileSelectedCategoryOption.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setMobileSelectedCategory(option.key)}
                        className={`block w-full rounded-[8px] border px-4 py-3 text-left transition-colors ${
                          option.key === mobileSelectedCategory
                            ? 'border-black bg-black text-white'
                            : 'border-[#d7dada] bg-white text-black hover:border-black'
                        }`}
                      >
                        <span className="block text-sm font-bold uppercase" style={headlineFont}>
                          {option.label}
                        </span>
                        <span
                          className={`mt-1 block text-[11px] tracking-[0.08em] uppercase ${
                            option.key === mobileSelectedCategory
                              ? 'text-white/70'
                              : 'text-[#747777]'
                          }`}
                        >
                          {option.helper}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                      Status
                    </span>
                    <span
                      className="text-[11px] tracking-[0.14em] text-black uppercase"
                      style={headlineFont}
                    >
                      {mobileSelectedStatusOption.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setMobileSelectedStatus(option.key)}
                        className={`block w-full rounded-[8px] border px-4 py-3 text-left transition-colors ${
                          option.key === mobileSelectedStatus
                            ? 'border-black bg-black text-white'
                            : 'border-[#d7dada] bg-white text-black hover:border-black'
                        }`}
                      >
                        <span className="block text-sm font-bold uppercase" style={headlineFont}>
                          {option.label}
                        </span>
                        <span
                          className={`mt-1 block text-[11px] tracking-[0.08em] uppercase ${
                            option.key === mobileSelectedStatus ? 'text-white/70' : 'text-[#747777]'
                          }`}
                        >
                          {option.helper}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                      Price Range
                    </span>
                    <span className="text-lg font-black text-black" style={bodyFont}>
                      {formatPriceRangeValue(mobileAppliedMinPrice)} -{' '}
                      {formatPriceRangeValue(mobileAppliedMaxPrice)} ETH
                    </span>
                  </div>

                  <div className="relative mb-6 px-2">
                    <div className="h-1 rounded-full bg-black" />
                    <div
                      className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-[0_0_0_2px_rgba(15,23,42,0.14)]"
                      style={{ left: `calc(${mobileMinPercent}% - 12px)` }}
                    />
                    <div
                      className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-[0_0_0_2px_rgba(15,23,42,0.14)]"
                      style={{ left: `calc(${mobileMaxPercent}% - 12px)` }}
                    />
                    <input
                      type="range"
                      min={MIN_ETH}
                      max={MAX_ETH}
                      step={PRICE_RANGE_STEP}
                      value={mobileAppliedMinPrice}
                      onChange={(event) => {
                        const nextValue = clampEthValue(
                          Math.min(Number(event.target.value), mobileAppliedMaxPrice),
                        )
                        setMobileAppliedMinPrice(nextValue)
                        setMobileMinInputValue(formatAuctionEthInputValue(nextValue))
                      }}
                      className="auction-range-input absolute inset-x-0 top-1/2 z-10 h-11 -translate-y-1/2 opacity-0"
                      aria-label="Mobile minimum ETH range"
                    />
                    <input
                      type="range"
                      min={MIN_ETH}
                      max={MAX_ETH}
                      step={PRICE_RANGE_STEP}
                      value={mobileAppliedMaxPrice}
                      onChange={(event) => {
                        const nextValue = clampEthValue(
                          Math.max(Number(event.target.value), mobileAppliedMinPrice),
                        )
                        setMobileAppliedMaxPrice(nextValue)
                        setMobileMaxInputValue(formatAuctionEthInputValue(nextValue))
                      }}
                      className="auction-range-input absolute inset-x-0 top-1/2 z-20 h-11 -translate-y-1/2 opacity-0"
                      aria-label="Mobile maximum ETH range"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                        Min
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={mobileMinInputValue}
                        onChange={(event) => setMobileMinInputValue(event.target.value)}
                        onBlur={() => {
                          const nextValue = Math.min(
                            parseEthInput(mobileMinInputValue, mobileAppliedMinPrice),
                            mobileAppliedMaxPrice,
                          )
                          setMobileAppliedMinPrice(nextValue)
                          setMobileMinInputValue(formatAuctionEthInputValue(nextValue))
                        }}
                        className="h-14 w-full rounded-[6px] border border-[#e5e7eb] bg-white px-4 text-[1.35rem] text-black transition outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                        Max
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={mobileMaxInputValue}
                        onChange={(event) => setMobileMaxInputValue(event.target.value)}
                        onBlur={() => {
                          const nextValue = Math.max(
                            parseEthInput(mobileMaxInputValue, mobileAppliedMaxPrice),
                            mobileAppliedMinPrice,
                          )
                          setMobileAppliedMaxPrice(nextValue)
                          setMobileMaxInputValue(formatAuctionEthInputValue(nextValue))
                        }}
                        className="h-14 w-full rounded-[6px] border border-[#e5e7eb] bg-white px-4 text-[1.35rem] text-black transition outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div className="border-t border-[#c4c7c7]/30 px-6 py-5">
                <button
                  type="button"
                  onClick={applyMobileFilters}
                  className="min-h-11 w-full rounded-full bg-black px-5 py-4 text-center text-[13px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none"
                  style={headlineFont}
                >
                  Apply Filters ({mobilePreviewLots.length})
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <BidEditingModal
          key={activeSelectedBidLot?.artworkId ?? 'bid-modal-closed'}
          lot={activeSelectedBidLot}
          isOpen={Boolean(activeSelectedBidLot)}
          onClose={() => setSelectedBidLot(null)}
          onRefreshLot={refreshAuctionAndSelection}
          onViewOrderStatus={handleViewOrderStatus}
        />

        <style jsx global>{`
          .auction-range-input {
            pointer-events: none;
            appearance: none;
            background: transparent;
          }

          .auction-range-input::-webkit-slider-thumb {
            pointer-events: auto;
            width: 44px;
            height: 44px;
            cursor: grab;
            appearance: none;
            background: transparent;
          }

          .auction-range-input::-webkit-slider-thumb:active {
            cursor: grabbing;
          }

          .auction-range-input::-moz-range-thumb {
            pointer-events: auto;
            width: 44px;
            height: 44px;
            cursor: grab;
            border: 0;
            background: transparent;
          }

          .auction-range-input::-moz-range-thumb:active {
            cursor: grabbing;
          }
        `}</style>
      </div>
    </>
  )
}

export { LiveAuctionPage }

export default LiveAuctionPage
