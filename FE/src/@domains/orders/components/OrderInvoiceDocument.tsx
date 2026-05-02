import Image from 'next/image'
import type { OrderInvoiceResponse } from '@shared/apis/orderApis'
import { cn } from '@shared/lib/utils'
import {
  formatInvoiceAddressLines,
  formatInvoiceDate,
  formatInvoiceField,
  formatInvoiceMoney,
  formatInvoicePartyField,
  INVOICE_MISSING_FIELD_COPY,
} from '../utils/orderInvoicePresentation'

type OrderInvoiceDocumentProps = {
  invoice: OrderInvoiceResponse
  className?: string
}

const FieldBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
      {label}
    </p>
    <p className="mt-1 break-words text-sm text-slate-900">{value}</p>
  </div>
)

const AddressBlock = ({ title, lines }: { title: string; lines: string[] }) => (
  <div className="rounded-[16px] border border-slate-200 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
      {title}
    </p>
    <div className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
      {lines.length > 0 ? (
        lines.map((line) => <p key={`${title}-${line}`}>{line}</p>)
      ) : (
        <p>{INVOICE_MISSING_FIELD_COPY}</p>
      )}
    </div>
  </div>
)

const TotalRow = ({
  label,
  value,
  currency,
  strong,
}: {
  label: string
  value: number
  currency: string
  strong?: boolean
}) => (
  <div
    className={cn(
      'flex items-center justify-between gap-6 text-sm',
      strong && 'border-t border-slate-200 pt-4 text-base font-semibold text-slate-900',
    )}
  >
    <span className={strong ? 'text-slate-900' : 'text-slate-500'}>{label}</span>
    <span className={strong ? 'text-slate-900' : 'font-medium text-slate-900'}>
      {formatInvoiceMoney(value, currency)}
    </span>
  </div>
)

