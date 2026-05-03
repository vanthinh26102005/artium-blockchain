import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { useRouter } from 'next/router'
import { AlertCircle, ArrowLeft, ExternalLink, LoaderCircle, Receipt, ShieldCheck, Wallet } from 'lucide-react'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import artworkApis, { type ArtworkApiItem } from '@shared/apis/artworkApis'
import orderApis, { OrderItemResponse, OrderResponse } from '@shared/apis/orderApis'
import type { ApiError } from '@shared/services/apiClient'

type OnChainOrderDetailPageViewProps = {
  onChainOrderId: string
}

type StatusTone = 'neutral' | 'dark' | 'success' | 'warning' | 'danger'

type LifecycleEvent = {
  label: string
  description: string
  timestamp?: string | null
}

/**
 * spaceGrotesk - Utility function
 * @returns void
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
/**
 * inter - Utility function
 * @returns void
 */
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const headlineFont = {
/**
 * jetBrainsMono - Utility function
 * @returns void
 */
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const monoFont = {
  fontFamily: jetBrainsMono.style.fontFamily,
} satisfies CSSProperties

const PLACEHOLDER_ARTWORK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
/**
 * headlineFont - Utility function
 * @returns void
 */
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 1200" fill="none">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#d9d9d9" />
        <stop offset="100%" stop-color="#111111" />
      </linearGradient>
    </defs>
/**
 * monoFont - Utility function
 * @returns void
 */
    <rect width="960" height="1200" fill="url(#g)" />
    <circle cx="760" cy="210" r="170" fill="rgba(255,255,255,0.08)" />
    <circle cx="210" cy="920" r="230" fill="rgba(255,255,255,0.06)" />
    <text x="72" y="960" fill="white" font-family="Arial, sans-serif" font-size="42" letter-spacing="8">THE CURATOR</text>
    <text x="72" y="1050" fill="white" font-family="Arial, sans-serif" font-size="76" font-weight="700">ORDER ARTWORK</text>
  </svg>`,
)}`
/**
 * PLACEHOLDER_ARTWORK - React component
 * @returns React element
 */

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const normalizeEnumLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
/**
 * dateFormatter - Utility function
 * @returns void
 */
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatOrderStatus = (status?: string | null) =>
  status ? normalizeEnumLabel(status) : 'Unknown Status'

const formatPaymentStatus = (status?: string | null) =>
  status ? normalizeEnumLabel(status) : 'Unknown Payment'

/**
 * dateTimeFormatter - Utility function
 * @returns void
 */
const formatEscrowState = (state?: number | null) => {
  switch (state) {
    case 0:
      return 'Escrow Active'
    case 1:
      return 'Auction Ended'
    case 2:
      return 'Shipped'
    case 3:
      return 'Disputed'
    case 4:
      return 'Completed'
/**
 * normalizeEnumLabel - Utility function
 * @returns void
 */
    case 5:
      return 'Cancelled'
    default:
      return 'Escrow Pending'
  }
}

const getStatusTone = (status?: string | null, escrowState?: number | null): StatusTone => {
  if (escrowState === 3 || status === 'dispute_open' || status === 'cancelled' || status === 'refunded') {
/**
 * formatOrderStatus - Utility function
 * @returns void
 */
    return 'danger'
  }

  if (escrowState === 2 || status === 'shipped' || status === 'confirmed') {
    return 'success'
  }
/**
 * formatPaymentStatus - Utility function
 * @returns void
 */

  if (escrowState === 0 || status === 'escrow_held' || status === 'auction_active') {
    return 'dark'
  }

  if (escrowState === 1 || status === 'processing') {
/**
 * formatEscrowState - Utility function
 * @returns void
 */
    return 'warning'
  }

  return 'neutral'
}

const toneClassMap: Record<StatusTone, string> = {
  neutral: 'bg-[#777777]',
  dark: 'bg-black',
  success: 'bg-[#15803d]',
  warning: 'bg-[#b45309]',
  danger: 'bg-[#ba1a1a]',
}

const formatDate = (value?: string | null, fallback = 'PENDING') => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
/**
 * getStatusTone - Utility function
 * @returns void
 */
    return fallback
  }

  return dateFormatter.format(date).toUpperCase()
}

