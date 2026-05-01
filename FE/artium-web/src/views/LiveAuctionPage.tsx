import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChevronDown, Grid2X2, LayoutList, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  BidEditingModal,
  type AuctionBidLot,
} from '@domains/auction/components'
import { type AuctionLotStatusKey } from '@domains/auction/utils'
import { placeBidOnAuction, readAuctionState, type AuctionContractState } from '@domains/auction/services/auctionContract'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import artworkApis, { type ArtworkApiItem } from '@shared/apis/artworkApis'
import orderApis from '@shared/apis/orderApis'
import type { ApiError } from '@shared/services/apiClient'
import { Metadata } from '@/components/SEO/Metadata'

type AuctionLot = AuctionBidLot & {
  categoryKey: AuctionCategoryKey
  statusTone: 'live' | 'muted'
  endTimestamp: number | null
}

type AuctionCategoryKey = 'all'

type AuctionStatusKey =
  | 'all'
  | 'active'
  | 'ending-soon'
  | 'closed'

type SubmitBidInput = {
  lot: AuctionBidLot
  bidAmountEth: string
}

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
  { key: 'all', label: 'ALL ON-CHAIN WORKS', helper: 'Show every contract-backed auction' },
]

const statusOptions: Array<{ key: AuctionStatusKey; label: string; helper: string }> = [
  { key: 'all', label: 'ALL STATUSES', helper: 'Show every auction state' },
  { key: 'active', label: 'ACTIVE BIDDING', helper: 'Lots currently accepting bids' },
  { key: 'ending-soon', label: 'ENDING SOON', helper: 'Auctions closing shortly' },
  { key: 'closed', label: 'CLOSED', helper: 'Completed auctions' },
]

const MIN_ETH = 0
const MAX_ETH = 50
const ITEMS_PER_PAGE = 24

const auctionStatusTone: Record<AuctionLotStatusKey, AuctionLot['statusTone']> = {
  active: 'live',
  'ending-soon': 'live',
  closed: 'muted',
}

const auctionStatusPriority: Record<AuctionLotStatusKey, number> = {
  active: 0,
  'ending-soon': 1,
  closed: 2,
}

const formatBidDisplay = (value: number) => {
  const normalizedValue = Math.min(MAX_ETH, Math.max(MIN_ETH, Number(value.toFixed(1))))
  return `${Number.isInteger(normalizedValue) ? normalizedValue.toFixed(0) : normalizedValue.toFixed(1)} ETH`
}

const statusBadgeClass: Record<AuctionLotStatusKey, string> = {
  active: 'bg-[#16a34a]',
  'ending-soon': 'bg-[#dc2626]',
  closed: 'bg-[#9ca3af]',
}

const lotActionLabel: Record<AuctionLotStatusKey, string> = {
  active: 'Place Bid',
  'ending-soon': 'Place Bid',
  closed: 'View Results',
}

const clampEthValue = (value: number) => {
  if (Number.isNaN(value)) {
    return MIN_ETH
  }

  return Math.min(MAX_ETH, Math.max(MIN_ETH, Number(value.toFixed(1))))
}

const parseEthInput = (value: string, fallback: number) => {
  const normalized = value.replace('+', '').trim()
  const parsed = Number.parseFloat(normalized)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return clampEthValue(parsed)
}

const formatEthDisplay = (value: number) => {
  if (value >= MAX_ETH) {
    return '50+'
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

const isBidActionStatus = (statusKey: AuctionLotStatusKey) =>
  statusKey === 'active' || statusKey === 'ending-soon'

const getArtworkImage = (artwork: ArtworkApiItem) =>
  artwork.thumbnailUrl ||
  artwork.images?.[0]?.secureUrl ||
  artwork.images?.[0]?.url ||
  'https://picsum.photos/seed/on-chain-auction/800/1000'

const formatRemainingStatus = (endTimestamp: number | null, statusKey: AuctionLotStatusKey) => {
  if (statusKey === 'closed') {
    return 'Closed'
  }

  if (!endTimestamp) {
    return 'Live now'
  }

  const remainingSeconds = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000))
  if (remainingSeconds <= 0) {
    return 'Closed'
  }

  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  }

  return `${Math.max(1, minutes)}m remaining`
}

