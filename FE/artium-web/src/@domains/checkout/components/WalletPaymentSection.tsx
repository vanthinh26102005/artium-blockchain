import type { FieldErrors } from 'react-hook-form'
import type { EthereumQuoteResponse } from '@shared/apis/paymentApis'
import type { WalletErrorState } from '../hooks/useWalletCheckout'

const DEFAULT_CHAIN_NAME = process.env.NEXT_PUBLIC_ETH_CHAIN_NAME ?? 'Sepolia'

function formatEthAmount(ethAmount: string): string {
  const numeric = Number(ethAmount)
  if (!Number.isFinite(numeric)) {
    return ethAmount
  }

  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}

type Props = {
  quote: EthereumQuoteResponse | null
  quoteStatus: 'idle' | 'loading' | 'ready' | 'error'
  quoteError: string | null
  isQuoteExpired: boolean
  quoteExpiresInSeconds: number | null
  onRefreshQuote: () => void
  walletAddress: string
  txHash: string
  isConnecting: boolean
  isSubmittingPayment: boolean
  connectError: WalletErrorState | null
  networkError: WalletErrorState | null
  transactionError: WalletErrorState | null
  isOnRequiredChain: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToRequiredChain: () => Promise<boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
}

export const WalletPaymentSection = ({
  quote,
  quoteStatus,
  quoteError,
  isQuoteExpired,
  quoteExpiresInSeconds,
  onRefreshQuote,
  walletAddress,
  txHash,
  isConnecting,
  isSubmittingPayment,
  connectError,
  networkError,
  transactionError,
  isOnRequiredChain,
  connectWallet,
  disconnectWallet,
  switchToRequiredChain,
  errors,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm space-y-4">
      <div className="rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Sepolia Quote
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#595959]">
              MetaMask checkout is restricted to the Sepolia testnet. Refresh the quote if it
              expires before you click Pay Now.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshQuote}
            disabled={quoteStatus === 'loading'}
            className="shrink-0 rounded-full border border-[#D4D4D4] px-3 py-1 text-[12px] font-semibold text-[#191414] transition hover:border-[#191414] disabled:opacity-60"
          >
            {quoteStatus === 'loading' ? 'Refreshing…' : 'Refresh Quote'}
          </button>
        </div>

        {quoteStatus === 'loading' && (
          <p className="mt-3 text-[12px] text-[#595959]">Fetching a live ETH quote from the server…</p>
        )}

        {quoteStatus === 'error' && (
          <p className="mt-3 text-[12px] text-red-500">
            {quoteError ?? 'Quote unavailable. Refresh the quote to continue with MetaMask.'}
          </p>
        )}

        {quote && quoteStatus === 'ready' && (
          <div className="mt-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#0066FF]">
                {quote.chainName}
              </span>
              <span className="rounded-full bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-semibold text-[#595959]">
                1 ETH = ${quote.usdPerEth}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isQuoteExpired ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isQuoteExpired
                  ? 'Quote expired'
                  : `Expires in ${quoteExpiresInSeconds ?? 0}s`}
              </span>
            </div>
            <p className="mt-3 text-[15px] font-semibold text-[#191414]">
              Send {formatEthAmount(quote.ethAmount)} ETH
            </p>
            <p className="mt-1 text-[12px] text-[#595959]">
              Quoted from ${quote.usdAmount.toFixed(2)} via {quote.provider}.
            </p>
            <p className="mt-3 text-[12px] font-medium text-[#595959]">
              When you click <span className="font-semibold text-[#191414]">Pay Now</span>, checkout
              will open MetaMask, submit the Sepolia payment, and then continue to the success
              screen.
            </p>
          </div>
        )}
      </div>

      {!walletAddress ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-4xl">🦊</span>
          <p className="text-[14px] text-[#595959] text-center">
            Connect MetaMask to pay with Sepolia ETH
          </p>
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="rounded-full bg-[#0066FF] px-8 py-3 text-[14px] font-bold text-white transition hover:bg-[#0052CC] disabled:opacity-60"
          >
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
          {connectError && (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[12px] text-red-500">{connectError.message}</p>
              {connectError.canRetry && (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="text-[12px] font-semibold text-[#0066FF] underline"
                >
                  {connectError.retryLabel}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[13px] font-medium text-green-800">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </div>
            <button
              type="button"
              onClick={disconnectWallet}
              className="text-[11px] text-[#989898] hover:text-[#595959] underline"
            >
              Disconnect
            </button>
          </div>

          <div
            className={`rounded-xl border px-4 py-3 ${
              isOnRequiredChain
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#595959]">
              Active Network
            </p>
            <p className="mt-1 text-[13px] text-[#191414]">
              {isOnRequiredChain
                ? `${quote?.chainName ?? DEFAULT_CHAIN_NAME} connected`
                : 'MetaMask is not on Sepolia'}
            </p>
            {!isOnRequiredChain && (
              <button
                type="button"
                onClick={() => void switchToRequiredChain()}
                className="mt-3 text-[12px] font-semibold text-[#B45309] underline"
              >
                Switch to Sepolia
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#595959]">
              Checkout Flow
            </p>
            <p className="mt-1 text-[13px] text-[#191414]">
              Use the main checkout <span className="font-semibold">Pay Now</span> button to create
              the order and trigger the MetaMask payment.
            </p>
            {isSubmittingPayment && (
              <p className="mt-2 text-[12px] text-[#0066FF]">Waiting for MetaMask confirmation…</p>
            )}
          </div>

          {txHash && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF]">Transaction Sent</p>
              <p className="mt-1 text-[12px] font-mono text-[#191414] break-all">
                {txHash.slice(0, 10)}…{txHash.slice(-8)}
              </p>
              {quote?.blockExplorerUrl && (
                <a
                  href={`${quote.blockExplorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[12px] font-semibold text-[#0066FF] underline"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          )}

          {networkError && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-red-500">{networkError.message}</p>
              {networkError.canRetry && (
                <button
                  type="button"
                  onClick={() => void switchToRequiredChain()}
                  className="self-start text-[12px] font-semibold text-[#0066FF] underline"
                >
                  {networkError.retryLabel}
                </button>
              )}
            </div>
          )}

          {transactionError && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-red-500">{transactionError.message}</p>
            </div>
          )}

          {quoteStatus === 'error' && (
            <p className="text-[12px] text-red-500">
              {quoteError ?? 'A live quote is required before MetaMask checkout can continue.'}
            </p>
          )}

          {isQuoteExpired && (
            <p className="text-[12px] text-red-500">
              This quote expired before the payment was completed. Refresh the quote to continue.
            </p>
          )}

          {errors?.walletAddress?.message && (
            <p className="text-[12px] text-red-500">{String(errors.walletAddress.message)}</p>
          )}
        </div>
      )}
    </div>
  )
}
