import type { OrderItemResponse, OrderResponse } from '@shared/apis/orderApis'
import type { SellerAuctionStartStatusResponse } from '@shared/apis/auctionApis'
import type { OrderActorRole, OrderTimelineStep, OrdersWorkspaceScope } from '../types/orderTypes'

export type ShippingRecordValue = {
  label: string
  value: string
}

export type ShippingPresentation = {
  title: string
  description: string
  emptyAddressLabel: string
  records: ShippingRecordValue[]
}

/**
 * STATUS_REGISTRY - React component
 * @returns React element
 */
const STATUS_REGISTRY: Record<string, { label: string; tone: string }> = {
  pending: {
    label: 'Pending',
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  confirmed: {
    label: 'Confirmed',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  processing: {
    label: 'Processing',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  shipped: {
    label: 'Shipped',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  delivered: {
    label: 'Delivered',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  refunded: {
    label: 'Refunded',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  dispute_open: {
    label: 'Dispute Open',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  escrow_held: {
    label: 'Escrow Held',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  pending_start: {
    label: 'Auction Start Pending',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  retry_available: {
    label: 'Retry Available',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  start_failed: {
    label: 'Auction Start Failed',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  auction_active: {
    label: 'Auction Active',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Card payment',
  blockchain: 'MetaMask on Sepolia',
/**
 * PAYMENT_METHOD_LABELS - React component
 * @returns React element
 */
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  escrow: 'Escrow',
  released: 'Released',
  refunded: 'Refunded',
/**
 * PAYMENT_STATUS_LABELS - React component
 * @returns React element
 */
}

export const ORDER_STATUS_FILTERS = [
  { label: 'All orders', value: 'all' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Dispute', value: 'dispute_open' },
] as const

/**
 * ORDER_STATUS_FILTERS - React component
 * @returns React element
 */
export const formatOrderDate = (value?: string | null) => {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

/**
 * formatOrderDate - Utility function
 * @returns void
 */
export const formatOrderDateTime = (value?: string | null) => {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const formatOrderMoney = (amount: number, currency: string) => {
/**
 * formatOrderDateTime - Utility function
 * @returns void
 */
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const normalizedAmount = Number(amount)
  return `${normalizedAmount.toFixed(currency === 'ETH' ? 6 : 2)} ${currency}`
}

export const getOrderStatusLabel = (status?: string | null) => {
  if (!status) {
    return 'Unknown'
  }

/**
 * formatOrderMoney - Utility function
 * @returns void
 */
  return STATUS_REGISTRY[status]?.label ?? status
}

export const getPaymentMethodLabel = (paymentMethod?: string | null) => {
  if (!paymentMethod) {
    return 'Pending payment'
  }

  return PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod
}

export const getPaymentStatusLabel = (paymentStatus?: string | null) => {
/**
 * normalizedAmount - Utility function
 * @returns void
 */
  if (!paymentStatus) {
    return 'Unknown'
  }

  return PAYMENT_STATUS_LABELS[paymentStatus.toLowerCase()] ?? paymentStatus
}

/**
 * getOrderStatusLabel - Utility function
 * @returns void
 */
export const getStatusTone = (status?: string | null) => {
  switch (status) {
    default:
      return STATUS_REGISTRY[status ?? '']?.tone ?? 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export const getPrimaryArtwork = (items?: OrderItemResponse[]) => {
  return items?.[0] ?? null
}

/**
 * getPaymentMethodLabel - Utility function
 * @returns void
 */
export const getOrderActorRole = (
  order: OrderResponse,
  currentUserId?: string | null,
  preferredScope?: OrdersWorkspaceScope | null,
): OrderActorRole => {
  const isSeller = order.items?.some((item) => item.sellerId === currentUserId) ?? false
  const isBuyer = order.collectorId === currentUserId

  if (preferredScope === 'seller' && isSeller) {
    return 'seller'
  }
/**
 * getPaymentStatusLabel - Utility function
 * @returns void
 */

  if (preferredScope === 'buyer' && isBuyer) {
    return 'buyer'
  }

  if (isBuyer) {
    return 'buyer'
  }

  return 'seller'
}
/**
 * getStatusTone - Utility function
 * @returns void
 */

export const canCancelOrder = (status?: string | null) =>
  ['pending', 'confirmed', 'processing', 'auction_active', 'escrow_held'].includes(status ?? '')

export const canMarkShipped = (status?: string | null) =>
  ['processing', 'escrow_held'].includes(status ?? '')

export const canConfirmDelivery = (status?: string | null) => status === 'shipped'

export const canOpenDispute = (order: OrderResponse) => {
/**
 * getPrimaryArtwork - Utility function
 * @returns void
 */
  if (order.status !== 'shipped' || !order.shippedAt) {
    return false
  }

  const shippedAt = new Date(order.shippedAt).getTime()
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
  return Date.now() - shippedAt <= fourteenDaysMs
/**
 * getOrderActorRole - Utility function
 * @returns void
 */
}

const getSellerAuctionLifecycle = (
  order: OrderResponse,
  role?: OrderActorRole,
): SellerAuctionStartStatusResponse | null => {
  if (role !== 'seller' || order.paymentMethod !== 'blockchain') {
    return null
/**
 * isSeller - Utility function
 * @returns void
 */
  }

  return order.sellerAuctionLifecycle ?? null
}
/**
 * isBuyer - Utility function
 * @returns void
 */

export const getDisplayOrderStatus = (order: OrderResponse, role?: OrderActorRole) => {
  return getSellerAuctionLifecycle(order, role)?.status ?? order.status
}

export const getNextActionLabel = (order: OrderResponse, role: OrderActorRole) => {
  const sellerAuctionLifecycle = getSellerAuctionLifecycle(order, role)

  if (sellerAuctionLifecycle) {
    switch (sellerAuctionLifecycle.status) {
      case 'pending_start':
        return sellerAuctionLifecycle.walletActionRequired ? 'Open MetaMask' : 'Review status'
      case 'retry_available':
        return 'Retry start auction'
      case 'start_failed':
        return sellerAuctionLifecycle.editAllowed ? 'Review terms' : 'Review failure'
      case 'auction_active':
        return 'View auction'
      default:
        break
/**
 * canCancelOrder - Utility function
 * @returns void
 */
    }
  }

  if (role === 'seller' && canMarkShipped(order.status)) {
    return 'Prepare shipment'
  }
/**
 * canMarkShipped - Utility function
 * @returns void
 */

  if (role === 'buyer' && canConfirmDelivery(order.status)) {
    return 'Confirm arrival'
  }

  if (role === 'buyer' && canOpenDispute(order)) {
/**
 * canConfirmDelivery - Utility function
 * @returns void
 */
    return 'Review delivery'
  }

  if (canCancelOrder(order.status)) {
    return 'Manage order'
/**
 * canOpenDispute - Utility function
 * @returns void
 */
  }

  if (order.status === 'delivered') {
    return 'Completed'
  }

  return 'View details'
}
/**
 * shippedAt - Utility function
 * @returns void
 */

export const getNextStepDescription = (order: OrderResponse, role: OrderActorRole) => {
  const sellerAuctionLifecycle = getSellerAuctionLifecycle(order, role)

/**
 * fourteenDaysMs - Utility function
 * @returns void
 */
  if (sellerAuctionLifecycle) {
    switch (sellerAuctionLifecycle.status) {
      case 'pending_start':
        return sellerAuctionLifecycle.walletActionRequired
          ? 'Confirm the createAuction transaction in MetaMask. Do not submit the auction again.'
          : 'This canonical auction request is still syncing between backend and blockchain.'
      case 'retry_available':
/**
 * getSellerAuctionLifecycle - Utility function
 * @returns void
 */
        return (
          sellerAuctionLifecycle.reasonMessage ??
          'Retry the same seller auction request from the create auction workspace.'
        )
      case 'start_failed':
        return sellerAuctionLifecycle.editAllowed
          ? (sellerAuctionLifecycle.reasonMessage ??
              'Review the failure reason and return to editable terms from the create auction workspace.')
          : (sellerAuctionLifecycle.reasonMessage ??
              'This attempt is blocked until the backend indicates a safe next action.')
      case 'auction_active':
        return 'This auction is live and now reflects authoritative backend and blockchain state.'
      default:
        break
/**
 * getDisplayOrderStatus - Utility function
 * @returns void
 */
    }
  }

  if (role === 'seller' && canMarkShipped(order.status)) {
    return 'Add carrier and tracking details when the artwork leaves your studio.'
  }

/**
 * getNextActionLabel - Utility function
 * @returns void
 */
  if (role === 'buyer' && canConfirmDelivery(order.status)) {
    return 'Confirm delivery once the artwork arrives in good condition.'
  }

/**
 * sellerAuctionLifecycle - Utility function
 * @returns void
 */
  if (role === 'buyer' && canOpenDispute(order)) {
    return 'If anything is wrong with the shipment, open a dispute within 14 days.'
  }

  if (canCancelOrder(order.status)) {
    return 'This order can still be cancelled while fulfillment is in progress.'
  }

  if (order.status === 'delivered') {
    return 'This order is complete and no further action is required.'
  }

  return 'No action is required right now. You can still review the full order history below.'
}

export const getShippingPresentation = (order: OrderResponse): ShippingPresentation => {
  const hasShipmentDetails = Boolean(order.carrier || order.trackingNumber || order.shippingMethod)

  switch (order.status) {
    case 'pending':
      return {
        title: 'Awaiting payment confirmation',
        description:
          'Shipping details will appear after the order is confirmed and ready for fulfillment.',
        emptyAddressLabel: 'No shipping address has been captured yet for this order.',
        records: [
          { label: 'Carrier', value: 'Assigned when the order is ready to ship' },
          { label: 'Tracking', value: 'Tracking will appear after dispatch' },
          { label: 'Shipping method', value: 'Selected during fulfillment' },
        ],
      }
    case 'confirmed':
    case 'processing':
      return {
        title: 'Preparing shipment',
        description:
          'The seller is preparing the artwork for dispatch. Shipment details will appear once the package leaves the studio.',
        emptyAddressLabel: 'No shipping address has been captured yet for this order.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'Assigned at dispatch' },
          { label: 'Tracking', value: order.trackingNumber ?? 'Tracking will appear after dispatch' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Finalized before dispatch' },
        ],
/**
 * getNextStepDescription - Utility function
 * @returns void
 */
      }
    case 'escrow_held':
      return {
        title: 'Awaiting seller shipment',
/**
 * sellerAuctionLifecycle - Utility function
 * @returns void
 */
        description:
          'Payment is secured in escrow. The next step is for the seller to hand the artwork to a carrier and add shipment details.',
        emptyAddressLabel: 'No shipping address has been captured yet for this order.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'Seller has not assigned a carrier yet' },
          { label: 'Tracking', value: order.trackingNumber ?? 'Tracking will appear after dispatch' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Selected once shipment is booked' },
        ],
      }
    case 'shipped':
      return {
        title: 'In transit',
        description:
          'The shipment is on its way. Use the recorded shipping details below to track the package.',
        emptyAddressLabel: 'No shipping address was captured for this order.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'Carrier not provided' },
          { label: 'Tracking', value: order.trackingNumber ?? 'Tracking number not provided' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Shipping method not provided' },
        ],
      }
    case 'dispute_open':
      return {
        title: 'Shipment under review',
        description: hasShipmentDetails
          ? 'A dispute is open for this shipped order. The recorded shipment details are preserved below for review.'
          : 'A dispute is open for this order. Shipment details were not recorded before the dispute was opened.',
        emptyAddressLabel: 'No shipping address was captured for this order.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'Carrier not recorded' },
          { label: 'Tracking', value: order.trackingNumber ?? 'Tracking number not recorded' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Shipping method not recorded' },
        ],
      }
    case 'delivered':
      return {
        title: 'Delivery completed',
        description:
          'The artwork has been delivered. The recorded shipment details remain available for reference.',
        emptyAddressLabel: 'No shipping address was captured for this order.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'Carrier not recorded' },
          { label: 'Tracking', value: order.trackingNumber ?? 'Tracking number not recorded' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Shipping method not recorded' },
        ],
      }
    case 'cancelled':
      return {
        title: 'Shipment closed',
        description:
          'This order was cancelled before completion, so no further shipment updates are expected.',
        emptyAddressLabel: 'No shipping address was captured before the order was cancelled.',
/**
 * getShippingPresentation - Utility function
 * @returns void
 */
        records: [
          { label: 'Carrier', value: order.carrier ?? 'No carrier will be assigned' },
          { label: 'Tracking', value: order.trackingNumber ?? 'No tracking will be added' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Shipping is no longer scheduled' },
/**
 * hasShipmentDetails - Utility function
 * @returns void
 */
        ],
      }
    case 'refunded':
      return {
        title: 'Shipment closed',
        description:
          'This order has been refunded, so shipment is no longer active. Any recorded shipment details are shown for reference only.',
        emptyAddressLabel: 'No shipping address was captured before the order was refunded.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'No active carrier' },
          { label: 'Tracking', value: order.trackingNumber ?? 'No active tracking record' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'No active shipping method' },
        ],
      }
    default:
      return {
        title: 'Shipping details',
        description:
          'Shipping information will update here as the order moves through fulfillment.',
        emptyAddressLabel: 'No shipping address was captured for this order yet.',
        records: [
          { label: 'Carrier', value: order.carrier ?? 'Not yet available' },
          { label: 'Tracking', value: order.trackingNumber ?? 'Not yet available' },
          { label: 'Shipping method', value: order.shippingMethod ?? 'Not yet available' },
        ],
      }
  }
}

export const buildOrderTimeline = (order: OrderResponse): OrderTimelineStep[] => {
  const terminalStatus = order.status
  const isCancelled = terminalStatus === 'cancelled'
  const isRefunded = terminalStatus === 'refunded'
  const isDisputed = terminalStatus === 'dispute_open'

  return [
    {
      key: 'created',
      label: 'Order placed',
      description: 'The order was created and is waiting for fulfillment.',
      date: order.createdAt,
      state: 'complete',
    },
    {
      key: 'confirmed',
      label: 'Payment confirmed',
      description: 'Payment was accepted and the order entered the fulfillment queue.',
      date: order.confirmedAt,
      state: order.confirmedAt ? 'complete' : order.status === 'pending' ? 'current' : 'upcoming',
    },
    {
      key: 'shipped',
      label: 'Shipment in transit',
      description: 'Carrier and tracking details were added for this shipment.',
      date: order.shippedAt,
      state: order.shippedAt
        ? 'complete'
        : ['processing', 'confirmed', 'escrow_held'].includes(order.status)
          ? 'current'
          : 'upcoming',
    },
    {
      key: 'delivered',
      label: isDisputed ? 'Delivery under review' : 'Delivered',
      description: isDisputed
        ? 'A delivery dispute is open and awaiting resolution.'
        : 'The buyer confirmed the artwork was received.',
      date: isDisputed ? order.disputeOpenedAt : order.deliveredAt,
      state: order.deliveredAt || order.disputeOpenedAt
        ? 'complete'
        : order.status === 'shipped'
          ? 'current'
          : 'upcoming',
    },
    {
      key: 'closed',
      label: isCancelled ? 'Cancelled' : isRefunded ? 'Refunded' : 'Complete',
      description: isCancelled
        ? order.cancelledReason ?? 'The order was cancelled before completion.'
        : isRefunded
          ? 'Funds were returned and the order was closed.'
          : 'No further action is required.',
      date: order.cancelledAt ?? order.disputeResolvedAt ?? order.deliveredAt,
      state:
        isCancelled || isRefunded || order.status === 'delivered'
          ? 'complete'
          : 'upcoming',
    },
  ]
}

/**
 * buildOrderTimeline - Utility function
 * @returns void
 */
/**
 * terminalStatus - Utility function
 * @returns void
 */
/**
 * isCancelled - Utility function
 * @returns void
 */
/**
 * isRefunded - Utility function
 * @returns void
 */
/**
 * isDisputed - Utility function
 * @returns void
 */