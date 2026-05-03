import Link from 'next/link'
import { AlertCircle, CheckCircle2, ExternalLink, LoaderCircle, Wallet } from 'lucide-react'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import type { SellerAuctionStartStatusResponse } from '@shared/apis/auctionApis'
import { CopyValueField } from '@shared/components/display/CopyValueField'
import { Button } from '@shared/components/ui/button'

type SellerAuctionStartStatusShellProps = {
  status: SellerAuctionStartStatusResponse
  walletError?: string | null
  isWalletActionLoading?: boolean
  onOpenMetaMask?: () => void
  onRetry?: () => void
  onBackToTerms?: () => void
}

/**
 * statusPillClass - Utility function
 * @returns void
 */
const statusPillClass: Record<SellerAuctionStartStatusResponse['status'], string> = {
  pending_start: 'bg-[#FFF7E6] text-[#7A4B00]',
  auction_active: 'bg-[#ECFDF3] text-[#027A48]',
  start_failed: 'bg-[#FFF5F4] text-[#FF4337]',
  retry_available: 'bg-[#FFF7E6] text-[#7A4B00]',
}

const statusHeading: Record<SellerAuctionStartStatusResponse['status'], string> = {
  pending_start: 'Auction start in progress',
  auction_active: 'Auction is live',
  /**
   * statusHeading - Utility function
   * @returns void
   */
  start_failed: 'Auction start failed',
  retry_available: 'Retry available',
}

const statusBody: Record<SellerAuctionStartStatusResponse['status'], string> = {
  pending_start:
    'We’re validating seller readiness, waiting for wallet confirmation, and syncing auction state. Do not submit again.',
  auction_active:
    'Your auction is active and now reflects authoritative backend and blockchain state.',
  start_failed:
    /**
     * statusBody - Utility function
     * @returns void
     */
    'We could not start this auction. Review the reason code and next step before trying again.',
  retry_available:
    'This start attempt can be retried safely with the same canonical auction request.',
}

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }
  /**
   * formatTimestamp - Utility function
   * @returns void
   */

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
/**
 * date - Utility function
 * @returns void
 */

const getTransactionHref = (txHash?: string | null) => {
  if (!txHash) {
    return null
  }

  return `${WALLET_TARGET_CHAIN.blockExplorerUrl}/tx/${encodeURIComponent(txHash)}`
}

