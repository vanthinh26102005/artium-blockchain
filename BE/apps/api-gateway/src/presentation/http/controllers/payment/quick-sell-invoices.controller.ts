import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/auth';
import {
  CreateInvoiceDto,
  InvoiceStatusDto,
  UpdateInvoiceDto,
} from '@app/common';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

type QuickSellCollectorInput = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

type QuickSellArtworkItemInput = {
  id: string;
  price: number;
  quantity?: number;
  discountPercent?: number;
  artworkName?: string;
  artworkImageUrl?: string;
};

type QuickSellCustomItemInput = {
  title: string;
  price: number;
  quantity?: number;
  discountPercent?: number;
};

type QuickSellCreateInvoiceRequest = {
  artworks: QuickSellArtworkItemInput[];
  customItems: QuickSellCustomItemInput[];
  collector: QuickSellCollectorInput;
  isQuickSell: boolean;
  isApplySalesTax?: boolean;
  taxZipcode?: string;
  taxPercent?: number;
  shippingFee?: number;
  isArtistHandlesShipping?: boolean;
  invoiceNumber?: string;
  currency?: string;
};

type QuickSellSendInvoiceRequest = {
  name?: string;
  email: string;
  message?: string;
  invoiceUrl?: string;
};

type QuickSellCreatePaymentIntentRequest = {
  email?: string;
  name?: string;
};

type QuickSellInvoiceItemResponse = {
  id: string;
  type: 'Artium-artwork' | 'custom-item';
  salePrice: number;
  quantity: number;
  discountPercentage: number;
  artworkId?: string;
  artworkName?: string;
  artworkImageUrl?: string;
  description?: string;
};

type QuickSellCreateInvoiceResponse = {
  id: string;
  invoiceCode: string;
  totalAmount: number;
  invoiceItems: QuickSellInvoiceItemResponse[];
};

type QuickSellInvoiceResponse = {
  id: string;
  invoiceCode: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxPercent: number;
  totalAmount: number;
  currency: string;
  collector?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  items: QuickSellInvoiceItemResponse[];
  createdAt?: string;
  updatedAt?: string;
};

type InvoiceItemEntity = {
  id: string;
  artworkId?: string | null;
  artworkTitle?: string | null;
  artworkImageUrl?: string | null;
  description: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal?: number | string | null;
  taxRate?: number | string;
  taxAmount?: number | string;
  discountAmount?: number | string | null;
  notes?: string | null;
};

type InvoiceEntity = {
  id: string;
  sellerId: string;
  collectorId?: string | null;
  customerEmail?: string | null;
  invoiceNumber?: string | null;
  status: string;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  currency: string;
  issueDate?: string | Date | null;
  dueDate?: string | Date | null;
  notes?: string | null;
  items?: InvoiceItemEntity[];
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
};

