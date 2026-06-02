import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  AlertCircle,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gavel,
  ImageOff,
  ListChecks,
  Lock,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import auctionApis, {
  type SellerAuctionArtworkCandidate,
  type SellerAuctionStartStatusResponse,
} from '@shared/apis/auctionApis'
import { mapAuctionReadToLot } from '../mappers/auctionLotMapper'
import type { AuctionLot } from '../types'
import {
  SellerAuctionDraftBadge,
  SellerAuctionStartStatusShell,
  SellerAuctionTermsForm,
  SellerAuctionTermsPreview,
  SellerAuctionWalletReadiness,
} from '../components'
import { useSellerAuctionStart } from '../hooks/useSellerAuctionStart'
import { useSellerAuctionArtworkCandidates } from '../hooks/useSellerAuctionArtworkCandidates'
import { useSellerAuctionTermsDraftStatus } from '../hooks/useSellerAuctionTermsDraftStatus'
import { submitAuctionFinalizeTransaction } from '../services/auctionFinalizeWallet'
import { submitSellerAuctionStartTransaction } from '../services/auctionStartWallet'
import {
  DEFAULT_SELLER_AUCTION_TERMS,
  SELLER_AUCTION_DURATION_PRESETS,
  SELLER_AUCTION_CUSTOM_DURATION_UNITS,
  getAuctionDurationSeconds,
  validateSellerAuctionTerms,
  type SellerAuctionCustomDurationUnit,
  type SellerAuctionTermsFormValues,
} from '../validations/sellerAuctionTerms.schema'
import {
  loadSellerAuctionTermsDraft,
  saveSellerAuctionTermsDraft,
} from '../utils'
import {
  getStoredAuctionBidHistory,
  type StoredAuctionBid,
} from '../utils/bidTrackingStorage'

const FINALIZATION_PENDING_STORAGE_KEY = 'artium.pendingAuctionFinalizations'
const FINALIZATION_PENDING_TTL_MS = 60 * 60 * 1000

type PendingAuctionFinalization = {
  txHash: string
  submittedAt: string
}

const policyCards = [
  {
    title: 'Contract-backed terms',
    body: 'Reserve policy, increment, and duration are previewed before wallet activation.',
    icon: ShieldCheck,
  },
  {
    title: 'Fees and lock after activation',
    body: 'Seller fees follow current policy. Economics lock once the auction is activated.',
    icon: Lock,
  },
  {
    title: 'Sepolia expectations',
    body: 'Sepolia is a test network. Confirm wallet and network details before activation.',
    icon: AlertCircle,
  },
] as const

const CandidateImage = ({
  candidate,
  className,
}: {
  candidate: SellerAuctionArtworkCandidate
  className?: string
}) => {
  if (!candidate.thumbnailUrl) {
    return (
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-[24px] bg-slate-100 text-slate-400 ${className ?? ''}`}
      >
        <ImageOff className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-[24px] ${className ?? ''}`}
    >
      <Image
        src={candidate.thumbnailUrl}
        alt={candidate.title}
        fill
        unoptimized
        className="object-cover"
        sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 90vw"
      />
    </div>
  )
}

