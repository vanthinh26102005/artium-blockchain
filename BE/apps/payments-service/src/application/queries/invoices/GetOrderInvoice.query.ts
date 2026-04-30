import { OrderInvoiceSourceOrderDto } from '@app/common/dtos/payments/invoices/order-invoice.dto';

export class GetOrderInvoiceQuery {
  constructor(public readonly sourceOrder: OrderInvoiceSourceOrderDto) {}
}
