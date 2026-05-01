import type { OrderItemResponse, OrderResponse } from '@shared/apis/orderApis'

export type MockOnChainOrderRecord = {
  order: OrderResponse
  items: OrderItemResponse[]
}

const createArtworkPlaceholder = (title: string, accent: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 1200" fill="none">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="960" height="1200" fill="url(#g)" />
      <circle cx="760" cy="210" r="170" fill="rgba(255,255,255,0.12)" />
      <circle cx="240" cy="920" r="220" fill="rgba(255,255,255,0.08)" />
      <text x="72" y="980" fill="white" font-family="Arial, sans-serif" font-size="40" letter-spacing="8">ARTIUM DEMO</text>
      <text x="72" y="1060" fill="white" font-family="Arial, sans-serif" font-size="72" font-weight="700">${title}</text>
    </svg>`,
  )}`

const buildOrderItem = (overrides: Partial<OrderItemResponse>): OrderItemResponse => ({
  id: 'demo-item',
  orderId: 'demo-order',
  artworkId: 'demo-artwork',
  sellerId: 'demo-seller',
  priceAtPurchase: 0,
  quantity: 1,
  currency: 'ETH',
  artworkTitle: 'Untitled demo artwork',
  artworkImageUrl: createArtworkPlaceholder('Demo Artwork', '#1d4ed8'),
  artworkDescription: 'A preserved artwork snapshot used for the on-chain order detail demo.',
  platformFee: '0.15',
  sellerPayoutAmount: '2.85',
  payoutStatus: 'PENDING',
  payoutAt: null,
  createdAt: '2026-04-24T08:00:00.000Z',
  updatedAt: '2026-04-24T08:00:00.000Z',
  ...overrides,
})

const buildOrder = (overrides: Partial<OrderResponse>): OrderResponse => ({
  id: 'demo-order',
  collectorId: 'demo-collector',
  orderNumber: 'AUC-DEMO-000',
  status: 'escrow_held',
  subtotal: 0,
  shippingCost: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  currency: 'ETH',
  promoCode: null,
  shippingMethod: 'White glove delivery',
  trackingNumber: null,
  carrier: null,
  estimatedDeliveryDate: null,
  paymentStatus: 'ESCROW',
  paymentMethod: 'blockchain',
  paymentIntentId: null,
  paymentTransactionId: null,
  shippingAddress: {
    line1: '35 Nguyen Hue Boulevard',
    line2: 'Floor 12',
    city: 'Ho Chi Minh City',
    state: 'District 1',
    postalCode: '700000',
    country: 'Vietnam',
  },
  billingAddress: null,
  customerNotes: 'Demo customer note',
  internalNotes: null,
  cancelledReason: null,
  cancelledAt: null,
  confirmedAt: null,
  shippedAt: null,
  deliveredAt: null,
  onChainOrderId: '0',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  escrowState: 0,
  txHash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
  sellerWallet: '0xAbCdef1234567890aBCDef1234567890abCDef12',
  buyerWallet: '0x9876543210abcdef9876543210abcdef98765432',
  bidAmountWei: '0',
  disputeReason: null,
  disputeOpenedAt: null,
  disputeResolvedAt: null,
  disputeResolutionNotes: null,
  createdAt: '2026-04-24T08:00:00.000Z',
  updatedAt: '2026-04-24T08:30:00.000Z',
  ...overrides,
})

export const mockOnChainOrders: Record<string, MockOnChainOrderRecord> = {
  '42': {
    order: buildOrder({
      id: 'demo-order-42',
      collectorId: 'collector-demo-42',
      orderNumber: 'AUC-DEMO-042',
      subtotal: 3.25,
      totalAmount: 3.25,
      onChainOrderId: '42',
      escrowState: 0,
      status: 'escrow_held',
      paymentStatus: 'ESCROW',
      contractAddress: '0x42a4f0a3ef33fd594b1a4e4dcbd5f89a0a314242',
      txHash: '0x42f1ce5ec6e692f1eab1204fed64010f663133f366f1be7bb3a71fc339d4d042',
      sellerWallet: '0x42aa42bb42cc42dd42ee42ff42aa42bb42cc42dd',
      buyerWallet: '0x4200420042004200420042004200420042004200',
      bidAmountWei: '3250000000000000000',
      createdAt: '2026-04-24T09:10:00.000Z',
      updatedAt: '2026-04-24T09:12:00.000Z',
      confirmedAt: '2026-04-24T09:12:00.000Z',
      customerNotes: 'Collector wants a condition report attached after payment settlement.',
    }),
    items: [
      buildOrderItem({
        id: 'demo-item-42',
        orderId: 'demo-order-42',
        artworkId: 'artwork-demo-42',
        sellerId: 'seller-demo-42',
        priceAtPurchase: 3.25,
        artworkTitle: 'Cobalt Stillness',
        artworkImageUrl: createArtworkPlaceholder('Cobalt Stillness', '#2563eb'),
        artworkDescription:
          'A moody abstract composition captured as a snapshot for the auction settlement demo.',
        sellerPayoutAmount: '3.05',
        platformFee: '0.20',
      }),
    ],
  },
  '314': {
    order: buildOrder({
      id: 'demo-order-314',
      collectorId: 'collector-demo-314',
      orderNumber: 'AUC-DEMO-314',
      status: 'shipped',
      subtotal: 8.4,
      shippingCost: 0.45,
      totalAmount: 8.85,
      onChainOrderId: '314',
      escrowState: 2,
      carrier: 'DHL Express',
      trackingNumber: 'DHL-314-ARTIUM-DEMO',
      estimatedDeliveryDate: '2026-04-29T03:00:00.000Z',
      contractAddress: '0x3140f0a3ef33fd594b1a4e4dcbd5f89a0a314314',
      txHash: '0x314f1ce5ec6e692f1eab1204fed64010f663133f366f1be7bb3a71fc339d4d314',
      sellerWallet: '0x314a314b314c314d314e314f314a314b314c314d',
      buyerWallet: '0x3140314031403140314031403140314031403140',
      bidAmountWei: '8400000000000000000',
      createdAt: '2026-04-20T11:00:00.000Z',
      updatedAt: '2026-04-25T04:15:00.000Z',
      confirmedAt: '2026-04-20T11:05:00.000Z',
      shippedAt: '2026-04-25T04:15:00.000Z',
      customerNotes: 'Please keep the original certificate in a flat sleeve.',
    }),
    items: [
      buildOrderItem({
        id: 'demo-item-314',
        orderId: 'demo-order-314',
        artworkId: 'artwork-demo-314',
        sellerId: 'seller-demo-314',
        priceAtPurchase: 8.4,
        artworkTitle: 'Monolith at Dawn',
        artworkImageUrl: createArtworkPlaceholder('Monolith at Dawn', '#7c3aed'),
        artworkDescription:
          'A large-format architectural study used to demonstrate shipped escrow state.',
        sellerPayoutAmount: '7.98',
        platformFee: '0.42',
      }),
    ],
  },
  '9001': {
    order: buildOrder({
      id: 'demo-order-9001',
      collectorId: 'collector-demo-9001',
      orderNumber: 'AUC-DEMO-9001',
      status: 'dispute_open',
      subtotal: 12.75,
      shippingCost: 0.6,
      totalAmount: 13.35,
      onChainOrderId: '9001',
      escrowState: 3,
      carrier: 'FedEx International',
      trackingNumber: 'FDX-9001-ARTIUM-DEMO',
      estimatedDeliveryDate: '2026-04-23T07:00:00.000Z',
      contractAddress: '0x9001f0a3ef33fd594b1a4e4dcbd5f89a0a390011',
      txHash: '0x9001ce5ec6e692f1eab1204fed64010f663133f366f1be7bb3a71fc339d49001',
      sellerWallet: '0x9001900190019001900190019001900190019001',
      buyerWallet: '0x1111900190019001900190019001900190019001',
      bidAmountWei: '12750000000000000000',
      createdAt: '2026-04-17T14:20:00.000Z',
      updatedAt: '2026-04-24T06:45:00.000Z',
      confirmedAt: '2026-04-17T14:24:00.000Z',
      shippedAt: '2026-04-19T03:10:00.000Z',
      disputeReason: 'Artwork arrived with visible frame scratches and corner impact damage.',
      disputeOpenedAt: '2026-04-24T06:45:00.000Z',
      customerNotes: 'Buyer requested photo evidence before release of escrow.',
    }),
    items: [
      buildOrderItem({
        id: 'demo-item-9001',
        orderId: 'demo-order-9001',
        artworkId: 'artwork-demo-9001',
        sellerId: 'seller-demo-9001',
        priceAtPurchase: 12.75,
        artworkTitle: 'Signal Through Smoke',
        artworkImageUrl: createArtworkPlaceholder('Signal Through Smoke', '#db2777'),
        artworkDescription:
          'A vivid mixed-media work reserved for the dispute-state demo path.',
        sellerPayoutAmount: '12.10',
        platformFee: '0.65',
      }),
    ],
  },
}

export const getMockOnChainOrderRecord = (onChainOrderId: string): MockOnChainOrderRecord | null =>
  mockOnChainOrders[onChainOrderId] ?? null
