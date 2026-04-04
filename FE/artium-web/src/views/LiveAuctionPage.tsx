import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { ChevronDown, Grid2X2, LayoutList, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { mockArtworks } from '@domains/discover/mock/mockArtworks'
import { Metadata } from '@/components/SEO/Metadata'

type AuctionLot = {
  artworkId: string
  title: string
  bid: string
  categoryKey: AuctionCategoryKey
  status: string
  statusKey: AuctionStatusKey
  statusTone: 'live' | 'muted'
  imageSrc: string
  imageAlt: string
}

type AuctionCategoryKey = 'all' | 'architectural' | 'sculpture' | 'digital' | 'installation'

type AuctionStatusKey =
  | 'all'
  | 'active'
  | 'ending-soon'
  | 'closed'
  | 'newly-listed'
  | 'paused'

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

const MIN_ETH = 0.5
const MAX_ETH = 50
const ITEMS_PER_PAGE = 24

const lotCategoryCycle: AuctionCategoryKey[] = [
  'architectural',
  'sculpture',
  'digital',
  'installation',
]

const lotStatusCycle: Array<Pick<AuctionLot, 'status' | 'statusKey' | 'statusTone'>> = [
  { status: '2h 45m remaining', statusKey: 'active', statusTone: 'live' },
  { status: 'Ending Soon', statusKey: 'ending-soon', statusTone: 'live' },
  { status: '12h 10m remaining', statusKey: 'active', statusTone: 'muted' },
  { status: 'Just Listed', statusKey: 'newly-listed', statusTone: 'muted' },
  { status: 'Reserve Not Met', statusKey: 'paused', statusTone: 'muted' },
  { status: 'Closed', statusKey: 'closed', statusTone: 'muted' },
  { status: '45m remaining', statusKey: 'ending-soon', statusTone: 'live' },
  { status: '8h 30m remaining', statusKey: 'active', statusTone: 'live' },
]

const formatMockBid = (price: number) => {
  const bidValue = Math.min(MAX_ETH, Math.max(MIN_ETH, Number((price / 100).toFixed(1))))
  return `${Number.isInteger(bidValue) ? bidValue.toFixed(0) : bidValue.toFixed(1)} ETH`
}

const lots: AuctionLot[] = mockArtworks.map((artwork, index) => {
  const status = lotStatusCycle[index % lotStatusCycle.length]

  return {
    artworkId: artwork.id,
    title: artwork.title,
    bid: formatMockBid(artwork.price),
    categoryKey: lotCategoryCycle[index % lotCategoryCycle.length],
    status: status.status,
    statusKey: status.statusKey,
    statusTone: status.statusTone,
    imageSrc: artwork.imageMedium,
    imageAlt: `Artwork preview of ${artwork.title} by ${artwork.creator.fullName}`,
  }
})

const statusBadgeClass: Record<Exclude<AuctionStatusKey, 'all'>, string> = {
  active: 'bg-[#16a34a]',
  'ending-soon': 'bg-[#dc2626]',
  closed: 'bg-[#9ca3af]',
  'newly-listed': 'bg-[#2563eb]',
  paused: 'bg-[#eab308]',
}

const lotActionLabel: Record<Exclude<AuctionStatusKey, 'all'>, string> = {
  active: 'Place Bid',
  'ending-soon': 'Place Bid',
  'newly-listed': 'Enter Auction',
  paused: 'View Artwork',
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

const LiveAuctionPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
  const [currentPage, setCurrentPage] = useState(1)
  const categoryRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const priceRangeRef = useRef<HTMLDivElement>(null)
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
      const bidValue = Number.parseFloat(lot.bid.replace(' ETH', ''))
      const matchesCategory = category === 'all' ? true : lot.categoryKey === category
      const matchesPrice = bidValue >= minPrice && bidValue <= maxPrice
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
  const emptyStateMessage = hasActiveFilters
    ? 'No auctions match the selected filters.'
    : 'No live auctions are available right now.'

  return (
    <>
      <Metadata
        title="Live Auctions | Artium"
        description="A curated auction showcase for architectural masterworks and digital artifacts on Artium."
      />
      <div className="min-h-screen bg-white text-[#1a1c1c]" style={bodyFont}>
        <main className="mx-auto max-w-[1600px] px-6 pt-32 pb-20 md:px-12">
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
              <div className="flex border border-[#c4c7c7]/30 bg-[#f7f7f7] p-1">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                  }`}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'list' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
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
              <button
                ref={mobileFilterButtonRef}
                type="button"
                onClick={openMobileFilters}
                className="border border-black px-4 py-2 text-xs tracking-[0.22em] text-black uppercase transition hover:bg-black hover:text-white md:hidden"
                style={headlineFont}
              >
                Filter Results ({visibleLots.length})
              </button>
            </div>
          </section>

          <section
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid grid-cols-1 gap-6'
            }
          >
            {displayedLots.map((lot) => (
              <article
                key={lot.title}
                className={`group border border-[#e5e7eb] bg-white p-4 transition-all duration-300 hover:border-black hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] ${
                  viewMode === 'list'
                    ? 'md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-stretch md:gap-6'
                    : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-[#f7f7f7] ${
                    viewMode === 'grid'
                      ? 'mb-6 aspect-[3/4]'
                      : 'mb-5 aspect-[4/3] md:mb-0 md:h-full md:w-full md:aspect-auto'
                  }`}
                >
                  <Image
                    src={lot.imageSrc}
                    alt={lot.imageAlt}
                    fill
                    sizes={
                      viewMode === 'grid'
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
                    viewMode === 'list' ? 'min-w-0 flex flex-col justify-between md:py-2' : ''
                  }`}
                >
                  <div
                    className={`flex items-start justify-between gap-3 ${
                      viewMode === 'list' ? 'border-b border-[#c4c7c7]/30 pb-4' : ''
                    }`}
                  >
                    <div>
                      <h2
                        className={`font-bold uppercase text-black ${
                          viewMode === 'grid'
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
                      {viewMode === 'list' ? (
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
                      viewMode === 'grid'
                        ? 'items-end justify-between border-t pt-4'
                        : 'flex-col pt-2 sm:flex-row sm:items-end sm:justify-between'
                    }`}
                  >
                    <div>
                      <p className="mb-1 text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                        Current Bid
                      </p>
                      <p
                        className={`font-bold text-black uppercase ${
                          viewMode === 'grid' ? 'text-lg' : 'text-2xl md:text-3xl'
                        }`}
                        style={headlineFont}
                      >
                        {lot.bid}
                      </p>
                    </div>
                    <Link
                      href={`/artworks/${lot.artworkId}`}
                      className="bg-black px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-neutral-800"
                    >
                      {lotActionLabel[lot.statusKey]}
                    </Link>
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
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
                      onClick={() => setCurrentPage(pageNumber)}
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
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
                    className="text-xs tracking-[0.22em] text-black uppercase transition hover:text-black/60"
                    style={headlineFont}
                  >
                    Clear
                  </button>
                  <button
                    ref={mobileFilterCloseButtonRef}
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="text-xs tracking-[0.24em] text-black uppercase"
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

        <footer className="border-t border-[#c4c7c7]/30 bg-white px-6 py-10 md:px-12">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="text-lg font-bold text-black uppercase" style={headlineFont}>
              Artium
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['Privacy', 'Terms', 'Provenance', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs tracking-[0.22em] text-[#747777] uppercase transition-colors hover:text-black"
                >
                  {item}
                </Link>
              ))}
            </div>
            <p className="text-center text-[10px] tracking-[0.22em] text-[#747777] uppercase">
              © 2026 Artium. Architectural curation on-chain.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

export { LiveAuctionPage }

export default LiveAuctionPage