const DEFAULT_CURRENCY = 'USD';
const QUICK_SELL_DUE_DAYS = 30;

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const generateInvoiceNumber = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${yyyy}${mm}${dd}-${rand}`;
};

const buildNotes = (
  collector: QuickSellCollectorInput,
  taxZipcode?: string,
): string | undefined => {
  const parts: string[] = [];
  if (collector?.name) parts.push(`Buyer name: ${collector.name}`);
  if (collector?.email) parts.push(`Buyer email: ${collector.email}`);
  if (collector?.phone) parts.push(`Buyer phone: ${collector.phone}`);
  if (collector?.message) parts.push(`Buyer message: ${collector.message}`);
  if (taxZipcode) parts.push(`Tax zipcode: ${taxZipcode}`);
  return parts.length ? parts.join('\n') : undefined;
};

const extractNoteValue = (notes: string | null | undefined, label: string) => {
  if (!notes) return undefined;
  const line = notes
    .split('\n')
    .find((entry) => entry.toLowerCase().startsWith(label.toLowerCase()));
  if (!line) return undefined;
  return line.slice(label.length).trim();
};

const mapInvoiceToQuickSellResponse = (
  invoice: InvoiceEntity,
): QuickSellInvoiceResponse => {
  const items: QuickSellInvoiceItemResponse[] = (invoice.items || []).map(
    (item) => {
      const itemType: QuickSellInvoiceItemResponse['type'] = item.artworkId
        ? 'Artium-artwork'
        : 'custom-item';
      const quantity = item.quantity || 1;
      const unitPrice = toNumber(item.unitPrice);
      const lineTotal = unitPrice * quantity;
      const discountAmount = toNumber(item.discountAmount);
      const discountPercentage =
        lineTotal > 0 ? roundToTwo((discountAmount / lineTotal) * 100) : 0;

      return {
        id: item.id,
        type: itemType,
        salePrice: roundToTwo(unitPrice),
        quantity,
        discountPercentage,
        description: item.description,
        ...(item.artworkId ? { artworkId: item.artworkId } : {}),
        ...(item.artworkTitle ? { artworkName: item.artworkTitle } : {}),
        ...(item.artworkImageUrl
          ? { artworkImageUrl: item.artworkImageUrl }
          : {}),
      };
    },
  );

  const subtotal = roundToTwo(toNumber(invoice.subtotal));
  const discountAmount = roundToTwo(toNumber(invoice.discountAmount));
  const taxAmount = roundToTwo(toNumber(invoice.taxAmount));
  const taxableBase = subtotal - discountAmount;
  const taxPercent =
    taxableBase > 0 ? roundToTwo((taxAmount / taxableBase) * 100) : 0;

  const collectorName = extractNoteValue(invoice.notes, 'Buyer name:') || '';
  const collectorEmail =
    extractNoteValue(invoice.notes, 'Buyer email:') ||
    invoice.customerEmail ||
    '';
  const collectorPhone = extractNoteValue(invoice.notes, 'Buyer phone:');
  const collectorMessage = extractNoteValue(invoice.notes, 'Buyer message:');

  const collector =
    collectorName || collectorEmail || collectorPhone || collectorMessage
      ? {
          ...(collectorName ? { name: collectorName } : {}),
          ...(collectorEmail ? { email: collectorEmail } : {}),
          ...(collectorPhone ? { phone: collectorPhone } : {}),
          ...(collectorMessage ? { message: collectorMessage } : {}),
        }
      : undefined;

  const createdAt = invoice.createdAt
    ? new Date(invoice.createdAt).toISOString()
    : undefined;
  const updatedAt = invoice.updatedAt
    ? new Date(invoice.updatedAt).toISOString()
    : undefined;

  return {
    id: invoice.id,
    invoiceCode: invoice.invoiceNumber || '',
    status: invoice.status,
    subtotal,
    discountAmount,
    taxAmount,
    taxPercent,
    totalAmount: roundToTwo(toNumber(invoice.totalAmount)),
    currency: invoice.currency,
    ...(collector ? { collector } : {}),
    items,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
};

const mapInvoiceToQuickSellCreateResponse = (
  invoice: InvoiceEntity,
): QuickSellCreateInvoiceResponse => {
  const mapped = mapInvoiceToQuickSellResponse(invoice);
  return {
    id: mapped.id,
    invoiceCode: mapped.invoiceCode,
    totalAmount: mapped.totalAmount,
    invoiceItems: mapped.items,
  };
};

@ApiTags('Quick Sell Invoices')
@Controller('store/sale/invoice')
export class QuickSellInvoicesController {
  constructor(
    @Inject(MICROSERVICES.PAYMENTS_SERVICE)
    private readonly paymentsClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a quick-sell invoice' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 201,
    description: 'Quick-sell invoice created successfully',
  })
  async createQuickSellInvoice(
    @Req() req: any,
    @Body() payload: QuickSellCreateInvoiceRequest,
  ): Promise<QuickSellCreateInvoiceResponse> {
    const collectorEmail = payload?.collector?.email?.trim();
    if (!collectorEmail) {
      throw new BadRequestException('collector.email is required');
    }
    if (
      (!payload.artworks || payload.artworks.length === 0) &&
      (!payload.customItems || payload.customItems.length === 0)
    ) {
      throw new BadRequestException('At least one item is required');
    }

    const issueDate = new Date();
    const dueDate = addDays(issueDate, QUICK_SELL_DUE_DAYS);
    const invoiceNumber = payload.invoiceNumber || generateInvoiceNumber();
    const currency = payload.currency || DEFAULT_CURRENCY;
    const taxRate = payload.isApplySalesTax ? payload.taxPercent || 0 : 0;

    const items = [
      ...(payload.artworks || []).map((item) => {
        const quantity = item.quantity || 1;
        const unitPrice = item.price || 0;
        const lineTotal = unitPrice * quantity;
        const discountAmount = item.discountPercent
          ? roundToTwo((lineTotal * item.discountPercent) / 100)
          : 0;

        return {
          description: item.artworkName || 'Artwork',
          quantity,
          unitPrice,
          ...(item.id ? { artworkId: item.id } : {}),
          ...(item.artworkName ? { artworkTitle: item.artworkName } : {}),
          ...(item.artworkImageUrl
            ? { artworkImageUrl: item.artworkImageUrl }
            : {}),
          ...(taxRate ? { taxRate } : {}),
          ...(discountAmount ? { discountAmount } : {}),
        };
      }),
      ...(payload.customItems || []).map((item) => {
        const quantity = item.quantity || 1;
        const unitPrice = item.price || 0;
        const lineTotal = unitPrice * quantity;
        const discountAmount = item.discountPercent
          ? roundToTwo((lineTotal * item.discountPercent) / 100)
          : 0;

        return {
          description: item.title || 'Custom item',
          quantity,
          unitPrice,
          ...(taxRate ? { taxRate } : {}),
          ...(discountAmount ? { discountAmount } : {}),
        };
      }),
    ];

    if (!payload.isArtistHandlesShipping && payload.shippingFee) {
      items.push({
        description: 'Shipping',
        quantity: 1,
        unitPrice: payload.shippingFee,
      });
    }

    const notes = buildNotes(payload.collector, payload.taxZipcode);

    const data: CreateInvoiceDto = {
      sellerId: req.user?.id,
      customerEmail: collectorEmail,
      invoiceNumber,
      currency,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      ...(notes ? { notes } : {}),
      items,
    };

    const createdInvoice = await sendRpc<InvoiceEntity>(
      this.paymentsClient,
      { cmd: 'create_invoice' },
      data,
    );

    const updateData: UpdateInvoiceDto = {
      status: InvoiceStatusDto.SENT,
    };

    const invoice = await sendRpc<InvoiceEntity>(
      this.paymentsClient,
      { cmd: 'update_invoice' },
      { invoiceId: createdInvoice.id, data: updateData },
    );

    return mapInvoiceToQuickSellCreateResponse(invoice);
  }

  @Get('code/:invoiceCode')
  @ApiOperation({ summary: 'Get quick-sell invoice by code' })
  @ApiParam({
    name: 'invoiceCode',
    type: 'string',
    description: 'Invoice code',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
  })
  async getInvoiceByCode(
    @Param('invoiceCode') invoiceCode: string,
  ): Promise<QuickSellInvoiceResponse> {
    const invoice = await sendRpc<InvoiceEntity>(
      this.paymentsClient,
      { cmd: 'get_invoice_by_number' },
      { invoiceNumber: invoiceCode },
    );

    return mapInvoiceToQuickSellResponse(invoice);
  }

  @Post('code/:invoiceCode/send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a quick-sell invoice to buyer' })
  @ApiParam({
    name: 'invoiceCode',
    type: 'string',
    description: 'Invoice code',
  })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Invoice send queued successfully',
  })
  async sendInvoiceToBuyer(
    @Req() req: any,
    @Param('invoiceCode') invoiceCode: string,
    @Body() payload: QuickSellSendInvoiceRequest,
  ) {
    const email = payload?.email?.trim();
    if (!email) {
      throw new BadRequestException('email is required');
    }

    await sendRpc(
      this.paymentsClient,
      { cmd: 'send_invoice_to_buyer' },
      {
        invoiceNumber: invoiceCode,
        recipientEmail: email,
        recipientName: payload?.name,
        message: payload?.message,
        invoiceUrl: payload?.invoiceUrl,
        senderId: req.user?.id,
      },
    );

    return { success: true };
  }

  @Post('code/:invoiceCode/payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent for invoice' })
  @ApiParam({
    name: 'invoiceCode',
    type: 'string',
    description: 'Invoice code',
  })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  async createInvoicePaymentIntent(
    @Req() req: any,
    @Param('invoiceCode') invoiceCode: string,
    @Body() payload: QuickSellCreatePaymentIntentRequest,
  ) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'create_invoice_payment_intent' },
      {
        invoiceNumber: invoiceCode,
        userId: req.user?.id,
        buyerEmail: payload?.email,
        buyerName: payload?.name,
      },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a quick-sell invoice' })
  @ApiParam({ name: 'id', type: 'string', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully',
  })
  async cancelInvoice(@Param('id') invoiceId: string) {
    await sendRpc(
      this.paymentsClient,
      { cmd: 'cancel_invoice' },
      { invoiceId },
    );
    return { success: true };
  }
}