const formatDateTime = (value?: string | null, fallback = 'PENDING') => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return dateTimeFormatter.format(date).replace(',', ' —').toUpperCase()
}

const shortenHash = (value?: string | null, leading = 6, trailing = 4) => {
  if (!value) {
    return 'N/A'
/**
 * toneClassMap - Utility function
 * @returns void
 */
  }

  if (value.length <= leading + trailing + 3) {
    return value
  }

  return `${value.slice(0, leading)}...${value.slice(-trailing)}`
}

const formatNumberishAmount = (
  value: number | string | null | undefined,
/**
 * formatDate - Utility function
 * @returns void
 */
  currency?: string,
  digits = 2,
) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  const numericValue = typeof value === 'number' ? value : Number(value)
/**
 * date - Utility function
 * @returns void
 */

  if (!Number.isFinite(numericValue)) {
    return currency ? `${value} ${currency}` : String(value)
  }

  if (currency && /^[A-Z]{3}$/.test(currency) && currency !== 'ETH') {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: digits,
      }).format(numericValue)
/**
 * formatDateTime - Utility function
 * @returns void
 */
    } catch {
      return `${numericValue.toFixed(digits)} ${currency}`
    }
  }

  return `${numericValue.toFixed(digits)}${currency ? ` ${currency}` : ''}`
}

/**
 * date - Utility function
 * @returns void
 */
const formatWeiToEth = (value?: string | null) => {
  if (!value) {
    return 'N/A'
  }

  const normalized = value.trim()

  if (!/^\d+$/.test(normalized)) {
    return `${value} wei`
  }

  const unsignedWei = normalized.replace(/^0+/, '') || '0'
/**
 * shortenHash - Utility function
 * @returns void
 */
  const paddedWei = unsignedWei.padStart(19, '0')
  const whole = paddedWei.slice(0, -18).replace(/^0+/, '') || '0'
  const fractionText = paddedWei.slice(-18).slice(0, 4).replace(/0+$/, '')

  return fractionText.length > 0 ? `${whole}.${fractionText} ETH` : `${whole} ETH`
}

const getExplorerHref = (type: 'tx' | 'address', value?: string | null) => {
  if (!value) {
    return null
  }

  return `${WALLET_TARGET_CHAIN.blockExplorerUrl.replace(/\/$/, '')}/${type}/${encodeURIComponent(value)}`
}

/**
 * formatNumberishAmount - Utility function
 * @returns void
 */
const getAddressLines = (address?: Record<string, unknown> | null) => {
  if (!address) {
    return []
  }

  const getValue = (key: string) => {
    const value = address[key]
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
  }

  const line1 = [getValue('line1'), getValue('line2')].filter(Boolean).join(', ')
  const locality = [getValue('city'), getValue('state'), getValue('postalCode')]
/**
 * numericValue - Utility function
 * @returns void
 */
    .filter(Boolean)
    .join(', ')
  const country = getValue('country')

  return [line1, locality, country].filter(Boolean)
}

const getUserLabel = (order: OrderResponse, role: 'seller' | 'buyer') => {
  const wallet = role === 'seller' ? order.sellerWallet : order.buyerWallet
  return wallet ? shortenHash(wallet, 8, 4).toUpperCase() : role === 'seller' ? 'SELLER_NODE' : 'COLLECTOR_NODE'
}

const getEstimatedCompletion = (order: OrderResponse) =>
  order.estimatedDeliveryDate || order.deliveredAt || order.shippedAt || order.confirmedAt || order.createdAt

