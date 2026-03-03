import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  InvoiceStatus,
  NotificationTriggerEvent,
  RpcExceptionHelper,
  ITransactionService,
} from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { IInvoiceRepository } from '../../../../domain/interfaces';
import { SendInvoiceToBuyerCommand } from '../SendInvoiceToBuyer.command';

const trimOrUndefined = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const buildInvoiceUrl = (
  invoiceNumber?: string,
  overrideUrl?: string,
): string | undefined => {
  const override = trimOrUndefined(overrideUrl);
  if (override) return override;
  if (!invoiceNumber) return undefined;
  const baseUrl = normalizeBaseUrl(
    process.env.CLIENT_URL || 'http://localhost:3000',
  );
  return `${baseUrl}/artist/invoices/checkout/${invoiceNumber}?buyer=true`;
};

const extractNoteValue = (
  notes: string | null | undefined,
  label: string,
): string | undefined => {
  if (!notes) return undefined;
  const line = notes
    .split('\n')
    .find((entry) => entry.toLowerCase().startsWith(label.toLowerCase()));
  if (!line) return undefined;
  return line.slice(label.length).trim();
};

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const roundToTwo = (value: number): number =>
  Math.round(value * 100) / 100;

const formatCurrency = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${roundToTwo(value).toFixed(2)}`;
  }
};

const formatDate = (value?: Date | string | null): string | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

@CommandHandler(SendInvoiceToBuyerCommand)
export class SendInvoiceToBuyerHandler
  implements ICommandHandler<SendInvoiceToBuyerCommand>
{
  private readonly logger = new Logger(SendInvoiceToBuyerHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: SendInvoiceToBuyerCommand): Promise<{ success: true }> {
    const {
      invoiceId,
      invoiceNumber,
      recipientEmail,
      recipientName,
      message,
      invoiceUrl,
      senderId,
    } = command.data;

    if (!invoiceId && !invoiceNumber) {
      throw RpcExceptionHelper.badRequest(
        'invoiceId or invoiceNumber is required',
      );
    }

    const invoice = invoiceId
      ? await this.invoiceRepo.findById(invoiceId)
      : await this.invoiceRepo.findByInvoiceNumber(invoiceNumber as string);

    if (!invoice) {
      throw RpcExceptionHelper.notFound('Invoice not found');
    }

    if (senderId && invoice.sellerId !== senderId) {
      throw RpcExceptionHelper.forbidden(
        'You are not allowed to send this invoice',
      );
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw RpcExceptionHelper.badRequest('Cannot send a cancelled invoice');
    }

    const resolvedEmail =
      trimOrUndefined(recipientEmail) ||
      trimOrUndefined(invoice.customerEmail || undefined);
    if (!resolvedEmail) {
      throw RpcExceptionHelper.badRequest('recipientEmail is required');
    }

    const resolvedInvoiceNumber =
      trimOrUndefined(invoice.invoiceNumber || undefined) ||
      trimOrUndefined(invoiceNumber || undefined) ||
      invoice.id;

    const resolvedInvoiceUrl = buildInvoiceUrl(
      resolvedInvoiceNumber,
      invoiceUrl,
    );
    const noteBuyerName = trimOrUndefined(
      extractNoteValue(invoice.notes ?? null, 'Buyer name:'),
    );
    const noteBuyerEmail = trimOrUndefined(
      extractNoteValue(invoice.notes ?? null, 'Buyer email:'),
    );
    const noteBuyerPhone = trimOrUndefined(
      extractNoteValue(invoice.notes ?? null, 'Buyer phone:'),
    );
    const noteBuyerMessage = trimOrUndefined(
      extractNoteValue(invoice.notes ?? null, 'Buyer message:'),
    );
    const noteTaxZipcode = trimOrUndefined(
      extractNoteValue(invoice.notes ?? null, 'Tax zipcode:'),
    );

    const buyerName = trimOrUndefined(recipientName) || noteBuyerName;
    const buyerEmail = noteBuyerEmail || resolvedEmail;
    const buyerPhone = noteBuyerPhone;
    const buyerMessage = trimOrUndefined(message) || noteBuyerMessage;

    const safeMessage = buyerMessage
      ? escapeHtml(buyerMessage).replace(/\r?\n/g, '<br/>')
      : undefined;
    const firstName = buyerName?.split(' ')[0];

    const title = resolvedInvoiceNumber
      ? `Invoice ${resolvedInvoiceNumber}`
      : 'Invoice from Artium';

    const currency = invoice.currency || 'USD';
    const subtotal = roundToTwo(toNumber(invoice.subtotal));
    const discountAmount = roundToTwo(toNumber(invoice.discountAmount));
    const taxAmount = roundToTwo(toNumber(invoice.taxAmount));
    const totalAmount = roundToTwo(toNumber(invoice.totalAmount));
    const taxableBase = subtotal - discountAmount;
    const taxPercent =
      taxableBase > 0 ? roundToTwo((taxAmount / taxableBase) * 100) : 0;

    const items = (invoice.items || []).map((item) => {
      const quantity = item.quantity || 1;
      const unitPrice = toNumber(item.unitPrice);
      const lineTotal = roundToTwo(unitPrice * quantity);
      const discount = roundToTwo(toNumber(item.discountAmount));
      return {
        description: item.description,
        quantity,
        unitPrice,
        lineTotal,
        discount,
        unitPriceDisplay: formatCurrency(unitPrice, currency),
        lineTotalDisplay: formatCurrency(lineTotal, currency),
        discountDisplay: formatCurrency(discount, currency),
        hasDiscount: discount > 0,
      };
    });

    await this.transactionService.execute(async (manager) => {
      if (resolvedEmail !== invoice.customerEmail) {
        await this.invoiceRepo.update(
          invoice.id,
          { customerEmail: resolvedEmail },
          manager,
        );
      }

      if (invoice.status !== InvoiceStatus.PAID) {
        await this.invoiceRepo.update(
          invoice.id,
          {
            status: InvoiceStatus.SENT,
            sentAt: new Date(),
          },
          manager,
        );
      }

      await this.outboxService.createOutboxMessage(
        {
          aggregateType: 'invoice',
          aggregateId: invoice.id,
          eventType: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
          payload: {
            recipientEmail: resolvedEmail,
            title,
            subject: title,
            template: 'invoice',
            context: {
              ...(firstName ? { firstName } : {}),
              ...(resolvedInvoiceNumber
                ? { invoiceNumber: resolvedInvoiceNumber }
                : {}),
              ...(resolvedInvoiceUrl
                ? { invoiceUrl: resolvedInvoiceUrl }
                : {}),
              ...(buyerName ? { buyerName } : {}),
              ...(buyerEmail ? { buyerEmail } : {}),
              ...(buyerPhone ? { buyerPhone } : {}),
              ...(safeMessage ? { messageHtml: safeMessage } : {}),
              ...(noteTaxZipcode ? { taxZipcode: noteTaxZipcode } : {}),
              ...(items.length ? { items } : {}),
              subtotalDisplay: formatCurrency(subtotal, currency),
              discountDisplay: formatCurrency(discountAmount, currency),
              taxDisplay: formatCurrency(taxAmount, currency),
              totalDisplay: formatCurrency(totalAmount, currency),
              currency,
              ...(taxPercent > 0 ? { taxPercent } : {}),
              ...(formatDate(invoice.issueDate)
                ? { issueDate: formatDate(invoice.issueDate) }
                : {}),
              ...(formatDate(invoice.dueDate)
                ? { dueDate: formatDate(invoice.dueDate) }
                : {}),
            },
            body: title,
            metadata: {
              invoiceId: invoice.id,
              invoiceNumber: resolvedInvoiceNumber,
              ...(resolvedInvoiceUrl ? { invoiceUrl: resolvedInvoiceUrl } : {}),
              ...(senderId ? { senderId } : {}),
            },
            triggerEvent: NotificationTriggerEvent.INVOICE_CREATED,
            userId: invoice.collectorId || undefined,
          },
          exchange: ExchangeName.NOTIFICATION_EVENTS,
          routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
        },
        manager,
      );
    });

    this.logger.log(
      `Queued invoice email: invoiceId=${invoice.id}, email=${resolvedEmail}`,
    );

    return { success: true };
  }
}
