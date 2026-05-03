// react
import { useCallback, useState } from 'react'

// icons
import { Copy, Check, QrCode, ExternalLink } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'

type QuickSellArtistSharePanelProps = {
  invoiceCode: string
  onEnterPaymentForBuyer: () => void
}

/**
 * QuickSellArtistSharePanel - React component
 * @returns React element
 */
export const QuickSellArtistSharePanel = ({
  invoiceCode,
  onEnterPaymentForBuyer,
}: QuickSellArtistSharePanelProps) => {
  // -- state --
  const [copied, setCopied] = useState(false)

  // -- derived --
  const buyerLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/artist/invoices/checkout/${invoiceCode}?buyer=true`
      : `/artist/invoices/checkout/${invoiceCode}?buyer=true`
  /**
   * buyerLink - Utility function
   * @returns void
   */

  // -- handlers --
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buyerLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      /**
       * handleCopyLink - Utility function
       * @returns void
       */
      console.error('Failed to copy:', error)
    }
  }, [buyerLink])

  const handlePreviewAsBuyer = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(buyerLink, '_blank')
    }
  }, [buyerLink])

  // -- render --
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      /** * handlePreviewAsBuyer - Utility function * @returns void */
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Share with Buyer</h2>
      <div className="flex flex-col items-center space-y-4">
        {/* QR Code Placeholder */}
        <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
          <div className="text-center">
            <QrCode className="mx-auto h-12 w-12 text-slate-400" />
            <span className="mt-2 block text-sm text-slate-500">QR Code</span>
          </div>
        </div>

        {/* Link Preview */}
        <div className="w-full rounded-lg bg-slate-100 p-3">
          <p className="break-all text-xs text-slate-600">{buyerLink}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3">
          <Button type="button" variant="outline" onClick={handleCopyLink} className="flex-1">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handlePreviewAsBuyer} className="flex-1">
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview as Buyer
          </Button>
        </div>

        <div className="w-full border-t border-slate-200 pt-4">
          <Button
            type="button"
            onClick={onEnterPaymentForBuyer}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Enter Payment for Buyer
          </Button>
          <p className="mt-2 text-center text-xs text-slate-500">
            Take payment in person on behalf of buyer
          </p>
        </div>
      </div>
    </div>
  )
}
