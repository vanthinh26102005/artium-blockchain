// react
import Link from 'next/link'

// icons
import { AlertCircle, Check, Clock, Package, ShoppingBag } from 'lucide-react'

// @shared
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @domains - checkout
import type { ArtworkForCheckout } from '../types/buyerCheckoutTypes'

type CheckoutSuccessScreenProps = {
  orderNumber: string
  artwork: ArtworkForCheckout
  totalPaid: number
  paymentMethod: 'card' | 'wallet'
  status: 'processing' | 'succeeded' | 'failed'
  failureReason?: string | null
  onContinueShopping: () => void
}

/**
 * CheckoutSuccessScreen - React component
 * @returns React element
 */
export const CheckoutSuccessScreen = ({
  orderNumber,
  artwork,
  totalPaid,
  paymentMethod,
  status,
  failureReason,
  onContinueShopping,
}: CheckoutSuccessScreenProps) => {
  const formattedTotal = `$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const isProcessing = status === 'processing'
  const isFailed = status === 'failed'
  /**
   * formattedTotal - Utility function
   * @returns void
   */
  const badgeClassName = isProcessing
    ? 'border-amber-200 bg-amber-50'
    : isFailed
      ? 'border-red-200 bg-red-50'
      : /**
         * isProcessing - Utility function
         * @returns void
         */
        'border-green-200 bg-green-50'
  const iconContainerClassName = isProcessing
    ? 'bg-amber-100'
    : isFailed
      ? /**
         * isFailed - Utility function
         * @returns void
         */
        'bg-red-100'
      : 'bg-green-100'
  const titleClassName = isProcessing
    ? 'text-amber-900'
    : /**
       * badgeClassName - Utility function
       * @returns void
       */
      isFailed
      ? 'text-red-900'
      : 'text-green-900'
  const descriptionClassName = isProcessing
    ? 'text-amber-800'
    : isFailed
      ? 'text-red-800'
      : 'text-green-800'
  /**
   * iconContainerClassName - Utility function
   * @returns void
   */
  const title = isProcessing
    ? 'Transaction Submitted'
    : isFailed
      ? 'Payment Needs Attention'
      : 'Payment Successful'
  const description = isProcessing
    ? 'Your Sepolia transaction was submitted. We will update this order automatically after backend confirmation.'
    : isFailed
      ? /**
         * titleClassName - Utility function
         * @returns void
         */
        failureReason ||
        'We could not confirm the wallet payment. Please review the order in your orders workspace.'
      : 'Thank you for your purchase!'
  const nextSteps = isProcessing
    ? [
        'We are verifying the Sepolia transaction in the background.',
        'This page will refresh automatically when the payment is confirmed.',
        'You can also track the order from your private orders workspace.',
      ]
    : /**
       * descriptionClassName - Utility function
       * @returns void
       */
      isFailed
      ? [
          'The order was created, but the wallet payment has not been confirmed.',
          'Review the order in your workspace before retrying payment or contacting support.',
          'Do not send a second transaction unless the order still shows unpaid.',
        ]
      : [
          'The artist has been notified and will confirm your order.',
          /**
           * title - Utility function
           * @returns void
           */
          'Your artwork will be prepared for shipment within 3–5 business days.',
          "You'll receive a tracking number via email once it's shipped.",
        ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#FDFDFD] px-4 pb-16 pt-12 font-sans text-[#191414]">
      {/* Brand header */}
      <div className="mb-10 w-full max-w-2xl">
        /** * description - Utility function * @returns void */
        <Link href="/" className="text-[18px] font-bold tracking-tight text-[#191414]">
          Artium
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Status badge */}
        <div
          /**
           * nextSteps - Utility function
           * @returns void
           */
          className={cn(
            'rounded-2xl border p-8 text-center duration-500 animate-in fade-in zoom-in',
            badgeClassName,
          )}
        >
          <div
            className={cn(
              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              iconContainerClassName,
            )}
          >
            {isProcessing ? (
              <Clock className={cn('h-8 w-8', 'text-amber-600')} />
            ) : isFailed ? (
              <AlertCircle className="h-8 w-8 text-red-600" strokeWidth={2.5} />
            ) : (
              <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
            )}
          </div>

          <h1 className={cn('text-2xl font-bold', titleClassName)}>{title}</h1>

          <p className={cn('mt-2 text-sm', descriptionClassName)}>{description}</p>

          <p className="mt-3 text-[13px] font-medium text-[#595959]">
            Order <span className="font-mono font-bold text-[#191414]">#{orderNumber}</span>
          </p>
        </div>

        {/* Artwork row */}
        <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
            <img
              src={artwork.coverUrl}
              alt={artwork.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-[#191414]">{artwork.title}</p>
            <p className="mt-0.5 truncate text-[13px] text-[#595959]">{artwork.artistName}</p>
            {artwork.medium && (
              <p className="mt-0.5 truncate text-[12px] text-[#989898]">{artwork.medium}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[15px] font-bold text-[#191414]">{formattedTotal}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[#989898]">
              {paymentMethod === 'wallet' ? 'ETH' : 'Card'}
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-[#191414]">
            <Package className="h-4 w-4 text-[#595959]" />
            What happens next
          </h2>
          <ol className="mt-4 space-y-3">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0066FF]/10 text-[11px] font-bold text-[#0066FF]">
                  {i + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-[#595959]">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={onContinueShopping}
            className="flex-1 gap-2 rounded-full bg-[#0066FF] py-3 text-[14px] font-semibold text-white hover:bg-blue-700"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
