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
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
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
import { loadSellerAuctionTermsDraft, saveSellerAuctionTermsDraft } from '../utils'

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
  typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(4).replace(/\.?0+$/, '')} ETH` : '0 ETH'

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

type SellerAuctionOverviewRow = {
  id: string
  title: string
  creatorName?: string | null
  thumbnailUrl?: string | null
  artworkId: string
  auction?: AuctionLot
  startStatus?: SellerAuctionStartStatusResponse
}

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

const SellerAuctionManagerPanel = () => {
  const router = useRouter()
  const [rows, setRows] = useState<SellerAuctionOverviewRow[]>([])
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resettingAttemptId, setResettingAttemptId] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    setIsLoading(true)
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

      setRows(nextRows)
      setSelectedRowId((currentId) => currentId ?? nextRows[0]?.id ?? null)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load seller auctions.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? rows[0] ?? null

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

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col gap-3 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Auction detail
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Your auction activity
          </h2>
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
                          <Image src={row.thumbnailUrl} alt={row.title} fill unoptimized className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">{row.title}</p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {row.auction?.onChainOrderId ?? row.startStatus?.orderId ?? 'No order id'}
                        </p>
                      </div>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getRowStatusTone(row)}`}>
                      {statusLabel}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {row.auction ? formatEth(row.auction.bidValue) : 'No bids'}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      View detail
                    </span>
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
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{selectedRow.title}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRowStatusTone(selectedRow)}`}>
                  {selectedRow.auction
                    ? selectedRow.auction.status
                    : getLifecycleLabel(selectedRow.startStatus?.status)}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ListChecks className="h-4 w-4" />
                    <span className="font-semibold uppercase tracking-[0.12em] text-xs">Order projection</span>
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Order number</dt>
                      <dd className="font-medium text-slate-900">{selectedRow.auction?.orderNumber ?? 'Not created'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Order status</dt>
                      <dd className="font-medium text-slate-900">{selectedRow.auction?.orderStatus ?? 'No order projection'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Payment status</dt>
                      <dd className="font-medium text-slate-900">{selectedRow.auction?.paymentStatus ?? 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Gavel className="h-4 w-4" />
                    <span className="font-semibold uppercase tracking-[0.12em] text-xs">Bid info</span>
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Current bid</dt>
                      <dd className="font-medium text-slate-900">{selectedRow.auction ? formatEth(selectedRow.auction.bidValue) : 'No bids yet'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Minimum next bid</dt>
                      <dd className="font-medium text-slate-900">{selectedRow.auction ? formatEth(selectedRow.auction.minimumNextBidEth) : 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Highest bidder</dt>
                      <dd className="max-w-[220px] truncate font-mono text-xs text-slate-900">{selectedRow.auction?.highestBidder ?? 'No bidder'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold uppercase tracking-[0.12em] text-xs">Timeline</span>
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Ends at</dt>
                      <dd className="text-right font-medium text-slate-900">{formatDateTime(selectedRow.auction?.endsAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Activated at</dt>
                      <dd className="text-right font-medium text-slate-900">{formatDateTime(selectedRow.startStatus?.activatedAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Updated at</dt>
                      <dd className="text-right font-medium text-slate-900">{formatDateTime(selectedRow.startStatus?.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
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
                {selectedRow.auction ? (
                  <Button
                    type="button"
                    variant={selectedRow.auction.orderProjectionId ? 'outline' : 'default'}
                    className={
                      selectedRow.auction.orderProjectionId
                        ? 'border-slate-200 text-slate-900'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }
                    onClick={() => void router.push(`/auction/bids/${encodeURIComponent(selectedRow.auction!.onChainOrderId)}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open public bid detail
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

const SellerProfileRequired = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profileHref = user?.slug ? `/profile/${user.slug}/edit` : '/profile'

  return (
    <section className="-mx-6 -my-1 flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12 text-center sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8">
      <div className="max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Seller auctions
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Seller profile required</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Create or complete your seller profile before starting an auction.
        </p>
        <Button
          type="button"
          className="mt-6 bg-slate-900 text-white hover:bg-slate-700"
          onClick={() => void router.push(profileHref)}
        >
          Go to seller profile
        </Button>
      </div>
    </section>
  )
}

const SellerCandidateWorkspace = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const hydratedQueryArtworkRef = useRef<string | null>(null)
  const { data, eligible, blocked, isLoading, error, refresh } = useSellerAuctionArtworkCandidates()
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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'detail' | 'create'>('detail')

  const sellerAuctionStart = useSellerAuctionStart({ artworkId: termsArtworkId })
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

  useEffect(() => {
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
  }, [allCandidates, isLoading, queryArtworkId, router.isReady, sellerAuctionStart])

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

  const handleBackToArtwork = () => {
    setCurrentStep('artwork')
    setTermsArtworkId(null)
    setIsEditingFailedTerms(false)
    setWalletError(null)
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
        SELLER_AUCTION_CUSTOM_DURATION_UNITS.find(
          (option) => option.value === customDurationUnit,
        )?.seconds ?? 60

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
              Seller workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Seller auctions</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review your auction detail, inspect order and bid state, or create a new seller auction.
            </p>
          </div>
          {activeWorkspaceTab === 'create' ? (
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
                <p className="mt-5 text-sm leading-6 text-white/75">
                  Review terms, MetaMask handoff, and persisted lifecycle status.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 inline-flex rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
        {[
          { key: 'detail', label: 'Auction detail' },
          { key: 'create', label: 'Create auction' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveWorkspaceTab(tab.key as 'detail' | 'create')}
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

      {activeWorkspaceTab === 'detail' ? <SellerAuctionManagerPanel /> : null}

      {activeWorkspaceTab === 'create' ? (
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
                  disabled={isLifecycleLocked}
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
                isBackDisabled={isLifecycleLocked}
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
                    Your artworks need to be active, published, single-edition, and complete before
                    they can enter an auction.
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
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Needs attention</h2>
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

export const SellerAuctionArtworkPickerPage = () => {
  const user = useAuthStore((state) => state.user)
  const isSeller = user?.roles?.includes('seller') ?? false

  if (!isSeller) {
    return <SellerProfileRequired />
  }

  return <SellerCandidateWorkspace />
}