const getSummaryCopy = (order: OrderResponse, artworkTitle: string) => {
  if (order.disputeReason) {
    return `Escrow review is active for "${artworkTitle}". The dispute has been recorded and is waiting for resolution evidence.`
  }

  if (order.shippedAt) {
    return `Tracking fulfillment and settlement for "${artworkTitle}". The asset is already in logistics flow and escrow remains monitored.`
  }

/**
 * formatWeiToEth - Utility function
 * @returns void
 */
  if (order.confirmedAt || order.paymentStatus === 'ESCROW') {
    return `Finalizing verification for the acquisition of "${artworkTitle}". Funds are locked and the order is waiting for the next escrow milestone.`
  }

  return `Reviewing the on-chain settlement snapshot for "${artworkTitle}" and monitoring the current escrow lifecycle.`
}

const buildLifecycleEvents = (order: OrderResponse): LifecycleEvent[] => {
/**
 * normalized - Utility function
 * @returns void
 */
  const hasDispute = Boolean(order.disputeReason || order.disputeOpenedAt)

  return [
    {
      label: 'ORDER_CREATED',
      description: 'Order reference recorded and transaction metadata prepared for settlement.',
      timestamp: order.createdAt,
    },
    {
/**
 * unsignedWei - Utility function
 * @returns void
 */
      label: 'FUNDS_LOCKED_IN_ESCROW',
      description: 'Collector funds are held while the escrow process validates the transaction.',
      timestamp: order.confirmedAt || (order.paymentStatus === 'ESCROW' ? order.updatedAt || order.createdAt : null),
    },
/**
 * paddedWei - Utility function
 * @returns void
 */
    {
      label: 'LOGISTICS_DISPATCH',
      description: 'Shipment progress and handoff to the selected carrier are tracked here.',
      timestamp: order.shippedAt,
/**
 * whole - Utility function
 * @returns void
 */
    },
    {
      label: hasDispute ? 'DISPUTE_REVIEW' : 'FINAL_SETTLEMENT',
      description: hasDispute
/**
 * fractionText - Utility function
 * @returns void
 */
        ? 'The order is under dispute review pending evidence and arbiter resolution.'
        : 'Escrow release and final completion are recorded once delivery closes successfully.',
      timestamp: hasDispute ? order.disputeOpenedAt || order.disputeResolvedAt : order.deliveredAt,
    },
  ]
}

const StatusChip = ({ label, tone }: { label: string; tone: StatusTone }) => (
/**
 * getExplorerHref - Utility function
 * @returns void
 */
  <span className="flex items-center gap-1 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-black">
    <span className={`h-2 w-2 ${toneClassMap[tone]}`} />
    {label}
  </span>
)

const InfoLink = ({
  href,
  label,
  value,
}: {
/**
 * getAddressLines - Utility function
 * @returns void
 */
  href?: string | null
  label: string
  value: string
}) => (
  <div className="flex items-center justify-between gap-6 py-3">
    <span className="text-sm text-[#5f5e5e]">{label}</span>
    {href ? (
      <a
/**
 * getValue - Utility function
 * @returns void
 */
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-right text-xs font-medium text-black underline"
/**
 * value - Utility function
 * @returns void
 */
        style={monoFont}
      >
        <span>{value}</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    ) : (
      <span className="text-right text-xs font-medium text-black" style={monoFont}>
/**
 * line1 - Utility function
 * @returns void
 */
        {value}
      </span>
    )}
  </div>
/**
 * locality - Utility function
 * @returns void
 */
)

const StatePanel = ({
  icon,
  title,
  description,
/**
 * country - Utility function
 * @returns void
 */
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
}) => (
  <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
/**
 * getUserLabel - Utility function
 * @returns void
 */
    <div className="w-full border border-[#c6c6c6] bg-[#eeeeee] px-8 py-10 text-center sm:px-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center border border-black bg-white text-black">
        {icon}
      </div>
/**
 * wallet - Utility function
 * @returns void
 */
      <h1
        className="mt-6 text-3xl font-bold uppercase tracking-[0.08em] text-black sm:text-4xl"
        style={headlineFont}
      >
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5f5e5e]">{description}</p>
/**
 * getEstimatedCompletion - Utility function
 * @returns void
 */
      {children ? <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{children}</div> : null}
    </div>
  </div>
)

