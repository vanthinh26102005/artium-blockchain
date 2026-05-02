import type { RefObject } from 'react'
import type { OrderInvoiceResponse } from '@shared/apis/orderApis'
import { Button } from '@shared/components/ui/button'
import {
  canPrintOrderInvoice,
  type OrderInvoiceAvailability,
} from '../utils/orderInvoicePresentation'
import { OrderInvoiceStatusChip } from './OrderInvoiceStatusChip'

type OrderInvoicePanelProps = {
  availability: OrderInvoiceAvailability
  invoice: OrderInvoiceResponse | null
  onPreview: () => void
  onPrint: () => void
  onRetry: () => void
  panelRef?: RefObject<HTMLDivElement | null>
}

export const OrderInvoicePanel = ({
  availability,
  invoice,
  onPreview,
  onPrint,
  onRetry,
  panelRef,
}: OrderInvoicePanelProps) => {
  const canPrint = canPrintOrderInvoice(availability)

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Document
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Invoice</h2>
          <OrderInvoiceStatusChip availability={availability} />
        </div>
        <p className="text-sm leading-6 text-slate-500">{availability.description}</p>
      </div>

      {invoice ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
          <p className="mt-1">Order {invoice.orderNumber}</p>
        </div>
      ) : availability.reason ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {availability.reason}
        </div>
      ) : null}

      <div className="order-invoice-screen-only mt-5 flex flex-wrap gap-3">
        <Button type="button" disabled={!availability.canPreview} onClick={onPreview}>
          Preview invoice
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-slate-200 text-slate-900"
          disabled={!canPrint}
          onClick={onPrint}
        >
          Print invoice
        </Button>
        {availability.state === 'retry' ? (
          <Button
            type="button"
            variant="outline"
            className="border-rose-200 text-rose-700"
            onClick={onRetry}
          >
            Retry invoice
          </Button>
        ) : null}
      </div>
    </div>
  )
}
