import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EscrowState,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from '@app/common/enums';

export class OrderObject {
  @ApiProperty({ description: 'Order UUID' })
  id: string;

  @ApiPropertyOptional({ description: 'Collector (buyer) UUID' })
  collectorId?: string | null;

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ description: 'Unique order number', example: 'AUC-1713000000-A1B2C3' })
  orderNumber: string;

  @ApiProperty({ description: 'Subtotal before tax/shipping' })
  subtotal: number;

  @ApiProperty({ description: 'Shipping cost' })
  shippingCost: number;

  @ApiProperty({ description: 'Tax amount' })
  taxAmount: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  discountAmount?: number | null;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Currency code', example: 'ETH' })
  currency: string;

  @ApiPropertyOptional({ description: 'Promo code applied' })
  promoCode?: string | null;

  @ApiPropertyOptional({ description: 'Shipping address (JSON)' })
  shippingAddress?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Billing address (JSON)' })
  billingAddress?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Shipping method' })
  shippingMethod?: string | null;

  @ApiPropertyOptional({ description: 'Tracking number / IPFS hash' })
  trackingNumber?: string | null;

  @ApiPropertyOptional({ description: 'Shipping carrier' })
  carrier?: string | null;

  @ApiPropertyOptional({ description: 'Estimated delivery date' })
  estimatedDeliveryDate?: Date | null;

  @ApiPropertyOptional({ description: 'Payment transaction UUID' })
  paymentTransactionId?: string | null;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: OrderPaymentMethod,
  })
  paymentMethod?: OrderPaymentMethod | null;

  @ApiProperty({
    description: 'Payment status',
    enum: OrderPaymentStatus,
  })
  paymentStatus: OrderPaymentStatus;

  @ApiPropertyOptional({ description: 'Stripe/external payment intent ID' })
  paymentIntentId?: string | null;

  @ApiPropertyOptional({ description: 'Customer notes' })
  customerNotes?: string | null;

  @ApiPropertyOptional({ description: 'Internal admin notes' })
  internalNotes?: string | null;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  cancelledReason?: string | null;

  @ApiPropertyOptional({ description: 'When the order was cancelled' })
  cancelledAt?: Date | null;

  @ApiPropertyOptional({ description: 'When the order was confirmed' })
  confirmedAt?: Date | null;

  @ApiPropertyOptional({ description: 'When the order was shipped' })
  shippedAt?: Date | null;

  @ApiPropertyOptional({ description: 'When delivery was confirmed' })
  deliveredAt?: Date | null;

  // ── Blockchain / Auction fields ──

  @ApiPropertyOptional({
    description: 'On-chain auction order ID from smart contract',
    example: '42',
  })
  onChainOrderId?: string | null;

  @ApiPropertyOptional({
    description: 'Smart contract address (Ethereum)',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  contractAddress?: string | null;

  @ApiPropertyOptional({
    description: 'Blockchain chain ID that produced the order event',
    example: '11155111',
  })
  chainId?: string | null;

  @ApiPropertyOptional({
    description: 'On-chain escrow state',
    enum: EscrowState,
  })
  escrowState?: EscrowState | null;

  @ApiPropertyOptional({
    description: 'Blockchain transaction hash',
    example: '0xabc...def',
  })
  txHash?: string | null;

  @ApiPropertyOptional({
    description: 'Seller Ethereum wallet address',
    example: '0x1234...5678',
  })
  sellerWallet?: string | null;

  @ApiPropertyOptional({
    description: 'Buyer (highest bidder) Ethereum wallet address',
    example: '0xabcd...ef01',
  })
  buyerWallet?: string | null;

  @ApiPropertyOptional({
    description: 'Highest bid amount in wei (uint256)',
    example: '1000000000000000000',
  })
  bidAmountWei?: string | null;

  @ApiPropertyOptional({
    description: 'Reason the buyer opened a dispute',
    example: 'Artwork arrived damaged — scratches on the frame',
  })
  disputeReason?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the dispute was opened',
  })
  disputeOpenedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the dispute was resolved',
  })
  disputeResolvedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Arbiter notes on dispute resolution',
    example: 'Evidence confirms artwork was damaged during shipping',
  })
  disputeResolutionNotes?: string | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;
}