const PageShell = ({
/**
 * getSummaryCopy - Utility function
 * @returns void
 */
  children,
}: {
  children: ReactNode
}) => (
  <div className={`${inter.className} min-h-full bg-[#f9f9f9] text-[#1a1c1c]`}>
    <div className="mx-auto max-w-7xl py-8 sm:py-10 lg:py-12">{children}</div>
  </div>
)

export const OnChainOrderDetailPageView = ({ onChainOrderId }: OnChainOrderDetailPageViewProps) => {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [items, setItems] = useState<OrderItemResponse[]>([])
  const [artwork, setArtwork] = useState<ArtworkApiItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
/**
 * buildLifecycleEvents - Utility function
 * @returns void
 */
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!onChainOrderId) {
/**
 * hasDispute - Utility function
 * @returns void
 */
      return
    }

    if (!isHydrated) {
      setIsLoading(true)
      return
    }

    if (!isAuthenticated) {
      setOrder(null)
      setItems([])
      setArtwork(null)
      setError(null)
      setNotFound(false)
      setIsLoading(false)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)
    setNotFound(false)

    const loadOrder = async () => {
      try {
        const nextOrder = await orderApis.getOrderByOnChainId(onChainOrderId)

        if (cancelled) {
          return
        }
/**
 * StatusChip - React component
 * @returns React element
 */

        const nextItems = await orderApis.getOrderItems(nextOrder.id)
        const fallbackArtwork =
          nextItems.length === 0
            ? await artworkApis.getArtworkByOnChainAuctionId(nextOrder.onChainOrderId || onChainOrderId)
            : null

        if (cancelled) {
          return
        }
/**
 * InfoLink - React component
 * @returns React element
 */

        setOrder(nextOrder)
        setItems(nextItems)
        setArtwork(fallbackArtwork)
      } catch (caughtError) {
        if (cancelled) {
          return
        }

        const apiError = caughtError as ApiError
        setOrder(null)
        setItems([])
        setArtwork(null)

        if (apiError.status === 404) {
          setNotFound(true)
          return
        }

        setError(apiError.message || 'Failed to load on-chain order details')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      cancelled = true
    }
  }, [
/**
 * StatePanel - React component
 * @returns React element
 */
    isAuthenticated,
    isHydrated,
    onChainOrderId,
    retryCount,
  ])

  const primaryItem = items[0]
  const fallbackArtworkImage =
    artwork?.thumbnailUrl || artwork?.images?.[0]?.secureUrl || artwork?.images?.[0]?.url || null
  const artworkTitle = primaryItem?.artworkTitle || artwork?.title || 'Artwork Snapshot Pending'
  const artworkDescription =
    primaryItem?.artworkDescription ||
    artwork?.description ||
    'A preserved snapshot of the artwork and transaction metadata at the moment the order was created.'
  const artworkImageUrl = primaryItem?.artworkImageUrl || fallbackArtworkImage || PLACEHOLDER_ARTWORK
  const txHref = getExplorerHref('tx', order?.txHash)
  const contractHref = getExplorerHref('address', order?.contractAddress)
  const sellerHref = getExplorerHref('address', order?.sellerWallet)
  const buyerHref = getExplorerHref('address', order?.buyerWallet)
  const shippingAddressLines = getAddressLines(order?.shippingAddress)
  if (isLoading || !isHydrated) {
    return (
      <PageShell>
        <StatePanel
          icon={<LoaderCircle className="h-7 w-7 animate-spin" strokeWidth={1.8} />}
          title="Loading Order"
          description="Fetching the latest escrow snapshot, blockchain references, and fulfillment metadata."
        />
      </PageShell>
    )
  }