export const OrderInvoiceDocument = ({ invoice, className }: OrderInvoiceDocumentProps) => {
  const buyerNameRedacted = invoice.buyer.name === undefined
  const buyerEmailRedacted = invoice.buyer.email === undefined
  const sellerNameRedacted = invoice.seller.name === undefined
  const sellerEmailRedacted = invoice.seller.email === undefined
  const shippingLines = formatInvoiceAddressLines(invoice.shippingAddress)
  const billingLines = formatInvoiceAddressLines(invoice.billingAddress)

  return (
    <article
      className={cn(
        'order-invoice-print-root bg-white text-slate-900',
        'mx-auto w-full max-w-[960px] rounded-[20px] border border-slate-200 p-5 shadow-sm sm:p-8',
        className,
      )}
    >
      <header className="order-invoice-document-header flex flex-col gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Artium invoice
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold leading-[1.2] text-slate-950">
              {invoice.invoiceNumber}
            </h1>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {formatInvoiceField(invoice.status)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Order {invoice.orderNumber}
          </p>
        </div>

        <div className="order-invoice-document-summary grid gap-4 rounded-[16px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 lg:min-w-[420px]">
          <FieldBlock label="Issue date" value={formatInvoiceDate(invoice.issueDate ?? invoice.createdAt)} />
          <FieldBlock label="Paid date" value={formatInvoiceDate(invoice.paidAt)} />
          <FieldBlock label="Total" value={formatInvoiceMoney(invoice.totalAmount, invoice.currency)} />
        </div>
      </header>

      <section className="order-invoice-party-grid grid gap-4 py-6 lg:grid-cols-2">
        <div className="rounded-[16px] border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Buyer
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p className="font-medium text-slate-900">
              {formatInvoicePartyField(invoice.buyer.name, buyerNameRedacted)}
            </p>
            <p>{formatInvoicePartyField(invoice.buyer.email, buyerEmailRedacted)}</p>
          </div>
        </div>

        <div className="rounded-[16px] border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Seller
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p className="font-medium text-slate-900">
              {formatInvoicePartyField(invoice.seller.name, sellerNameRedacted)}
            </p>
            <p>{formatInvoicePartyField(invoice.seller.email, sellerEmailRedacted)}</p>
          </div>
        </div>
      </section>

      <section className="order-invoice-address-grid grid gap-4 pb-6 lg:grid-cols-2">
        <AddressBlock title="Shipping" lines={shippingLines} />
        <AddressBlock title="Billing" lines={billingLines} />
      </section>

      <section className="border-t border-slate-200 py-6">
        <div className="order-invoice-line-table hidden rounded-[16px] border border-slate-200 lg:block">
          <div className="grid grid-cols-[minmax(0,1.7fr)_0.5fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span>Artwork</span>
            <span>Qty</span>
            <span>Unit</span>
            <span>Tax</span>
            <span>Discount</span>
            <span className="text-right">Line total</span>
          </div>
          {invoice.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[minmax(0,1.7fr)_0.5fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0"
            >
              <div className="flex min-w-0 gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.artworkImageUrl ? (
                    <Image
                      src={item.artworkImageUrl}
                      alt={item.artworkTitle ?? item.description}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Art
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {formatInvoiceField(item.artworkTitle ?? item.description)}
                  </p>
                  <p className="mt-1 text-slate-500">{formatInvoiceField(item.description)}</p>
                </div>
              </div>
              <span>{item.quantity}</span>
              <span>{formatInvoiceMoney(item.unitPrice, invoice.currency)}</span>
              <span>{formatInvoiceMoney(item.taxAmount, invoice.currency)}</span>
              <span>{formatInvoiceMoney(item.discountAmount, invoice.currency)}</span>
              <span className="text-right font-medium text-slate-900">
                {formatInvoiceMoney(item.lineTotal, invoice.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="order-invoice-line-cards space-y-4 lg:hidden">
          {invoice.items.map((item) => (
            <div key={item.id} className="rounded-[16px] border border-slate-200 p-4">
              <p className="font-medium text-slate-900">
                {formatInvoiceField(item.artworkTitle ?? item.description)}
              </p>
              <p className="mt-1 text-sm text-slate-500">{formatInvoiceField(item.description)}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <FieldBlock label="Quantity" value={String(item.quantity)} />
                <FieldBlock label="Unit" value={formatInvoiceMoney(item.unitPrice, invoice.currency)} />
                <FieldBlock label="Tax" value={formatInvoiceMoney(item.taxAmount, invoice.currency)} />
                <FieldBlock label="Discount" value={formatInvoiceMoney(item.discountAmount, invoice.currency)} />
                <div className="col-span-2">
                  <FieldBlock label="Line total" value={formatInvoiceMoney(item.lineTotal, invoice.currency)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="order-invoice-payment-grid grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-invoice-payment-fields grid gap-4 sm:grid-cols-2">
          <FieldBlock label="Payment status" value={formatInvoiceField(invoice.payment.paymentStatus)} />
          <FieldBlock label="Payment method" value={formatInvoiceField(invoice.payment.paymentMethod)} />
          <FieldBlock label="Transaction" value={formatInvoiceField(invoice.payment.paymentTransactionId)} />
          <FieldBlock label="Payment intent" value={formatInvoiceField(invoice.payment.paymentIntentId)} />
          <FieldBlock label="Wallet tx hash" value={formatInvoiceField(invoice.payment.txHash)} />
          <FieldBlock label="On-chain order" value={formatInvoiceField(invoice.payment.onChainOrderId)} />
        </div>

        <div className="space-y-3 rounded-[16px] border border-slate-200 bg-slate-50 p-4">
          <TotalRow label="Subtotal" value={invoice.subtotal} currency={invoice.currency} />
          <TotalRow label="Tax" value={invoice.taxAmount} currency={invoice.currency} />
          <TotalRow label="Discount" value={invoice.discountAmount} currency={invoice.currency} />
          <TotalRow label="Shipping" value={invoice.shippingAmount} currency={invoice.currency} />
          <TotalRow label="Total" value={invoice.totalAmount} currency={invoice.currency} strong />
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-900">Artium</span>
        <span className="mx-2">/</span>
        <span>Generated from backend invoice data</span>
      </footer>
    </article>
  )
}