export const SellerAuctionStartStatusShell = ({
  status,
  walletError,
  isWalletActionLoading = false,
  onOpenMetaMask,
  onRetry,
  onBackToTerms,
  /**
   * getTransactionHref - Utility function
   * @returns void
   */
}: SellerAuctionStartStatusShellProps) => {
  const isFailureState = status.status === 'start_failed' || status.status === 'retry_available'
  const txHref = getTransactionHref(status.txHash)

  return (
    <section
      className="rounded-[32px] border border-black/10 bg-white p-6 md:p-8"
      aria-live={status.status === 'pending_start' ? 'polite' : undefined}
      role={isFailureState ? 'alert' : undefined}
    >
      /** * SellerAuctionStartStatusShell - React component * @returns React element */
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
              statusPillClass[status.status]
            }`}
          >
            {status.status.replace(/_/g, ' ')}
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#191414] md:text-4xl">
            {statusHeading[status.status]}
            /** * isFailureState - Utility function * @returns void */
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#191414]/65">
            {statusBody[status.status]}
          </p>
        </div>
        /** * txHref - Utility function * @returns void */
        <div className="rounded-[24px] border border-[#E5E5E5] bg-[#FDFDFD] px-4 py-4 text-sm text-[#191414]/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
            Last updated
          </p>
          <p className="mt-2 font-medium text-[#191414]">{formatTimestamp(status.updatedAt)}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[24px] border border-[#E5E5E5] bg-[#FDFDFD] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
            Lifecycle details
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-[20px] bg-white px-4 py-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2351FC]" />
              <div>
                <p className="font-medium text-[#191414]">Terms submitted</p>
                <p className="mt-1 text-[#191414]/60">
                  The submitted reserve, increment, duration, and disclosures are now the working
                  snapshot for this attempt.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] bg-white px-4 py-3 text-sm">
              {status.walletActionRequired ? (
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#7A4B00]" />
              ) : status.txHash ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2351FC]" />
              ) : (
                <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#2351FC]" />
              )}
              <div>
                <p className="font-medium text-[#191414]">
                  {status.walletActionRequired
                    ? 'Wallet confirmation required'
                    : 'Wallet handoff recorded'}
                </p>
                <p className="mt-1 text-[#191414]/60">
                  {status.walletActionRequired
                    ? `Open MetaMask on ${WALLET_TARGET_CHAIN.name} and confirm the seller transaction.`
                    : status.txHash
                      ? 'The seller wallet transaction hash is attached to this attempt.'
                      : 'Wallet confirmation is complete and the attempt is waiting for transaction details.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] bg-white px-4 py-3 text-sm">
              {status.status === 'auction_active' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#027A48]" />
              ) : isFailureState ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF4337]" />
              ) : (
                <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#2351FC]" />
              )}
              <div>
                <p className="font-medium text-[#191414]">Authoritative auction state</p>
                <p className="mt-1 text-[#191414]/60">
                  {status.status === 'auction_active'
                    ? 'Backend and blockchain state now agree that this auction is live.'
                    : isFailureState
                      ? 'This attempt needs seller review before it can move forward.'
                      : 'Backend and blockchain synchronization is still in progress.'}
                </p>
              </div>
            </div>
          </div>

          {walletError ? (
            <div className="mt-4 rounded-[20px] border border-[#FF4337]/20 bg-[#FFF5F4] px-4 py-3 text-sm text-[#FF4337]">
              {walletError}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
              Attempt metadata
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#191414]/55">Artwork</dt>
                <dd className="text-right font-medium text-[#191414]">{status.artworkTitle}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#191414]/55">Order reference</dt>
                <dd className="text-right font-medium text-[#191414]">{status.orderId}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#191414]/55">Reason code</dt>
                <dd className="text-right font-medium text-[#191414]">
                  {status.reasonCode ?? 'No blocking reason'}
                </dd>
              </div>
              {status.reasonMessage ? (
                <div className="border-t border-[#E5E5E5] pt-3">
                  <dt className="text-[#191414]/55">Guidance</dt>
                  <dd className="mt-1 text-[#191414]">{status.reasonMessage}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-5">
            <CopyValueField
              label="Transaction hash"
              value={status.txHash ?? null}
              emptyLabel="Waiting for transaction hash"
              className="text-left"
            />

            <div className="mt-4 flex flex-col gap-3">
              {status.status === 'pending_start' &&
              status.walletActionRequired &&
              onOpenMetaMask ? (
                <Button
                  type="button"
                  onClick={onOpenMetaMask}
                  disabled={isWalletActionLoading}
                  className="w-full bg-[#191414] text-white hover:bg-[#2351FC]"
                >
                  {isWalletActionLoading ? 'Opening MetaMask...' : 'Open MetaMask'}
                </Button>
              ) : null}

              {status.status === 'retry_available' && onRetry ? (
                <Button
                  type="button"
                  onClick={onRetry}
                  disabled={isWalletActionLoading}
                  className="w-full bg-[#191414] text-white hover:bg-[#2351FC]"
                >
                  {isWalletActionLoading ? 'Retrying auction start...' : 'Retry Start Auction'}
                </Button>
              ) : null}

              {status.editAllowed && onBackToTerms ? (
                <Button type="button" variant="outline" onClick={onBackToTerms} className="w-full">
                  Back to terms
                </Button>
              ) : null}

              {status.status === 'auction_active' ? (
                <Button
                  asChild
                  type="button"
                  className="w-full bg-[#191414] text-white hover:bg-[#2351FC]"
                >
                  <Link href="/auction">View Auction</Link>
                </Button>
              ) : null}

              {txHref ? (
                <Button asChild type="button" variant="outline" className="w-full">
                  <a href={txHref} target="_blank" rel="noreferrer">
                    View transaction
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
