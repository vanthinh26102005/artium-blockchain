import type { OrderInvoiceResponse } from '@shared/apis/orderApis'
import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import {
  canPrintOrderInvoice,
  type OrderInvoiceAvailability,
} from '../utils/orderInvoicePresentation'
import { OrderInvoiceDocument } from './OrderInvoiceDocument'
import { OrderInvoiceStatusChip } from './OrderInvoiceStatusChip'

type OrderInvoicePreviewModalProps = {
  open: boolean
  invoice: OrderInvoiceResponse | null
  availability: OrderInvoiceAvailability
  onOpenChange: (open: boolean) => void
  onPrint: () => void
  onRetry: () => void
}

export const OrderInvoicePreviewModal = ({
  open,
  invoice,
  availability,
  onOpenChange,
  onPrint,
  onRetry,
}: OrderInvoicePreviewModalProps) => {
  const isReady = availability.state === 'ready' && Boolean(invoice)
  const canPrint = canPrintOrderInvoice(availability)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="9xl"
        className="order-invoice-modal-frame h-[100dvh] max-h-[100dvh] overflow-hidden rounded-none border border-slate-200 bg-[#F7F8FA] p-0 shadow-2xl sm:h-[92vh] sm:max-h-[92vh] sm:rounded-[28px]"
        closeButtonClassName="order-invoice-screen-only"
      >
        <DialogTitle className="sr-only">
          {invoice ? `Invoice ${invoice.invoiceNumber}` : 'Invoice preview'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Preview and print the backend invoice for this order.
        </DialogDescription>

        <div className="order-invoice-screen-only flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 pr-16">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Invoice preview
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {invoice?.invoiceNumber ?? 'Invoice'}
              </h2>
              <OrderInvoiceStatusChip availability={availability} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
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
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-900"
              disabled={!canPrint}
              onClick={onPrint}
            >
              Print invoice
            </Button>
          </div>
        </div>

        <div className="h-[calc(100dvh-81px)] overflow-y-auto px-4 py-5 sm:h-[calc(92vh-81px)] sm:px-6 lg:px-8">
          {isReady && invoice ? (
            <OrderInvoiceDocument invoice={invoice} />
          ) : availability.state === 'checking' ? (
            <div className="mx-auto flex min-h-[360px] max-w-xl items-center justify-center rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div>
                <p className="text-lg font-semibold text-slate-900">Checking invoice</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The invoice preview will appear as soon as backend data is ready.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex min-h-[360px] max-w-xl items-center justify-center rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div>
                <p className="text-lg font-semibold text-slate-900">Invoice unavailable</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{availability.description}</p>
                {availability.state === 'retry' ? (
                  <Button type="button" className="mt-5" onClick={onRetry}>
                    Retry invoice
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