const getStatusKeyFromAuction = (auction: AuctionContractState): AuctionLotStatusKey => {
  if (auction.state !== 0) {
    return 'closed'
  }

  const endTimestamp = Number(auction.endTime) * 1000
  const remainingSeconds = Math.ceil((endTimestamp - Date.now()) / 1000)

  if (!Number.isFinite(endTimestamp) || remainingSeconds <= 0) {
    return 'closed'
  }

  return remainingSeconds <= 3600 ? 'ending-soon' : 'active'
}

const mapArtworkToLot = (artwork: ArtworkApiItem, auction: AuctionContractState): AuctionLot | null => {
  if (!artwork.onChainAuctionId || !auction.exists) {
    return null
  }

  const statusKey = getStatusKeyFromAuction(auction)
  const endTimestamp = Number(auction.endTime) > 0 ? Number(auction.endTime) * 1000 : null
  const endsAt = endTimestamp ? new Date(endTimestamp).toISOString() : undefined

  return {
    artworkId: artwork.id,
    onChainOrderId: artwork.onChainAuctionId,
    title: artwork.title,
    bidValue: auction.highestBidEth,
    minBidIncrementValue: auction.minBidIncrementEth,
    categoryKey: 'all',
    status: formatRemainingStatus(endTimestamp, statusKey),
    statusKey,
    endsAt,
    endTimestamp,
    statusTone: auctionStatusTone[statusKey],
    imageSrc: getArtworkImage(artwork),
    imageAlt: `Artwork preview of ${artwork.title}${artwork.creatorName ? ` by ${artwork.creatorName}` : ''}`,
  }
}

const wait = (delayMs: number) => new Promise((resolve) => window.setTimeout(resolve, delayMs))

const isNotFoundApiError = (error: unknown) => (error as ApiError | undefined)?.status === 404