const CandidateCard = ({
  candidate,
  isSelected,
  onSelect,
}: {
  candidate: SellerAuctionArtworkCandidate
  isSelected?: boolean
  onSelect?: () => void
}) => {
  const isBlocked = !candidate.isEligible
  const hasDraft = useSellerAuctionTermsDraftStatus(candidate.artworkId)

  return (
    <article
      className={`relative flex h-full flex-col rounded-[28px] border bg-white p-3 shadow-sm transition ${
        isSelected
          ? 'border-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.12)]'
          : 'border-slate-200'
      } ${isBlocked ? 'bg-slate-50' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
    >
      {hasDraft ? <SellerAuctionDraftBadge className="absolute top-5 right-5 z-10" /> : null}
      <CandidateImage candidate={candidate} />
      <div className="flex flex-1 flex-col gap-4 px-2 pt-5 pb-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            {candidate.status}
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl leading-tight font-semibold text-slate-900">
            {candidate.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {candidate.creatorName || 'Unknown creator'}
          </p>
        </div>

        {isBlocked ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {candidate.recoveryActions.slice(0, 2).map((action) => (
                <span
                  key={action.reasonCode}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {action.message}
                </span>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              {candidate.recoveryActions.map((action) => (
                <li key={action.reasonCode} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{action.actionLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isSelected ? 'Selected for auction' : 'Ownership and auction readiness checks passed.'}
          </p>
        )}

        <div className="mt-auto">
          <Button
            type="button"
            disabled={isBlocked}
            onClick={onSelect}
            className={`w-full ${
              isBlocked
                ? 'bg-slate-200 text-slate-500'
                : isSelected
                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            {isBlocked
              ? 'Unavailable for auction'
              : isSelected
                ? 'Unselect artwork'
                : 'Select artwork'}
          </Button>
        </div>
      </div>
    </article>
  )
}

const LoadingGrid = () => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2].map((item) => (
      <div key={item} className="rounded-[28px] border border-slate-200 bg-white p-3">
        <div className="aspect-[4/3] animate-pulse rounded-[24px] bg-slate-100" />
        <div className="space-y-3 px-2 pt-5 pb-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-7 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
)

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const formatEth = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(4).replace(/\.?0+$/, '')} ETH`
    : '0 ETH'

const shortenHash = (value: string) => `${value.slice(0, 10)}...${value.slice(-6)}`

const readPendingFinalizations = (): Record<string, PendingAuctionFinalization> => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(FINALIZATION_PENDING_STORAGE_KEY) ?? '{}',
    ) as Record<string, PendingAuctionFinalization>
    const now = Date.now()

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => {
        const submittedAtMs = new Date(value.submittedAt).getTime()

        return (
          value.txHash &&
          Number.isFinite(submittedAtMs) &&
          now - submittedAtMs < FINALIZATION_PENDING_TTL_MS
        )
      }),
    )
  } catch {
    return {}
  }
}

const writePendingFinalizations = (value: Record<string, PendingAuctionFinalization>) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(FINALIZATION_PENDING_STORAGE_KEY, JSON.stringify(value))
}

const getLifecycleLabel = (status?: SellerAuctionStartStatusResponse['status']) => {
  switch (status) {
    case 'auction_active':
      return 'Auction active'
    case 'pending_start':
      return 'Start pending'
    case 'retry_available':
      return 'Retry available'
    case 'start_failed':
      return 'Start failed'
    default:
      return 'Order projection'
  }
}

type SellerAuctionWorkspaceTab = 'detail' | 'history' | 'create'

type SellerAuctionOverviewRow = {
  id: string
  title: string
  creatorName?: string | null
  thumbnailUrl?: string | null
  artworkId: string
  auction?: AuctionLot
  startStatus?: SellerAuctionStartStatusResponse
}

type BidHistoryStatusFilter = 'all' | StoredAuctionBid['status']
type BidHistoryDateFilter = 'all' | '7' | '30' | '90'
type BidHistorySortKey = 'newest' | 'oldest' | 'highest' | 'lowest'

const bidHistoryStatusOptions: Array<{ key: BidHistoryStatusFilter; label: string }> = [
  { key: 'all', label: 'All bids' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
]

const getBidTransactionUrl = (transactionHash: string) =>
  `${WALLET_TARGET_CHAIN.blockExplorerUrl.replace(/\/$/, '')}/tx/${encodeURIComponent(
    transactionHash,
  )}`

const getRowStatusTone = (row: SellerAuctionOverviewRow) => {
  if (row.auction?.orderStatus && row.auction.statusKey === 'closed') {
    return 'border-slate-200 bg-slate-100 text-slate-700'
  }
  if (row.auction) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (row.startStatus?.status === 'start_failed') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  if (row.startStatus?.status === 'retry_available') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

const canResetStartAttempt = (row: SellerAuctionOverviewRow) =>
  Boolean(
    row.startStatus &&
    !row.auction &&
    row.startStatus.status === 'pending_start' &&
    row.startStatus.walletActionRequired &&
    !row.startStatus.txHash,
  )

const canFinalizeAuction = (row: SellerAuctionOverviewRow) =>
  Boolean(
    row.auction &&
    row.auction.statusKey === 'closed' &&
    row.auction.orderStatus === 'auction_active' &&
    row.auction.onChainOrderId &&
    row.auction.contractAddress,
  )

const isAuctionSettledOnChain = (auction: AuctionLot) =>
  (Boolean(auction.orderStatus) && auction.orderStatus !== 'auction_active') ||
  (typeof auction.escrowState === 'number' && auction.escrowState > 0)

const hasAuctionBid = (auction?: AuctionLot | null) => Boolean(auction && auction.bidValue > 0)

const BidHistoryPanel = () => {
  const [history, setHistory] = useState<StoredAuctionBid[]>(() => getStoredAuctionBidHistory())
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BidHistoryStatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<BidHistoryDateFilter>('all')
  const [sortKey, setSortKey] = useState<BidHistorySortKey>('newest')
  const latestHistoryTimestampMs = useMemo(
    () =>
      history.reduce((latestTimestamp, bid) => {
        const updatedAtMs = new Date(bid.updatedAt).getTime()

        return Number.isFinite(updatedAtMs)
          ? Math.max(latestTimestamp, updatedAtMs)
          : latestTimestamp
      }, 0),
    [history],
  )

  const refreshHistory = () => {
    setHistory(getStoredAuctionBidHistory())
  }

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const cutoffMs =
      dateFilter === 'all' || latestHistoryTimestampMs === 0
        ? null
        : latestHistoryTimestampMs - Number(dateFilter) * 24 * 60 * 60 * 1000

    return history
      .filter((bid) => {
        const updatedAtMs = new Date(bid.updatedAt).getTime()
        const matchesQuery =
          !normalizedQuery ||
          [bid.title, bid.auctionId, bid.artworkId, bid.transactionHash, bid.walletAddress].some(
            (value) => value.toLowerCase().includes(normalizedQuery),
          )
        const matchesStatus = statusFilter === 'all' || bid.status === statusFilter
        const matchesDate =
          cutoffMs === null || (Number.isFinite(updatedAtMs) && updatedAtMs >= cutoffMs)

        return matchesQuery && matchesStatus && matchesDate
      })
      .sort((left, right) => {
        if (sortKey === 'highest') {
          return right.bidAmountEth - left.bidAmountEth
        }
        if (sortKey === 'lowest') {
          return left.bidAmountEth - right.bidAmountEth
        }

        const leftMs = new Date(left.updatedAt).getTime()
        const rightMs = new Date(right.updatedAt).getTime()

        return sortKey === 'oldest' ? leftMs - rightMs : rightMs - leftMs
      })
  }, [dateFilter, history, latestHistoryTimestampMs, query, sortKey, statusFilter])

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== 'all' ||
    dateFilter !== 'all' ||
    sortKey !== 'newest'
  const confirmedCount = history.filter((bid) => bid.status === 'confirmed').length
  const pendingCount = history.filter((bid) => bid.status === 'pending').length

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
    setDateFilter('all')
    setSortKey('newest')
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col gap-3 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Bid history
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your tracked bids</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review bids submitted from this browser, filter by status or timeframe, and reopen
            transaction records for verification.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={refreshHistory}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Tracked bids', value: history.length },
          { label: 'Confirmed', value: confirmedCount },
          { label: 'Pending sync', value: pendingCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_170px_auto] xl:items-end">
          <label className="block">
            <span className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
              Search
            </span>
            <div className="mt-2 flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 focus-within:border-slate-900">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Artwork, order, wallet, or tx"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
              Timeframe
            </span>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as BidHistoryDateFilter)}
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="all">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
              Sort
            </span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as BidHistorySortKey)}
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest bid</option>
              <option value="lowest">Lowest bid</option>
            </select>
          </label>

          <Button
            type="button"
            variant="outline"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
            className="h-11 w-full self-end xl:w-auto"
          >
            Clear
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {bidHistoryStatusOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setStatusFilter(option.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === option.key
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
            {filteredHistory.length} shown
          </p>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <Gavel className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">
            {history.length === 0 ? 'No tracked bids yet' : 'No bids match these filters'}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {history.length === 0
              ? 'Bids submitted from this browser will appear here after wallet submission.'
              : 'Clear or adjust filters to review the rest of your local bid history.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[minmax(280px,1.4fr)_130px_120px_170px_140px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                <span>Auction</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Updated</span>
                <span>Record</span>
              </div>
              <div className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                {filteredHistory.map((bid) => (
                  <article
                    key={`${bid.auctionId}-${bid.transactionHash}`}
                    className="grid grid-cols-[minmax(280px,1.4fr)_130px_120px_170px_140px] items-center gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {bid.imageSrc ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          <Image
                            src={bid.imageSrc}
                            alt={bid.imageAlt}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {bid.title}
                        </p>
                        <p className="mt-1 truncate font-mono text-xs text-slate-500">
                          {bid.auctionId}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatEth(bid.bidAmountEth)}
                    </span>
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                        bid.status === 'confirmed'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {bid.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                    <span className="text-sm text-slate-500">{formatDateTime(bid.updatedAt)}</span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 border-slate-200 text-slate-900"
                        onClick={() => {
                          window.open(
                            getBidTransactionUrl(bid.transactionHash),
                            '_blank',
                            'noreferrer',
                          )
                        }}
                      >
                        Tx {shortenHash(bid.transactionHash)}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const SellerAuctionManagerPanel = () => {
  const router = useRouter()
  const [rows, setRows] = useState<SellerAuctionOverviewRow[]>([])
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [resettingAttemptId, setResettingAttemptId] = useState<string | null>(null)
  const [finalizingAuctionId, setFinalizingAuctionId] = useState<string | null>(null)
  const [pendingFinalizations, setPendingFinalizations] = useState<
    Record<string, PendingAuctionFinalization>
  >({})

  useEffect(() => {
    const nextPending = readPendingFinalizations()
    setPendingFinalizations(nextPending)
    writePendingFinalizations(nextPending)
  }, [])

  const updatePendingFinalizations = useCallback(
    (
      updater: (
        current: Record<string, PendingAuctionFinalization>,
      ) => Record<string, PendingAuctionFinalization>,
    ) => {
      setPendingFinalizations((current) => {
        const next = updater(current)
        writePendingFinalizations(next)
        return next
      })
    },
    [],
  )

  const loadOverview = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true)
      }
      setError(null)

      try {
        const [auctionResponse, startStatuses] = await Promise.all([
          auctionApis.getSellerAuctions({ take: 50 }),
          auctionApis.getSellerAuctionStartStatuses(),
        ])
        const sellerAuctions = auctionResponse.data.map(mapAuctionReadToLot)
        const auctionsByOrderId = new Map(
          sellerAuctions.map((auction) => [auction.onChainOrderId, auction]),
        )
        const auctionsByArtworkId = new Map(
          sellerAuctions.map((auction) => [auction.artworkId, auction]),
        )
        const nextRows: SellerAuctionOverviewRow[] = []
        const usedAuctionIds = new Set<string>()

        startStatuses.forEach((status) => {
          const auction =
            auctionsByOrderId.get(status.orderId) ?? auctionsByArtworkId.get(status.artworkId)
          if (auction?.auctionId) {
            usedAuctionIds.add(auction.auctionId)
          }

          nextRows.push({
            id: status.attemptId,
            title: status.artworkTitle,
            creatorName: status.creatorName,
            thumbnailUrl: status.thumbnailUrl,
            artworkId: status.artworkId,
            startStatus: status,
            auction,
          })
        })

        sellerAuctions.forEach((auction) => {
          if (usedAuctionIds.has(auction.auctionId)) {
            return
          }

          nextRows.push({
            id: auction.auctionId,
            title: auction.title,
            creatorName: auction.sellerWallet,
            thumbnailUrl: auction.imageSrc,
            artworkId: auction.artworkId,
            auction,
          })
        })

        updatePendingFinalizations((current) => {
          const next = { ...current }
          let changed = false

          sellerAuctions.forEach((auction) => {
            if (isAuctionSettledOnChain(auction) && next[auction.onChainOrderId]) {
              delete next[auction.onChainOrderId]
              changed = true
            }
          })

          return changed ? next : current
        })
        setRows(nextRows)
        setSelectedRowId((currentId) => currentId ?? nextRows[0]?.id ?? null)
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : 'Unable to load seller auctions.',
        )
      } finally {
        if (!options?.silent) {
          setIsLoading(false)
        }
      }
    },
    [updatePendingFinalizations],
  )

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (Object.keys(pendingFinalizations).length === 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      void loadOverview({ silent: true })
    }, 15_000)

    return () => window.clearInterval(intervalId)
  }, [loadOverview, pendingFinalizations])

  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? rows[0] ?? null
  const selectedFinalization = selectedRow?.auction
    ? pendingFinalizations[selectedRow.auction.onChainOrderId]
    : null

  const handleResetStartAttempt = async (row: SellerAuctionOverviewRow) => {
    if (!row.startStatus || !canResetStartAttempt(row)) {
      return
    }

    setResettingAttemptId(row.startStatus.attemptId)
    setError(null)

    try {
      await auctionApis.resetSellerAuctionStartAttempt(row.startStatus.attemptId)
      setSelectedRowId(null)
      await loadOverview()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to reset this auction start attempt.',
      )
    } finally {
      setResettingAttemptId(null)
    }
  }

  const handleFinalizeAuction = async (row: SellerAuctionOverviewRow) => {
    if (!row.auction || !canFinalizeAuction(row)) {
      return
    }
    if (pendingFinalizations[row.auction.onChainOrderId]) {
      setActionMessage('Auction finalization is already pending. Wait for chain sync or refresh.')
      return
    }

    setFinalizingAuctionId(row.auction.auctionId)
    setError(null)
    setActionMessage(null)

    try {
      const result = await submitAuctionFinalizeTransaction({
        onChainOrderId: row.auction.onChainOrderId,
        contractAddress: row.auction.contractAddress!,
        expectedSellerWallet: row.auction.sellerWallet,
      })
      updatePendingFinalizations((current) => ({
        ...current,
        [row.auction!.onChainOrderId]: {
          txHash: result.txHash,
          submittedAt: new Date().toISOString(),
        },
      }))
      setActionMessage(
        `Auction finalization submitted (${shortenHash(result.txHash)}). Waiting for chain sync.`,
      )
      await loadOverview()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Unable to finalize this auction.',
      )
    } finally {
      setFinalizingAuctionId(null)
    }
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col gap-3 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Auction detail
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your auction activity</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review active order projections, wallet start attempts, bids, and recovery actions for
            auctions created from this seller account.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadOverview()}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <Gavel className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">No seller auctions yet</h3>
          <p className="mt-2 text-slate-500">
            Start from the Create Auction tab when one of your artworks is ready.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[minmax(0,1.5fr)_140px_140px_120px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
              <span>Auction</span>
              <span>Status</span>
              <span>Bid</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-slate-100">
              {rows.map((row) => {
                const isSelected = selectedRow?.id === row.id
                const statusLabel = row.auction
                  ? row.auction.status
                  : getLifecycleLabel(row.startStatus?.status)

                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedRowId(row.id)}
                    className={`grid w-full grid-cols-1 gap-4 px-5 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[minmax(0,1.5fr)_140px_140px_120px] md:items-center ${
                      isSelected ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {row.thumbnailUrl ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          <Image
                            src={row.thumbnailUrl}
                            alt={row.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {row.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {row.auction?.onChainOrderId ?? row.startStatus?.orderId ?? 'No order id'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getRowStatusTone(row)}`}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {row.auction ? formatEth(row.auction.bidValue) : 'No bids'}
                    </span>
                    <span className="text-sm font-medium text-slate-500">View detail</span>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedRow ? (
            <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Full detail
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedRow.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRowStatusTone(selectedRow)}`}
                >
                  {selectedRow.auction
                    ? selectedRow.auction.status
                    : getLifecycleLabel(selectedRow.startStatus?.status)}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ListChecks className="h-4 w-4" />
                    <span className="text-xs font-semibold tracking-[0.12em] uppercase">
                      Order projection
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Order number</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedRow.auction?.orderNumber ?? 'Not created'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Order status</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedRow.auction?.orderStatus ?? 'No order projection'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Payment status</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedRow.auction?.paymentStatus ?? 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Gavel className="h-4 w-4" />
                    <span className="text-xs font-semibold tracking-[0.12em] uppercase">
                      Bid info
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Current bid</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedRow.auction
                          ? formatEth(selectedRow.auction.bidValue)
                          : 'No bids yet'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Minimum next bid</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedRow.auction
                          ? formatEth(selectedRow.auction.minimumNextBidEth)
                          : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Highest bidder</dt>
                      <dd className="max-w-[220px] truncate font-mono text-xs text-slate-900">
                        {selectedRow.auction?.highestBidder ?? 'No bidder'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-semibold tracking-[0.12em] uppercase">
                      Timeline
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Ends at</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {formatDateTime(selectedRow.auction?.endsAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Activated at</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {formatDateTime(selectedRow.startStatus?.activatedAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Updated at</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {formatDateTime(selectedRow.startStatus?.updatedAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {canFinalizeAuction(selectedRow) && selectedRow.auction ? (
                  <Button
                    type="button"
                    className="bg-slate-900 text-white hover:bg-slate-700"
                    disabled={
                      finalizingAuctionId === selectedRow.auction.auctionId ||
                      Boolean(selectedFinalization)
                    }
                    onClick={() => void handleFinalizeAuction(selectedRow)}
                  >
                    <Gavel className="h-4 w-4" />
                    {selectedFinalization
                      ? `Finalization pending (${shortenHash(selectedFinalization.txHash)})`
                      : finalizingAuctionId === selectedRow.auction.auctionId
                        ? 'Opening MetaMask...'
                        : 'Finalize auction'}
                  </Button>
                ) : null}
                {selectedRow.auction?.orderProjectionId ? (
                  <Button
                    type="button"
                    className="bg-slate-900 text-white hover:bg-slate-700"
                    onClick={() =>
                      void router.push({
                        pathname: `/orders/${selectedRow.auction!.orderProjectionId}`,
                        query: { scope: 'seller', invoice: '1' },
                      })
                    }
                  >
                    <ListChecks className="h-4 w-4" />
                    Manage fulfillment
                  </Button>
                ) : null}
                {hasAuctionBid(selectedRow.auction) ? (
                  <Button
                    type="button"
                    variant={selectedRow.auction?.orderProjectionId ? 'outline' : 'default'}
                    className={
                      selectedRow.auction?.orderProjectionId
                        ? 'border-slate-200 text-slate-900'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }
                    onClick={() =>
                      void router.push(
                        `/auction/bids/${encodeURIComponent(selectedRow.auction!.onChainOrderId)}`,
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    View newest bid
                  </Button>
                ) : null}
                {canResetStartAttempt(selectedRow) ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={resettingAttemptId === selectedRow.startStatus?.attemptId}
                    onClick={() => void handleResetStartAttempt(selectedRow)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {resettingAttemptId === selectedRow.startStatus?.attemptId
                      ? 'Resetting...'
                      : 'Reset start attempt'}
                  </Button>
                ) : !selectedRow.auction ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                    No order projection exists yet. If a wallet transaction was submitted, wait for
                    blockchain sync. If no transaction was submitted, reset is available.
                  </p>
                ) : null}
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </section>
  )
}

const StepRail = ({ currentStep }: { currentStep: 'artwork' | 'terms' }) => {
  const isTermsStep = currentStep === 'terms'

  return (
    <ol className="space-y-3" aria-label="Seller auction creation steps">
      <li
        className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${
          isTermsStep
            ? 'border-white/15 bg-white/10 text-white'
            : 'border-white bg-white text-slate-900'
        }`}
        aria-current={currentStep === 'artwork' ? 'step' : undefined}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
          {isTermsStep ? (
            <Check className="h-4 w-4" />
          ) : (
            <span className="text-sm font-semibold">1</span>
          )}
        </span>
        <span className="text-sm font-semibold">1 Choose artwork</span>
      </li>
      <li
        className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${
          isTermsStep
            ? 'border-white bg-white text-slate-900'
            : 'border-white/15 bg-white/10 text-white/60'
        }`}
        aria-current={currentStep === 'terms' ? 'step' : undefined}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
          <span className="text-sm font-semibold">2</span>
        </span>
        <span className="text-sm font-semibold">2 Set auction terms</span>
      </li>
    </ol>
  )
}

type SellerCandidateWorkspaceProps = {
  initialWorkspaceTab?: SellerAuctionWorkspaceTab
  isSeller: boolean
}

const SellerCandidateWorkspace = ({
  initialWorkspaceTab = 'detail',
  isSeller,
}: SellerCandidateWorkspaceProps) => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const hydratedQueryArtworkRef = useRef<string | null>(null)
  const { data, eligible, blocked, isLoading, error, refresh } = useSellerAuctionArtworkCandidates({
    enabled: isSeller,
  })
  const [currentStep, setCurrentStep] = useState<'artwork' | 'terms'>('artwork')
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const [termsArtworkId, setTermsArtworkId] = useState<string | null>(null)
  const [termsValues, setTermsValues] = useState<SellerAuctionTermsFormValues>(
    DEFAULT_SELLER_AUCTION_TERMS,
  )
  const [termsErrors, setTermsErrors] = useState<
    Partial<Record<keyof SellerAuctionTermsFormValues, string>>
  >({})
  const [hasSubmittedTerms, setHasSubmittedTerms] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [isEditingFailedTerms, setIsEditingFailedTerms] = useState(false)
  const [requestedWorkspaceTab, setActiveWorkspaceTab] =
    useState<SellerAuctionWorkspaceTab>(() => (isSeller ? initialWorkspaceTab : 'history'))

  const sellerAuctionStart = useSellerAuctionStart({ artworkId: termsArtworkId, enabled: isSeller })
  const queryArtworkId = useMemo(() => {
    const value = router.query.artworkId

    if (Array.isArray(value)) {
      return value[0] ?? null
    }

    return value ?? null
  }, [router.query.artworkId])
  const allCandidates = useMemo(() => [...eligible, ...blocked], [eligible, blocked])
  const restoredCandidate = useMemo(() => {
    if (currentStep !== 'artwork' || selectedArtworkId || !sellerAuctionStart.rememberedArtworkId) {
      return null
    }

    return (
      allCandidates.find(
        (candidate) => candidate.artworkId === sellerAuctionStart.rememberedArtworkId,
      ) ?? null
    )
  }, [allCandidates, currentStep, selectedArtworkId, sellerAuctionStart.rememberedArtworkId])
  const activeArtworkId =
    sellerAuctionStart.status?.artworkId ??
    termsArtworkId ??
    restoredCandidate?.artworkId ??
    selectedArtworkId
  const effectiveCurrentStep =
    currentStep === 'terms' || sellerAuctionStart.status || restoredCandidate ? 'terms' : 'artwork'

  const selectedCandidate = useMemo(
    () => allCandidates.find((candidate) => candidate.artworkId === activeArtworkId) ?? null,
    [activeArtworkId, allCandidates],
  )
  const selectedEligibleCandidate = useMemo(
    () => eligible.find((candidate) => candidate.artworkId === selectedArtworkId) ?? null,
    [eligible, selectedArtworkId],
  )

  const hasNoArtworks = !isLoading && !error && data?.total === 0
  const hasNoEligible = !isLoading && !error && !hasNoArtworks && eligible.length === 0
  const lifecycleStatus = sellerAuctionStart.status
  const isFailureEditable =
    lifecycleStatus?.status === 'start_failed' &&
    lifecycleStatus.editAllowed &&
    isEditingFailedTerms
  const isLifecycleLocked = Boolean(
    lifecycleStatus &&
    !isFailureEditable &&
    (lifecycleStatus.status === 'pending_start' ||
      lifecycleStatus.status === 'auction_active' ||
      lifecycleStatus.status === 'retry_available' ||
      lifecycleStatus.status === 'start_failed'),
  )
  const shouldShowLifecycleShell = Boolean(lifecycleStatus && !isFailureEditable)
  const workspaceTabs = useMemo(
    () =>
      isSeller
        ? [
            { key: 'detail' as const, label: 'Auction detail' },
            { key: 'history' as const, label: 'Bid history' },
            { key: 'create' as const, label: 'Create auction' },
          ]
        : [{ key: 'history' as const, label: 'Bid tracking' }],
    [isSeller],
  )
  const activeWorkspaceTab = workspaceTabs.some((tab) => tab.key === requestedWorkspaceTab)
    ? requestedWorkspaceTab
    : workspaceTabs[0].key

  useEffect(() => {
    if (!isSeller) {
      return
    }

    if (!router.isReady || !queryArtworkId || isLoading) {
      return
    }

    if (hydratedQueryArtworkRef.current === queryArtworkId) {
      return
    }

    const queryCandidate = allCandidates.find((candidate) => candidate.artworkId === queryArtworkId)

    if (!queryCandidate) {
      return
    }

    let isCancelled = false
    hydratedQueryArtworkRef.current = queryArtworkId

    window.queueMicrotask(() => {
      if (isCancelled) {
        return
      }

      setCurrentStep('artwork')
      setSelectedArtworkId(queryArtworkId)
      setTermsArtworkId(null)
      setDraftSaved(false)
      setWalletError(null)
      setIsEditingFailedTerms(false)
      setActiveWorkspaceTab('create')
      sellerAuctionStart.setTrackedArtworkId(queryArtworkId)
      void sellerAuctionStart.refresh(queryArtworkId).catch(() => null)
    })

    return () => {
      isCancelled = true
    }
  }, [allCandidates, isLoading, isSeller, queryArtworkId, router.isReady, sellerAuctionStart])

  const updateTermsValues = (nextValues: SellerAuctionTermsFormValues) => {
    setTermsValues(nextValues)
    setDraftSaved(false)
    setWalletError(null)

    if (hasSubmittedTerms) {
      setTermsErrors(validateSellerAuctionTerms(nextValues))
    }
  }

  const validateCurrentTerms = () => {
    const nextErrors = validateSellerAuctionTerms(termsValues)
    setTermsErrors(nextErrors)
    return nextErrors
  }

  const handleSelectArtwork = (artworkId: string) => {
    if (selectedArtworkId === artworkId) {
      setSelectedArtworkId(null)
      setTermsArtworkId(null)
      setTermsErrors({})
      setHasSubmittedTerms(false)
      setDraftSaved(false)
      setWalletError(null)
      setIsEditingFailedTerms(false)
      if (lifecycleStatus?.artworkId === artworkId) {
        sellerAuctionStart.setTrackedArtworkId(null)
      }
      return
    }

    setSelectedArtworkId(artworkId)
    setDraftSaved(false)
    setWalletError(null)
    setIsEditingFailedTerms(false)
    if (lifecycleStatus?.artworkId !== artworkId) {
      sellerAuctionStart.setTrackedArtworkId(null)
    }
  }

  const handleContinueToTerms = () => {
    if (!selectedEligibleCandidate) {
      return
    }

    if (termsArtworkId !== selectedEligibleCandidate.artworkId) {
      const nextValues =
        loadSellerAuctionTermsDraft(selectedEligibleCandidate.artworkId) ??
        DEFAULT_SELLER_AUCTION_TERMS

      setTermsArtworkId(selectedEligibleCandidate.artworkId)
      setTermsValues(nextValues)
      setTermsErrors({})
      setHasSubmittedTerms(false)
      setDraftSaved(false)
      setWalletError(null)
      setIsEditingFailedTerms(false)
    }

    setCurrentStep('terms')
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const clearArtworkQuery = () => {
    if (!router.query.artworkId) {
      return
    }

    const { artworkId: _artworkId, ...nextQuery } = router.query
    void _artworkId
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    })
    hydratedQueryArtworkRef.current = null
  }

  const handleBackToArtwork = () => {
    setCurrentStep('artwork')
    setSelectedArtworkId(null)
    setTermsArtworkId(null)
    setTermsErrors({})
    setHasSubmittedTerms(false)
    setDraftSaved(false)
    setIsEditingFailedTerms(false)
    setWalletError(null)
    sellerAuctionStart.clearTrackedArtwork()
    clearArtworkQuery()
  }

  const handleSaveDraft = () => {
    if (!selectedCandidate || isLifecycleLocked) {
      return
    }

    saveSellerAuctionTermsDraft(selectedCandidate.artworkId, termsValues)
    setDraftSaved(true)
  }

  const mapSnapshotToFormValues = useCallback(
    (snapshot: NonNullable<typeof lifecycleStatus>['submittedTermsSnapshot']) => {
      const durationSeconds =
        snapshot.durationSeconds ?? Math.round((snapshot.durationHours ?? 0) * 60 * 60)
      const preset =
        SELLER_AUCTION_DURATION_PRESETS.find((option) => option.seconds === durationSeconds)
          ?.value ?? 'custom'
      const customDurationUnit =
        SELLER_AUCTION_CUSTOM_DURATION_UNITS.find(
          (option) => durationSeconds > 0 && durationSeconds % option.seconds === 0,
        )?.value ?? 'minutes'
      const customDurationUnitSeconds =
        SELLER_AUCTION_CUSTOM_DURATION_UNITS.find((option) => option.value === customDurationUnit)
          ?.seconds ?? 60

      return {
        reservePolicy: snapshot.reservePolicy,
        reservePriceEth: snapshot.reservePriceEth ?? '',
        minBidIncrementEth: snapshot.minBidIncrementEth,
        durationPreset: preset,
        customDurationValue:
          preset === 'custom' ? String(durationSeconds / customDurationUnitSeconds) : '',
        customDurationUnit: customDurationUnit as SellerAuctionCustomDurationUnit,
        shippingDisclosure: snapshot.shippingDisclosure,
        paymentDisclosure: snapshot.paymentDisclosure,
        economicsLockedAcknowledged: snapshot.economicsLockedAcknowledged,
      } satisfies SellerAuctionTermsFormValues
    },
    [],
  )

  const buildStartRequest = useCallback(
    (artworkId: string, values: SellerAuctionTermsFormValues) => ({
      artworkId,
      reservePolicy: values.reservePolicy,
      reservePriceEth:
        values.reservePolicy === 'set' ? values.reservePriceEth.trim() || null : null,
      minBidIncrementEth: values.minBidIncrementEth.trim(),
      durationSeconds: getAuctionDurationSeconds(values) ?? 0,
      shippingDisclosure: values.shippingDisclosure.trim(),
      paymentDisclosure: values.paymentDisclosure.trim(),
      economicsLockedAcknowledged: values.economicsLockedAcknowledged,
    }),
    [],
  )

  const runWalletHandoff = useCallback(
    async (attempt: NonNullable<typeof lifecycleStatus>) => {
      if (!attempt.transactionRequest) {
        await sellerAuctionStart.refresh(attempt.artworkId)
        return
      }

      setWalletError(null)

      try {
        const walletResult = await submitSellerAuctionStartTransaction({
          transactionRequest: attempt.transactionRequest,
        })

        await sellerAuctionStart.attachTransaction(attempt.attemptId, {
          walletAddress: walletResult.walletAddress,
          txHash: walletResult.txHash,
        })
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : 'MetaMask could not continue the seller auction start.'
        setWalletError(message)
        await sellerAuctionStart.refresh(attempt.artworkId).catch(() => null)
      }
    },
    [sellerAuctionStart],
  )

  const handleStartAttempt = async () => {
    setHasSubmittedTerms(true)
    setWalletError(null)

    const nextErrors = validateCurrentTerms()
    if (Object.keys(nextErrors).length > 0 || !selectedCandidate) {
      return
    }

    try {
      setIsEditingFailedTerms(false)
      const response = await sellerAuctionStart.start(
        buildStartRequest(selectedCandidate.artworkId, termsValues),
      )
      await runWalletHandoff(response)
    } catch {
      return
    }
  }

  const handleRetryStart = async () => {
    if (!selectedCandidate) {
      return
    }

    setWalletError(null)
    try {
      const response = await sellerAuctionStart.retry(
        buildStartRequest(selectedCandidate.artworkId, termsValues),
      )
      await runWalletHandoff(response)
    } catch {
      return
    }
  }

  const displayedTermsValues =
    shouldShowLifecycleShell && lifecycleStatus
      ? mapSnapshotToFormValues(lifecycleStatus.submittedTermsSnapshot)
      : termsValues
  const isTermsValid = Object.keys(validateSellerAuctionTerms(displayedTermsValues)).length === 0
  const previewMode = isLifecycleLocked ? 'submitted' : 'draft'
  const startButtonLabel = sellerAuctionStart.isStarting
    ? 'Preparing auction...'
    : lifecycleStatus?.status === 'pending_start'
      ? 'Auction start in progress'
      : lifecycleStatus?.status === 'auction_active'
        ? 'Auction active'
        : lifecycleStatus?.status === 'retry_available'
          ? 'Retry from status shell'
          : lifecycleStatus?.status === 'start_failed' && !isEditingFailedTerms
            ? 'Review failure state above'
            : 'Start Auction'
  const supportingMessage =
    lifecycleStatus?.status === 'pending_start'
      ? 'Do not submit again while auction start is in progress.'
      : lifecycleStatus?.status === 'auction_active'
        ? 'Reserve, increment, and duration cannot be edited after activation.'
        : 'Network gas is shown in MetaMask during activation.'

  return (
    <div
      ref={workspaceRef}
      className="-mx-6 -my-1 min-h-screen bg-[#F7F8FA] px-4 pb-12 text-slate-900 sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8"
    >
      <div className="pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {isSeller ? 'Seller workspace' : 'Auction workspace'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {isSeller ? 'Seller auctions' : 'Auction bid tracking'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {isSeller
                ? 'Review your auction detail, inspect order and bid state, or create a new seller auction.'
                : 'Review bids submitted from this browser and reopen transaction records for verification.'}
            </p>
          </div>
          {isSeller && activeWorkspaceTab === 'create' ? (
            <div className="w-full rounded-[28px] border border-slate-900 bg-slate-900 p-5 text-white shadow-sm lg:w-[360px]">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">
                Auction setup
              </p>
              <div className="mt-4">
                <StepRail currentStep={effectiveCurrentStep} />
              </div>

              {effectiveCurrentStep === 'artwork' ? (
                <>
                  <p className="mt-5 text-sm leading-6 text-white/75">
                    Select an eligible artwork to unlock terms setup and preview.
                  </p>
                  <Button
                    type="button"
                    disabled={!selectedEligibleCandidate}
                    onClick={handleContinueToTerms}
                    className="mt-6 w-full bg-white text-slate-900 hover:bg-white/90 disabled:bg-white/25 disabled:text-white"
                  >
                    Continue to auction terms
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-5 text-sm leading-6 text-white/75">
                    Review terms, MetaMask handoff, and persisted lifecycle status.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToArtwork}
                    className="mt-6 w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Back to choose artwork
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 inline-flex rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
        {workspaceTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveWorkspaceTab(tab.key)}
            className={`rounded-[18px] px-5 py-3 text-sm font-semibold transition ${
              activeWorkspaceTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isSeller && activeWorkspaceTab === 'detail' ? <SellerAuctionManagerPanel /> : null}
      {activeWorkspaceTab === 'history' ? <BidHistoryPanel /> : null}

      {isSeller && activeWorkspaceTab === 'create' ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {policyCards.map((card) => {
              const Icon = card.icon

              return (
                <article
                  key={card.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <Icon className="h-6 w-6 text-slate-600" />
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{card.body}</p>
                </article>
              )
            })}
          </section>

          <SellerAuctionWalletReadiness userWalletAddress={user?.walletAddress} />

          {error ? (
            <section className="mt-8 rounded-[32px] border border-rose-200 bg-rose-50 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-rose-950">
                    We could not load auction eligibility. Try again or return to inventory.
                  </h2>
                  <p className="mt-2 text-sm text-rose-700">{error.message}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => void refresh()}>
                  <RefreshCcw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </section>
          ) : null}

          {effectiveCurrentStep === 'terms' && selectedCandidate ? (
            <section className="mt-10">
              {shouldShowLifecycleShell && lifecycleStatus ? (
                <div className="mb-6">
                  <SellerAuctionStartStatusShell
                    status={lifecycleStatus}
                    walletError={walletError || sellerAuctionStart.error}
                    isWalletActionLoading={
                      sellerAuctionStart.isRetrying || sellerAuctionStart.isAttachingTx
                    }
                    onOpenMetaMask={() => void runWalletHandoff(lifecycleStatus)}
                    onRetry={() => void handleRetryStart()}
                    onBackToTerms={
                      lifecycleStatus.editAllowed
                        ? () => {
                            setIsEditingFailedTerms(true)
                            setWalletError(null)
                            setTermsErrors({})
                            setHasSubmittedTerms(false)
                            setTermsValues(
                              mapSnapshotToFormValues(lifecycleStatus.submittedTermsSnapshot),
                            )
                          }
                        : undefined
                    }
                  />
                </div>
              ) : null}

              {!shouldShowLifecycleShell && sellerAuctionStart.error ? (
                <div className="mb-6 rounded-[24px] border border-[#FF4337]/20 bg-[#FFF5F4] px-4 py-3 text-sm text-[#FF4337]">
                  {sellerAuctionStart.error}
                </div>
              ) : null}

              <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
                  <CandidateImage candidate={selectedCandidate} className="max-w-[160px]" />
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                      Selected artwork
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      {selectedCandidate.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedCandidate.creatorName || 'Unknown creator'}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
                      {selectedCandidate.status}
                    </span>
                  </div>
                  <div className="md:justify-self-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToArtwork}
                    >
                      Change artwork
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                <div>
                  <SellerAuctionTermsForm
                    values={displayedTermsValues}
                    errors={termsErrors}
                    hasSubmitted={hasSubmittedTerms}
                    onChange={updateTermsValues}
                    onValidate={validateCurrentTerms}
                    onBack={handleBackToArtwork}
                    onSaveDraft={handleSaveDraft}
                    onStartAttempt={() => void handleStartAttempt()}
                    isStartDisabled={sellerAuctionStart.isBusy || isLifecycleLocked}
                    isLocked={isLifecycleLocked}
                    isSaveDraftDisabled={isLifecycleLocked}
                    startButtonLabel={startButtonLabel}
                    supportingMessage={supportingMessage}
                  />
                  {draftSaved ? (
                    <p className="mt-3 text-sm font-medium text-[#027A48]">
                      Draft saved on this device.
                    </p>
                  ) : null}
                </div>

                <SellerAuctionTermsPreview
                  candidate={selectedCandidate}
                  values={displayedTermsValues}
                  isTermsValid={previewMode === 'submitted' ? true : isTermsValid}
                  mode={previewMode}
                />
              </div>
            </section>
          ) : (
            <>
              <section className="mt-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      Ready for auction
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      {hasNoEligible ? 'No auction-ready artworks' : 'Ready for auction'}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {eligible.length} ready / {blocked.length} needs attention
                  </p>
                </div>

                <div className="mt-5">
                  {isLoading ? <LoadingGrid /> : null}
                  {hasNoArtworks ? (
                    <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                      <Boxes className="mx-auto h-10 w-10 text-slate-500" />
                      <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                        No artworks in your inventory yet
                      </h3>
                      <p className="mt-2 text-slate-500">
                        Upload or publish an artwork before starting an auction.
                      </p>
                    </div>
                  ) : null}
                  {hasNoEligible ? (
                    <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                      <Boxes className="mx-auto h-10 w-10 text-slate-500" />
                      <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                        No auction-ready artworks
                      </h3>
                      <p className="mt-2 max-w-2xl text-slate-500">
                        Your artworks need to be active, published, single-edition, and complete
                        before they can enter an auction.
                      </p>
                    </div>
                  ) : null}
                  {!isLoading && eligible.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {eligible.map((candidate) => (
                        <CandidateCard
                          key={candidate.artworkId}
                          candidate={candidate}
                          isSelected={selectedArtworkId === candidate.artworkId}
                          onSelect={() => handleSelectArtwork(candidate.artworkId)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              {!hasNoArtworks && !isLoading ? (
                <section className="mt-12">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Needs attention
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Needs attention
                      </h2>
                    </div>
                    <p className="text-sm text-slate-500">
                      Blocked artworks stay visible for recovery.
                    </p>
                  </div>
                  {blocked.length > 0 ? (
                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {blocked.map((candidate) => (
                        <CandidateCard
                          key={candidate.artworkId}
                          candidate={candidate}
                          isSelected={selectedArtworkId === candidate.artworkId}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        No blocked artworks found.
                      </p>
                    </div>
                  )}
                </section>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </div>
  )
}

type SellerAuctionArtworkPickerPageProps = {
  initialWorkspaceTab?: SellerAuctionWorkspaceTab
}

export const SellerAuctionArtworkPickerPage = ({
  initialWorkspaceTab,
}: SellerAuctionArtworkPickerPageProps) => {
  const user = useAuthStore((state) => state.user)
  const isSeller = user?.roles?.includes('seller') ?? false

  return <SellerCandidateWorkspace initialWorkspaceTab={initialWorkspaceTab} isSeller={isSeller} />
}