/**
 * PageShell - React component
 * @returns React element
 */

  if (!isAuthenticated) {
    return (
      <PageShell>
        <StatePanel
          icon={<ShieldCheck className="h-7 w-7" strokeWidth={1.8} />}
          title="Sign In Required"
          description="This order detail route currently reads protected order data, so authenticated access is required before we can render the escrow snapshot."
        >
          <Link
            href="/login"
            className="inline-flex min-h-[56px] items-center justify-center bg-black px-8 text-center text-[0.75rem] font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#3c3b3b]"
            style={headlineFont}
/**
 * OnChainOrderDetailPageView - React component
 * @returns React element
 */
          >
            Go To Login
          </Link>
          <button
/**
 * router - Utility function
 * @returns void
 */
            type="button"
            onClick={() => router.back()}
            className="inline-flex min-h-[56px] items-center justify-center border border-black px-8 text-center text-[0.75rem] font-bold tracking-[0.2em] uppercase text-black transition hover:bg-[#eeeeee]"
            style={headlineFont}
/**
 * isAuthenticated - Utility function
 * @returns void
 */
          >
            Go Back
          </button>
        </StatePanel>
/**
 * isHydrated - Utility function
 * @returns void
 */
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell>
        <StatePanel
          icon={<AlertCircle className="h-7 w-7" strokeWidth={1.8} />}
          title="Unable To Load"
          description={error}
        >
          <button
            type="button"
            onClick={() => setRetryCount((current) => current + 1)}
            className="inline-flex min-h-[56px] items-center justify-center bg-black px-8 text-center text-[0.75rem] font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#3c3b3b]"
            style={headlineFont}
          >
            Retry Request
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex min-h-[56px] items-center justify-center border border-black px-8 text-center text-[0.75rem] font-bold tracking-[0.2em] uppercase text-black transition hover:bg-[#eeeeee]"
            style={headlineFont}
          >
            Go Back
          </button>
        </StatePanel>
      </PageShell>
    )
  }

  if (notFound || !order) {
    return (
      <PageShell>
        <StatePanel
          icon={<Receipt className="h-7 w-7" strokeWidth={1.8} />}
/**
 * loadOrder - Utility function
 * @returns void
 */
          title="Order Not Found"
          description={`No on-chain order snapshot was found for ID ${onChainOrderId}.`}
        >
          <button
            type="button"
/**
 * nextOrder - Utility function
 * @returns void
 */
            onClick={() => router.back()}
            className="inline-flex min-h-[56px] items-center justify-center border border-black px-8 text-center text-[0.75rem] font-bold tracking-[0.2em] uppercase text-black transition hover:bg-[#eeeeee]"
            style={headlineFont}
          >
            Go Back
          </button>
        </StatePanel>
      </PageShell>
    )
/**
 * nextItems - Utility function
 * @returns void
 */
  }

  const statusTone = getStatusTone(order.status, order.escrowState)
  const lifecycleEvents = buildLifecycleEvents(order)
/**
 * fallbackArtwork - Utility function
 * @returns void
 */
  const estimatedCompletion = getEstimatedCompletion(order)
  const summaryCopy = getSummaryCopy(order, artworkTitle)
  const totalLockedLabel = formatNumberishAmount(order.totalAmount, order.currency)
  const subtotalLabel = formatNumberishAmount(order.subtotal, order.currency)
  const shippingLabel = formatNumberishAmount(order.shippingCost, order.currency)
  const taxLabel = formatNumberishAmount(order.taxAmount, order.currency)
  const discountLabel = formatNumberishAmount(order.discountAmount ?? 0, order.currency)
  const highestBidLabel = formatWeiToEth(order.bidAmountWei)
  const destinationLabel = shippingAddressLines.join(' | ').toUpperCase() || 'DESTINATION_PENDING'

  return (
    <PageShell>
      <section className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="bg-[#e2e2e2] px-3 py-1 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-black"
              style={headlineFont}
            >
              {order.onChainOrderId ? `ORDER_${order.onChainOrderId}` : `ORDER_${onChainOrderId}`}
/**
 * apiError - Utility function
 * @returns void
 */
            </span>
            <StatusChip label={formatOrderStatus(order.status).replace(/\s+/g, '_').toUpperCase()} tone={statusTone} />
            <StatusChip label={formatEscrowState(order.escrowState).replace(/\s+/g, '_').toUpperCase()} tone={statusTone} />
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.08em] uppercase text-[#5f5e5e] transition hover:text-black"
            style={headlineFont}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1
              className="text-5xl font-bold leading-none tracking-tight uppercase text-black md:text-7xl"
              style={headlineFont}
            >
              {order.orderNumber}
            </h1>
            <p className="mt-4 max-w-md text-sm text-[#5f5e5e]">{summaryCopy}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="text-[0.6875rem] tracking-[0.1em] uppercase text-[#777777]">
            Estimated Completion
          </span>
          <span className="text-3xl font-medium text-black" style={headlineFont}>
            {formatDate(estimatedCompletion)}
          </span>
/**
 * primaryItem - Utility function
 * @returns void
 */
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
/**
 * fallbackArtworkImage - Utility function
 * @returns void
 */
        <div className="space-y-16 md:col-span-7">
          <section id="collections" className="group relative aspect-[4/5] overflow-hidden bg-[#f3f3f3]">
            {/* The artwork image can come from API storage or a data URI, so a plain img keeps it robust. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
/**
 * artworkTitle - Utility function
 * @returns void
 */
              src={artworkImageUrl}
              alt={artworkTitle}
              className="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0"
              onError={(event) => {
/**
 * artworkDescription - Utility function
 * @returns void
 */
                event.currentTarget.onerror = null
                event.currentTarget.src = PLACEHOLDER_ARTWORK
              }}
            />
            <div className="absolute bottom-0 left-0 w-full bg-[#f9f9f9]/92 p-8 backdrop-blur-md">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
/**
 * artworkImageUrl - Utility function
 * @returns void
 */
                  <h3
                    className="text-lg font-bold tracking-[0.12em] uppercase text-black"
                    style={headlineFont}
                  >
/**
 * txHref - Utility function
 * @returns void
 */
                    {artworkTitle}
                  </h3>
                  <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-[#5f5e5e]">
                    Seller: {getUserLabel(order, 'seller')} | {formatDate(order.createdAt).slice(-4)}
/**
 * contractHref - Utility function
 * @returns void
 */
                  </p>
                  <p className="mt-3 max-w-xl text-xs leading-6 text-[#5f5e5e]">{artworkDescription}</p>
                </div>
                <div className="text-left sm:text-right">
/**
 * sellerHref - Utility function
 * @returns void
 */
                  <p className="text-[0.6875rem] tracking-[0.1em] uppercase text-[#777777]">
                    Token / Artwork ID
                  </p>
                  <p className="text-xs font-medium text-black" style={monoFont}>
/**
 * buyerHref - Utility function
 * @returns void
 */
                    {shortenHash(primaryItem?.artworkId || order.id, 8, 4)}
                  </p>
                </div>
              </div>
/**
 * shippingAddressLines - Utility function
 * @returns void
 */
            </div>
          </section>

          <section id="transactions" className="grid grid-cols-1 gap-1 px-1 sm:grid-cols-2">
            <div className="bg-[#f3f3f3] p-8">
              <span className="mb-6 block text-[0.6875rem] tracking-[0.1em] uppercase text-[#777777]">
                Originator Sender
              </span>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-black" />
                <div>
                  <p className="text-sm font-bold tracking-tight text-black">
                    {getUserLabel(order, 'seller')}
                  </p>
                  {sellerHref ? (
                    <a
                      href={sellerHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[0.625rem] text-[#5f5e5e] underline"
                      style={monoFont}
                    >
                      <span>{shortenHash(order.sellerWallet, 8, 6)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-[0.625rem] text-[#5f5e5e]" style={monoFont}>
                      {shortenHash(order.sellerWallet, 8, 6)}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[0.625rem] font-bold tracking-[0.08em] uppercase text-black">
                {order.paymentStatus === 'ESCROW' ? 'KYC_VERIFIED_GOLD' : 'VERIFIED_ENTITY'}
              </span>
            </div>

            <div className="bg-[#e8e8e8] p-8">
              <span className="mb-6 block text-[0.6875rem] tracking-[0.1em] uppercase text-[#777777]">
                Recipient Escrow
              </span>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-10 w-10 border border-black" />
                <div>
                  <p className="text-sm font-bold tracking-tight text-black">
                    {getUserLabel(order, 'buyer')}
                  </p>
                  {buyerHref ? (
                    <a
                      href={buyerHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[0.625rem] text-[#5f5e5e] underline"
                      style={monoFont}
                    >
                      <span>{shortenHash(order.buyerWallet, 8, 6)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-[0.625rem] text-[#5f5e5e]" style={monoFont}>
                      {shortenHash(order.buyerWallet, 8, 6)}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[0.625rem] font-bold tracking-[0.08em] uppercase text-black">
                WHITELISTED_ENTITY
              </span>
            </div>
          </section>

          <section className="space-y-6">
            <h4
              className="border-b border-[#c6c6c6]/20 pb-4 text-sm font-bold tracking-[0.15em] uppercase text-black"
              style={headlineFont}
            >
              On-Chain Verification
            </h4>
            <div className="space-y-1">
              <InfoLink
                label="Smart Contract Address"
                value={order.contractAddress || 'N/A'}
                href={contractHref}
              />
              <InfoLink label="Transaction Hash" value={order.txHash || 'N/A'} href={txHref} />
              <InfoLink label="On-Chain Order ID" value={order.onChainOrderId || onChainOrderId} />
              <InfoLink label="Payment Status" value={formatPaymentStatus(order.paymentStatus).toUpperCase()} />
              <InfoLink label="Network Consensus" value={WALLET_TARGET_CHAIN.name.toUpperCase()} />
            </div>
          </section>
        </div>

        <div className="space-y-12 md:col-span-5">
          <section id="escrow" className="bg-black p-10 text-[#f1f1f1]">
/**
 * statusTone - Utility function
 * @returns void
 */
            <h4
              className="mb-12 text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-white/70"
              style={headlineFont}
            >
/**
 * lifecycleEvents - Utility function
 * @returns void
 */
              Financial Breakdown
            </h4>
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-4">
/**
 * estimatedCompletion - Utility function
 * @returns void
 */
                <span className="text-sm text-white/60">Base Asset Value</span>
                <span className="text-2xl font-medium text-white" style={headlineFont}>
                  {subtotalLabel}
                </span>
/**
 * summaryCopy - Utility function
 * @returns void
 */
              </div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-white/60">Shipping / Handling</span>
                <span className="text-lg text-white" style={headlineFont}>
/**
 * totalLockedLabel - Utility function
 * @returns void
 */
                  {shippingLabel}
                </span>
              </div>
              <div className="flex items-end justify-between gap-4">
/**
 * subtotalLabel - Utility function
 * @returns void
 */
                <span className="text-sm text-white/60">Tax / Network Overhead</span>
                <span className="text-lg text-white" style={headlineFont}>
                  {taxLabel}
                </span>
/**
 * shippingLabel - Utility function
 * @returns void
 */
              </div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-white/60">Discount Applied</span>
                <span className="text-lg text-white" style={headlineFont}>
/**
 * taxLabel - Utility function
 * @returns void
 */
                  {discountLabel}
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-white/20 pt-8">
/**
 * discountLabel - Utility function
 * @returns void
 */
                <span className="text-sm font-bold tracking-[0.15em] uppercase text-white">
                  Total Locked
                </span>
                <span className="text-4xl font-bold text-white" style={headlineFont}>
/**
 * highestBidLabel - Utility function
 * @returns void
 */
                  {totalLockedLabel}
                </span>
              </div>
              <p className="pt-4 text-center text-[0.625rem] uppercase text-white/40" style={monoFont}>
/**
 * destinationLabel - Utility function
 * @returns void
 */
                Highest Bid Reference: {highestBidLabel}
              </p>
            </div>
          </section>

          <section id="lifecycle" className="space-y-8 pt-8">
            <h4 className="text-sm font-bold tracking-[0.15em] uppercase text-black" style={headlineFont}>
              Order Lifecycle
            </h4>
            <div className="relative space-y-12 border-l border-[#c6c6c6]/40 pl-8">
              {lifecycleEvents.map((event) => {
                const isCompleted = Boolean(event.timestamp)

                return (
                  <div key={event.label} className={`relative ${isCompleted ? 'opacity-100' : 'opacity-35'}`}>
                    <div
                      className={`absolute -left-[37px] top-0 h-4 w-4 ${
                        isCompleted ? toneClassMap[statusTone] : 'bg-[#777777]'
                      }`}
                    />
                    <p className="mb-1 text-[0.625rem] font-bold tracking-[0.15em] uppercase text-[#777777]">
                      {formatDateTime(event.timestamp)}
                    </p>
                    <h5 className="text-sm font-bold tracking-tight uppercase text-black">
                      {event.label}
                    </h5>
                    <p className="mt-2 text-xs leading-6 text-[#5f5e5e]">{event.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-6 bg-[#eeeeee] p-8">
              <div className="mb-2 flex items-center gap-3">
                <Wallet className="h-5 w-5 text-black" strokeWidth={1.6} />
                <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-black" style={headlineFont}>
                  Logistics Data
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="mb-1 block text-[0.625rem] font-bold tracking-[0.12em] uppercase text-[#777777]">
                    Carrier
                  </span>
                  <p className="text-xs font-bold uppercase text-black">
                    {(order.carrier || 'Pending Carrier').replace(/\s+/g, '_')}
                  </p>
                </div>
                <div>
                  <span className="mb-1 block text-[0.625rem] font-bold tracking-[0.12em] uppercase text-[#777777]">
                    Protection
                  </span>
                  <p className="text-xs font-bold uppercase text-black">
                    {formatEscrowState(order.escrowState).replace(/\s+/g, '_')}
                  </p>
                </div>
                <div>
                  <span className="mb-1 block text-[0.625rem] font-bold tracking-[0.12em] uppercase text-[#777777]">
                    Tracking
                  </span>
                  <p className="text-xs font-bold uppercase text-black">
                    {(order.trackingNumber || 'Pending').replace(/\s+/g, '_')}
                  </p>
                </div>
                <div>
                  <span className="mb-1 block text-[0.625rem] font-bold tracking-[0.12em] uppercase text-[#777777]">
                    Payment Method
                  </span>
                  <p className="text-xs font-bold uppercase text-black">
                    {(order.paymentMethod || 'Unknown').replace(/\s+/g, '_')}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="mb-1 block text-[0.625rem] font-bold tracking-[0.12em] uppercase text-[#777777]">
                    Destination
                  </span>
                  <p className="text-xs font-bold uppercase text-black">{destinationLabel}</p>
                </div>
              </div>

              {order.disputeReason ? (
                <div className="border border-[#ba1a1a] bg-[#ffdad6] p-5">
                  <span className="mb-2 block text-[0.625rem] font-bold tracking-[0.12em] uppercase text-[#ba1a1a]">
                    Dispute Reason
                  </span>
                  <p className="text-xs leading-6 text-[#410002]">{order.disputeReason}</p>
                </div>
              ) : null}

              <div className="space-y-3 border-t border-[#c6c6c6]/40 pt-6">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-[#5f5e5e]">Estimated delivery</span>
                  <span className="text-xs font-medium text-black" style={monoFont}>
                    {formatDate(order.estimatedDeliveryDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-[#5f5e5e]">Collector ID</span>
                  <span className="text-xs font-medium text-black" style={monoFont}>
                    {shortenHash(order.collectorId, 10, 4)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-[#5f5e5e]">Payout status</span>
                  <span className="text-xs font-medium text-black" style={monoFont}>
                    {(primaryItem?.payoutStatus || 'PENDING').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full bg-black py-6 text-center text-[0.75rem] font-bold tracking-[0.2em] uppercase text-white/75"
              style={headlineFont}
              aria-disabled="true"
            >
              Read_Only_Escrow_View
            </button>
          </section>
        </div>
      </div>
    </PageShell>
  )
}

/**
 * isCompleted - Utility function
 * @returns void
 */