import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderInvoiceAddressObject {
  @ApiPropertyOptional({ description: 'Recipient name' })
  name?: string | null;

  @ApiPropertyOptional({ description: 'Street address line 1' })
  line1?: string | null;

  @ApiPropertyOptional({ description: 'Street address line 2' })
  line2?: string | null;

  @ApiPropertyOptional({ description: 'City' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'State, province, or region' })
  state?: string | null;

  @ApiPropertyOptional({ description: 'Postal code' })
  postalCode?: string | null;

  @ApiPropertyOptional({ description: 'Country' })
  country?: string | null;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string | null;
}

export class OrderInvoicePartyObject {
  @ApiProperty({ description: 'Party user ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Display name when available' })
  name?: string | null;

  @ApiPropertyOptional({ description: 'Email when available' })
  email?: string | null;
}

export class OrderInvoicePaymentObject {
  @ApiProperty({ description: 'Order payment status' })
  paymentStatus: string;

  @ApiPropertyOptional({ description: 'Order payment method' })
  paymentMethod?: string | null;

  @ApiPropertyOptional({ description: 'Payment transaction ID' })
  paymentTransactionId?: string | null;

  @ApiPropertyOptional({ description: 'External payment intent ID' })
  paymentIntentId?: string | null;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  txHash?: string | null;

  @ApiPropertyOptional({ description: 'On-chain order ID' })
  onChainOrderId?: string | null;
}

export class OrderInvoiceItemObject {
  @ApiProperty({ description: 'Invoice item ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Artwork ID' })
  artworkId?: string | null;

  @ApiPropertyOptional({ description: 'Seller ID for this item' })
  sellerId?: string | null;

  @ApiPropertyOptional({ description: 'Artwork title' })
  artworkTitle?: string | null;

  @ApiPropertyOptional({ description: 'Artwork image URL' })
  artworkImageUrl?: string | null;

  @ApiProperty({ description: 'Line description' })
  description: string;

  @ApiProperty({ description: 'Quantity purchased' })
  quantity: number;

  @ApiProperty({ description: 'Unit price at purchase' })
  unitPrice: number;

  @ApiProperty({ description: 'Line total before invoice-level totals' })
  lineTotal: number;

  @ApiProperty({ description: 'Line tax amount' })
  taxAmount: number;

  @ApiProperty({ description: 'Line discount amount' })
  discountAmount: number;
}

export class OrderInvoiceObject {
  @ApiProperty({ description: 'Invoice ID' })
  id: string;

  @ApiProperty({ description: 'Stable invoice number' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Invoice lifecycle status' })
  status: string;

  @ApiProperty({ description: 'Order ID linked to the invoice' })
  orderId: string;

  @ApiProperty({ description: 'Order number linked to the invoice' })
  orderNumber: string;

  @ApiPropertyOptional({ description: 'Invoice issue date' })
  issueDate?: Date | string | null;

  @ApiPropertyOptional({ description: 'Invoice due date' })
  dueDate?: Date | string | null;

  @ApiPropertyOptional({ description: 'Payment completion timestamp' })
  paidAt?: Date | string | null;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Subtotal before tax, shipping, and discounts' })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount' })
  taxAmount: number;

  @ApiProperty({ description: 'Discount amount' })
  discountAmount: number;

  @ApiProperty({ description: 'Shipping amount' })
  shippingAmount: number;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Buyer details', type: OrderInvoicePartyObject })
  buyer: OrderInvoicePartyObject;

  @ApiProperty({ description: 'Seller details', type: OrderInvoicePartyObject })
  seller: OrderInvoicePartyObject;

  @ApiPropertyOptional({
    description: 'Shipping address',
    type: OrderInvoiceAddressObject,
  })
  shippingAddress?: OrderInvoiceAddressObject | Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Billing address',
    type: OrderInvoiceAddressObject,
  })
  billingAddress?: OrderInvoiceAddressObject | Record<string, any> | null;

  @ApiProperty({ description: 'Payment details', type: OrderInvoicePaymentObject })
  payment: OrderInvoicePaymentObject;

  @ApiProperty({ description: 'Invoice line items', type: [OrderInvoiceItemObject] })
  items: OrderInvoiceItemObject[];

  @ApiProperty({ description: 'Invoice creation timestamp' })
  createdAt: Date | string;

  @ApiProperty({ description: 'Invoice last update timestamp' })
  updatedAt: Date | string;
}

export class OrderInvoiceSourceItemDto {
  @ApiPropertyOptional({ description: 'Order item ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Artwork ID' })
  @IsOptional()
  @IsString()
  artworkId?: string | null;

  @ApiProperty({ description: 'Seller ID for the item' })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiPropertyOptional({ description: 'Artwork title' })
  @IsOptional()
  @IsString()
  artworkTitle?: string | null;

  @ApiPropertyOptional({ description: 'Artwork image URL' })
  @IsOptional()
  @IsString()
  artworkImageUrl?: string | null;

  @ApiProperty({ description: 'Purchased quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Price captured when the order was placed' })
  @IsNumber()
  priceAtPurchase: number;
}

export class OrderInvoiceSourceOrderDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Order number' })
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @ApiProperty({ description: 'Collector/buyer ID' })
  @IsNotEmpty()
  @IsString()
  collectorId: string;

  @ApiProperty({ description: 'Order status' })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({ description: 'Order payment status' })
  @IsNotEmpty()
  @IsString()
  paymentStatus: string;

  @ApiPropertyOptional({ description: 'Order payment method' })
  @IsOptional()
  @IsString()
  paymentMethod?: string | null;

  @ApiPropertyOptional({ description: 'Payment transaction ID' })
  @IsOptional()
  @IsString()
  paymentTransactionId?: string | null;

  @ApiPropertyOptional({ description: 'External payment intent ID' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string | null;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  @IsOptional()
  @IsString()
  txHash?: string | null;

  @ApiPropertyOptional({ description: 'On-chain order ID' })
  @IsOptional()
  @IsString()
  onChainOrderId?: string | null;

  @ApiProperty({ description: 'Subtotal before tax/shipping' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ description: 'Shipping cost' })
  @IsNumber()
  shippingCost: number;

  @ApiProperty({ description: 'Tax amount' })
  @IsNumber()
  taxAmount: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number | null;

  @ApiProperty({ description: 'Total amount' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Currency code' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Shipping address' })
  shippingAddress?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Billing address' })
  billingAddress?: Record<string, any> | null;

  @ApiProperty({ description: 'Source order items', type: [OrderInvoiceSourceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderInvoiceSourceItemDto)
  items: OrderInvoiceSourceItemDto[];

  @ApiProperty({ description: 'Order creation timestamp' })
  @IsDateString()
  createdAt: Date | string;

  @ApiProperty({ description: 'Order last update timestamp' })
  @IsDateString()
  updatedAt: Date | string;

  @ApiPropertyOptional({ description: 'Order confirmation timestamp' })
  @IsOptional()
  @IsDateString()
  confirmedAt?: Date | string | null;
}