const LiveAuctionPage = () => {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [lots, setLots] = useState<AuctionLot[]>([])
  const [isLoadingLots, setIsLoadingLots] = useState(true)
  const [lotsError, setLotsError] = useState<string | null>(null)
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
  const [mobileMinInputValue, setMobileMinInputValue] = useState(`${MIN_ETH}`)
  const [mobileMaxInputValue, setMobileMaxInputValue] = useState(`${MAX_ETH}`)
  const [draftMinPrice, setDraftMinPrice] = useState(MIN_ETH)
  const [draftMaxPrice, setDraftMaxPrice] = useState(MAX_ETH)
  const [minInputValue, setMinInputValue] = useState(`${MIN_ETH}`)
  const [maxInputValue, setMaxInputValue] = useState(`${MAX_ETH}`)
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

  const loadAuctionLots = useCallback(async () => {
    setIsLoadingLots(true)
    setLotsError(null)

    try {
      const artworks = await artworkApis.listArtworks({
        status: 'IN_AUCTION',
        hasOnChainAuctionId: true,
        take: 100,
      })
      const auctionResults = await Promise.allSettled(
        artworks
          .filter((artwork) => Boolean(artwork.onChainAuctionId))
          .map(async (artwork) => {
            const auction = await readAuctionState(artwork.onChainAuctionId as string)
            return mapArtworkToLot(artwork, auction)
          }),
      )
      const nextLots = auctionResults
        .flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
        .sort((leftLot, rightLot) => {
          const priorityDelta =
            auctionStatusPriority[leftLot.statusKey] - auctionStatusPriority[rightLot.statusKey]

          if (priorityDelta !== 0) {
            return priorityDelta
          }

          if (leftLot.endTimestamp && rightLot.endTimestamp) {
            return leftLot.endTimestamp - rightLot.endTimestamp
          }

          return rightLot.bidValue - leftLot.bidValue
        })

      setLots(nextLots)
    } catch (error) {
      setLots([])
      setLotsError(error instanceof Error ? error.message : 'Unable to load on-chain auctions.')
    } finally {
      setIsLoadingLots(false)
    }
  }, [])

  useEffect(() => {
    void loadAuctionLots()
  }, [loadAuctionLots])

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
    setMobileMinInputValue(`${appliedMinPrice}`)
    setMobileMaxInputValue(`${appliedMaxPrice}`)
  }

  const applyDesktopPriceRange = () => {
    const nextMin = Math.min(parseEthInput(minInputValue, draftMinPrice), draftMaxPrice)
    const nextMax = Math.max(parseEthInput(maxInputValue, draftMaxPrice), nextMin)

    setCurrentPage(1)
    setDraftMinPrice(nextMin)
    setDraftMaxPrice(nextMax)
    setMinInputValue(`${nextMin}`)
    setMaxInputValue(`${nextMax}`)
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
    setMinInputValue(`${MIN_ETH}`)
    setMaxInputValue(`${MAX_ETH}`)
    setIsCategoryOpen(false)
    setIsStatusOpen(false)
    setIsPriceRangeOpen(false)
  }

  const resetMobileFilters = () => {
    setMobileSelectedCategory('all')
    setMobileSelectedStatus('all')
    setMobileAppliedMinPrice(MIN_ETH)
    setMobileAppliedMaxPrice(MAX_ETH)
    setMobileMinInputValue(`${MIN_ETH}`)
    setMobileMaxInputValue(`${MAX_ETH}`)
  }

  const applyMobileFilters = () => {
    const nextMin = Math.min(
      parseEthInput(mobileMinInputValue, mobileAppliedMinPrice),
      mobileAppliedMaxPrice,
    )
    const nextMax = Math.max(
      parseEthInput(mobileMaxInputValue, mobileAppliedMaxPrice),
      nextMin,
    )

    setMobileAppliedMinPrice(nextMin)
    setMobileAppliedMaxPrice(nextMax)
    setMobileMinInputValue(`${nextMin}`)
    setMobileMaxInputValue(`${nextMax}`)
    setCurrentPage(1)
    setSelectedCategory(mobileSelectedCategory)
    setSelectedStatus(mobileSelectedStatus)
    setAppliedMinPrice(nextMin)
    setAppliedMaxPrice(nextMax)
    setIsMobileFiltersOpen(false)
  }

  const filterLots = (
    category: AuctionCategoryKey,
    status: AuctionStatusKey,
    minPrice: number,
    maxPrice: number,
  ) =>
    lots.filter((lot) => {
      const matchesCategory = category === 'all' ? true : lot.categoryKey === category
      const matchesPrice = lot.bidValue >= minPrice && lot.bidValue <= maxPrice
      const matchesStatus = status === 'all' ? true : lot.statusKey === status

      return matchesCategory && matchesPrice && matchesStatus
    })

  const visibleLots = filterLots(
    selectedCategory,
    selectedStatus,
    appliedMinPrice,
    appliedMaxPrice,
  )
  const mobilePreviewLots = filterLots(
    mobileSelectedCategory,
    mobileSelectedStatus,
    mobileAppliedMinPrice,
    mobileAppliedMaxPrice,
  )
  const totalPages = Math.max(1, Math.ceil(visibleLots.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const displayedLots = visibleLots.slice(pageStart, pageStart + ITEMS_PER_PAGE)
  const effectiveViewMode = isMobileViewport ? 'list' : viewMode

  const resultsLabel = `${visibleLots.length} result${visibleLots.length === 1 ? '' : 's'}`
  const mobilePreviewLabel = `${mobilePreviewLots.length} result${mobilePreviewLots.length === 1 ? '' : 's'}`
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    appliedMinPrice !== MIN_ETH ||
    appliedMaxPrice !== MAX_ETH
  const footerLabel = hasActiveFilters
    ? `Page ${safeCurrentPage} of ${totalPages} • ${visibleLots.length} matching lots`
    : `Page ${safeCurrentPage} of ${totalPages} • ${lots.length} total lots`
  const emptyStateMessage = lotsError
    ? lotsError
    : isLoadingLots
      ? 'Loading on-chain auctions.'
      : hasActiveFilters
        ? 'No auctions match the selected filters.'
        : 'No live auctions are available right now.'

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

  const waitForIndexedOrder = async (onChainOrderId: string) => {
    for (let attempt = 0; attempt < 15; attempt += 1) {
      try {
        await orderApis.getOrderByOnChainId(onChainOrderId)
        return
      } catch (error) {
        if (!isNotFoundApiError(error)) {
          throw error
        }
      }

      await wait(2000)
    }

    throw new Error('Bid confirmed on-chain, but the order is still waiting for backend indexing.')
  }

  const handleSubmitBid = async (
    { lot, bidAmountEth }: SubmitBidInput,
    callbacks: { onTransactionHash: (transactionHash: string) => void },
  ) => {
    if (!isAuthenticated) {
      throw new Error('Sign in with the bidding wallet before placing an on-chain bid.')
    }

    const result = await placeBidOnAuction({
      orderId: lot.onChainOrderId,
      amountEth: bidAmountEth,
      onTransactionHash: callbacks.onTransactionHash,
    })

    await waitForIndexedOrder(lot.onChainOrderId)
    void loadAuctionLots()

    return result
  }

  return (
    <>
      <Metadata
        title="Live Auctions | Artium"
        description="A curated auction showcase for architectural masterworks and digital artifacts on Artium."
      />
      <div className="min-h-screen bg-white text-[#1a1c1c]" style={bodyFont}>
        <main className="mx-auto max-w-[1600px] px-6 pt-12 pb-20 md:px-12 md:pt-16">
          <header className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1
                className={`${spaceGrotesk.className} mb-6 text-5xl leading-none font-bold tracking-[0.04em] text-black uppercase md:text-7xl`}
              >
                Live Auctions
              </h1>
              <p className="text-lg leading-8 font-light text-[#444747]">
                A curated selection of architectural masterworks and digital artifacts. Each piece
                is verified via blockchain provenance, ensuring institutional-grade collectible
                security.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] tracking-[0.22em] text-black/40 uppercase">
              <span className="h-2 w-2 animate-pulse bg-black" />
              <span>Live updating from on-chain data</span>
            </div>
          </header>

          <section className="mb-12 flex flex-wrap items-center justify-between gap-8 border-y border-[#c4c7c7]/30 py-8">
            <div className="hidden flex-wrap items-center gap-10 md:flex">
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusOpen(false)
                    setIsPriceRangeOpen(false)
                    setIsCategoryOpen((prev) => !prev)
                  }}
                  className="group text-left"
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
                  <div className="absolute top-full left-0 z-20 mt-4 min-w-[280px] border border-[#c4c7c7]/40 bg-white p-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.18)]">
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
                          className={`block w-full px-3 py-3 text-left transition-colors ${
                            option.key === selectedCategory
                              ? 'bg-black text-white'
                              : 'text-black hover:bg-[#f5f5f5]'
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
                  className="group text-left"
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
                  <div className="absolute top-full left-0 z-20 mt-4 min-w-[280px] border border-[#c4c7c7]/40 bg-white p-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.18)]">
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
                          className={`block w-full px-3 py-3 text-left transition-colors ${
                            option.key === selectedStatus
                              ? 'bg-black text-white'
                              : 'text-black hover:bg-[#f5f5f5]'
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
                      setMinInputValue(`${appliedMinPrice}`)
                      setMaxInputValue(`${appliedMaxPrice}`)
                    }

                    setIsPriceRangeOpen((prev) => !prev)
                  }}
                  className="group text-left"
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
                    {formatEthDisplay(appliedMinPrice)} ETH - {formatEthDisplay(appliedMaxPrice)} ETH
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isPriceRangeOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isPriceRangeOpen ? (
                  <div className="absolute top-full left-0 z-20 mt-4 w-[min(92vw,360px)] border-2 border-black/70 bg-white px-4 py-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] sm:px-5 sm:py-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-extrabold tracking-[0.2em] text-[#8a8a8a] uppercase">
                        Range (ETH)
                      </span>
                      <span className="text-lg font-black text-black" style={bodyFont}>
                        {formatEthDisplay(draftMinPrice)} - {formatEthDisplay(draftMaxPrice)}
                      </span>
                    </div>

                    <div className="relative mb-6 px-2">
                      <div className="h-1 bg-black" />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 border-2 border-[#d9d9d9] bg-black shadow-[0_0_0_2px_white]"
                        style={{ left: `calc(${minPercent}% - 12px)` }}
                      />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 border-2 border-[#d9d9d9] bg-black shadow-[0_0_0_2px_white]"
                        style={{ left: `calc(${maxPercent}% - 12px)` }}
                      />
                      <input
                        type="range"
                        min={MIN_ETH}
                        max={MAX_ETH}
                        step={0.1}
                        value={draftMinPrice}
                        onChange={(event) => {
                          const nextValue = Math.min(Number(event.target.value), draftMaxPrice)
                          setDraftMinPrice(nextValue)
                          setMinInputValue(`${nextValue}`)
                        }}
                        className="absolute inset-x-0 top-1/2 z-10 h-6 -translate-y-1/2 cursor-pointer opacity-0"
                        aria-label="Minimum ETH range"
                      />
                      <input
                        type="range"
                        min={MIN_ETH}
                        max={MAX_ETH}
                        step={0.1}
                        value={draftMaxPrice}
                        onChange={(event) => {
                          const nextValue = Math.max(Number(event.target.value), draftMinPrice)
                          setDraftMaxPrice(nextValue)
                          setMaxInputValue(`${nextValue}`)
                        }}
                        className="absolute inset-x-0 top-1/2 z-20 h-6 -translate-y-1/2 cursor-pointer opacity-0"
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
                            const nextValue = Math.min(parseEthInput(minInputValue, draftMinPrice), draftMaxPrice)
                            setDraftMinPrice(nextValue)
                            setMinInputValue(`${nextValue}`)
                          }}
                          className="h-14 w-full border border-[#e5e7eb] px-4 text-[1.55rem] text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
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
                            const nextValue = Math.max(parseEthInput(maxInputValue, draftMaxPrice), draftMinPrice)
                            setDraftMaxPrice(nextValue)
                            setMaxInputValue(`${nextValue}`)
                          }}
                          className="h-14 w-full border border-[#e5e7eb] px-4 text-[1.55rem] text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={applyDesktopPriceRange}
                      className="w-full bg-black px-5 py-3.5 text-center text-[13px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-black/90"
                      style={headlineFont}
                    >
                      Apply Range
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-normal">
              <div className="hidden border border-[#c4c7c7]/30 bg-[#f7f7f7] p-1 md:flex">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={effectiveViewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-colors ${
                    effectiveViewMode === 'grid'
                      ? 'bg-black text-white'
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
                  className={`px-3 py-2 transition-colors ${
                    effectiveViewMode === 'list'
                      ? 'bg-black text-white'
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
                className={`hidden text-xs tracking-[0.22em] uppercase transition md:block ${
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
                className="border border-black px-4 py-2 text-xs tracking-[0.22em] text-black uppercase transition hover:bg-black hover:text-white md:hidden"
                style={headlineFont}
              >
                Open Filters
              </button>
            </div>
          </section>

          <section
            ref={resultsRef}
            className={
              effectiveViewMode === 'grid'
                ? 'grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid grid-cols-1 gap-5'
            }
          >
            {displayedLots.map((lot) => (
              <article
                key={lot.artworkId}
                className={`group border border-[#e5e7eb] bg-white p-3 transition-all duration-300 hover:border-black hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] md:p-4 ${
                  effectiveViewMode === 'list'
                    ? 'md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-stretch md:gap-5'
                    : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-[#f7f7f7] ${
                    effectiveViewMode === 'grid'
                      ? 'mb-5 aspect-[4/5] md:mb-6 md:aspect-[3/4]'
                      : 'mb-4 aspect-[5/4] md:mb-0 md:h-full md:w-full md:aspect-auto'
                  }`}
                >
                  <Image
                    src={lot.imageSrc}
                    alt={lot.imageAlt}
                    fill
                    sizes={
                      effectiveViewMode === 'grid'
                        ? '(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 768px) 44vw, 92vw'
                        : '(min-width: 768px) 280px, 92vw'
                    }
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 border border-[#c4c7c7]/30 bg-white/90 px-3 py-1 backdrop-blur-md">
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
                      ? 'min-w-0 flex flex-col justify-between md:py-2'
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
                        className={`font-bold uppercase text-black ${
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
                        className="mt-3 inline-block text-[11px] tracking-[0.2em] text-black/55 uppercase transition hover:text-black"
                        style={headlineFont}
                      >
                        View artwork details
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
                        : 'items-end justify-between pt-2'
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
                        {formatBidDisplay(lot.bidValue)}
                      </p>
                    </div>
                    {isBidActionStatus(lot.statusKey) ? (
                      <button
                        type="button"
                        onClick={() => openBidModal(lot)}
                        className="inline-flex w-fit items-center justify-center bg-black px-4 py-2 text-center text-[10px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-neutral-800"
                        style={headlineFont}
                      >
                        {lotActionLabel[lot.statusKey]}
                      </button>
                    ) : (
                      <Link
                        href={`/artworks/${lot.artworkId}`}
                        className="inline-flex w-fit items-center justify-center bg-black px-4 py-2 text-center text-[10px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-neutral-800"
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

          {visibleLots.length === 0 ? (
            <section className="mt-12 border border-[#c4c7c7]/30 bg-[#fafafa] px-6 py-10 text-center">
              <p className="text-sm tracking-[0.14em] text-[#747777] uppercase" style={headlineFont}>
                {emptyStateMessage}
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
                  className={`border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition ${
                    safeCurrentPage === 1
                      ? 'cursor-not-allowed border-black/15 text-black/25'
                      : 'border-black text-black hover:bg-black hover:text-white'
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
                      className={`min-w-10 border px-3 py-2 text-[11px] tracking-[0.18em] uppercase transition ${
                        isActive
                          ? 'border-black bg-black text-white'
                          : 'border-black/25 text-black hover:border-black hover:bg-black hover:text-white'
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
                  className={`border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition ${
                    safeCurrentPage === totalPages
                      ? 'cursor-not-allowed border-black/15 text-black/25'
                      : 'border-black text-black hover:bg-black hover:text-white'
                  }`}
                  style={headlineFont}
                >
                  Next
                </button>
              </div>
            ) : null}
            <p className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">
              {footerLabel}
            </p>
          </section>
        </main>

        {isMobileFiltersOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/45 md:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-auction-filters-title"
              className="ml-auto flex h-full w-full max-w-md flex-col bg-white"
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
                    className="border border-black/15 px-3 py-2 text-[11px] font-bold tracking-[0.18em] text-black uppercase transition hover:border-black hover:bg-black hover:text-white"
                    style={headlineFont}
                  >
                    Clear
                  </button>
                  <button
                    ref={mobileFilterCloseButtonRef}
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="border border-black bg-black px-3 py-2 text-[11px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-neutral-800"
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
                    <span className="text-[11px] tracking-[0.14em] text-black uppercase" style={headlineFont}>
                      {mobileSelectedCategoryOption.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setMobileSelectedCategory(option.key)}
                        className={`block w-full border px-4 py-3 text-left transition-colors ${
                          option.key === mobileSelectedCategory
                            ? 'border-black bg-black text-white'
                            : 'border-[#d7dada] text-black hover:border-black'
                        }`}
                      >
                        <span className="block text-sm font-bold uppercase" style={headlineFont}>
                          {option.label}
                        </span>
                        <span
                          className={`mt-1 block text-[11px] tracking-[0.08em] uppercase ${
                            option.key === mobileSelectedCategory ? 'text-white/70' : 'text-[#747777]'
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
                    <span className="text-[11px] tracking-[0.14em] text-black uppercase" style={headlineFont}>
                      {mobileSelectedStatusOption.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setMobileSelectedStatus(option.key)}
                        className={`block w-full border px-4 py-3 text-left transition-colors ${
                          option.key === mobileSelectedStatus
                            ? 'border-black bg-black text-white'
                            : 'border-[#d7dada] text-black hover:border-black'
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
                      {formatEthDisplay(mobileAppliedMinPrice)} - {formatEthDisplay(mobileAppliedMaxPrice)} ETH
                    </span>
                  </div>

                  <div className="relative mb-6 px-2">
                    <div className="h-1 bg-black" />
                    <div
                      className="absolute top-1/2 h-6 w-6 -translate-y-1/2 border-2 border-[#d9d9d9] bg-black shadow-[0_0_0_2px_white]"
                      style={{ left: `calc(${mobileMinPercent}% - 12px)` }}
                    />
                    <div
                      className="absolute top-1/2 h-6 w-6 -translate-y-1/2 border-2 border-[#d9d9d9] bg-black shadow-[0_0_0_2px_white]"
                      style={{ left: `calc(${mobileMaxPercent}% - 12px)` }}
                    />
                    <input
                      type="range"
                      min={MIN_ETH}
                      max={MAX_ETH}
                      step={0.1}
                      value={mobileAppliedMinPrice}
                      onChange={(event) => {
                        const nextValue = Math.min(Number(event.target.value), mobileAppliedMaxPrice)
                        setMobileAppliedMinPrice(nextValue)
                        setMobileMinInputValue(`${nextValue}`)
                      }}
                      className="absolute inset-x-0 top-1/2 z-10 h-6 -translate-y-1/2 cursor-pointer opacity-0"
                      aria-label="Mobile minimum ETH range"
                    />
                    <input
                      type="range"
                      min={MIN_ETH}
                      max={MAX_ETH}
                      step={0.1}
                      value={mobileAppliedMaxPrice}
                      onChange={(event) => {
                        const nextValue = Math.max(Number(event.target.value), mobileAppliedMinPrice)
                        setMobileAppliedMaxPrice(nextValue)
                        setMobileMaxInputValue(`${nextValue}`)
                      }}
                      className="absolute inset-x-0 top-1/2 z-20 h-6 -translate-y-1/2 cursor-pointer opacity-0"
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
                          setMobileMinInputValue(`${nextValue}`)
                        }}
                        className="h-14 w-full border border-[#e5e7eb] px-4 text-[1.35rem] text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
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
                          setMobileMaxInputValue(`${nextValue}`)
                        }}
                        className="h-14 w-full border border-[#e5e7eb] px-4 text-[1.35rem] text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div className="border-t border-[#c4c7c7]/30 px-6 py-5">
                <button
                  type="button"
                  onClick={applyMobileFilters}
                  className="w-full bg-black px-5 py-4 text-center text-[13px] font-bold tracking-[0.18em] text-white uppercase transition hover:bg-black/90"
                  style={headlineFont}
                >
                  Apply Filters ({mobilePreviewLots.length})
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <BidEditingModal
          key={selectedBidLot?.artworkId ?? 'bid-modal-closed'}
          lot={selectedBidLot}
          isOpen={Boolean(selectedBidLot)}
          onClose={() => setSelectedBidLot(null)}
          onSubmitBid={handleSubmitBid}
          onViewOrderStatus={(payload) => {
            void router.push(`/orders/on-chain/${encodeURIComponent(payload.lot.onChainOrderId)}`)
          }}
        />

      </div>
    </>
  )
}

export { LiveAuctionPage }

export default LiveAuctionPage
