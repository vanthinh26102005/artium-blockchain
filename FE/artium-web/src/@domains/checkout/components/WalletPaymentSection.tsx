import { useState, useCallback } from 'react'
import type { FieldErrors } from 'react-hook-form'

type MetaMaskError = { code?: number; message?: string }

type WalletErrorState = {
  message: string
  canRetry: boolean
  retryLabel: string
}

function classifyMetaMaskError(err: unknown, context: 'connect' | 'transaction'): WalletErrorState {
  const code = (err as MetaMaskError)?.code
  if (code === 4001 || (err instanceof Error && err.message.toLowerCase().includes('user rejected'))) {
    return context === 'connect'
      ? {
          message: 'You rejected the MetaMask connection request. Retry connection when you are ready.',
          canRetry: true,
          retryLabel: 'Retry Connection',
        }
      : {
          message: 'You rejected the transaction in MetaMask. Retry the payment when you are ready.',
          canRetry: true,
          retryLabel: 'Retry Transaction',
        }
  }
  if (code === -32002) {
    return context === 'connect'
      ? {
          message: 'A MetaMask connection request is already pending. Open MetaMask to approve or reject it.',
          canRetry: false,
          retryLabel: 'Retry Connection',
        }
      : {
          message: 'A MetaMask transaction request is already pending. Open MetaMask to approve or reject it.',
          canRetry: false,
          retryLabel: 'Retry Transaction',
        }
  }
  const fallback =
    context === 'connect'
      ? 'Failed to connect wallet. Retry the MetaMask connection.'
      : 'Failed to submit the transaction. Retry the MetaMask payment.'

  return {
    message: err instanceof Error ? err.message : fallback,
    canRetry: true,
    retryLabel: context === 'connect' ? 'Retry Connection' : 'Retry Transaction',
  }
}

type Props = {
  onWalletConnected: (address: string) => void
  onTxHashReceived: (hash: string) => void
  onWalletDisconnected?: () => void
  onTxHashCleared?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
  ethAmount?: number
}

export const WalletPaymentSection = ({
  onWalletConnected,
  onTxHashReceived,
  onWalletDisconnected,
  onTxHashCleared,
  errors,
  ethAmount,
}: Props) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState<WalletErrorState | null>(null)
  const [txHash, setTxHash] = useState('')
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [txError, setTxError] = useState<WalletErrorState | null>(null)

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setConnectError({
        message: 'MetaMask not detected. Please install MetaMask to pay with ETH.',
        canRetry: false,
        retryLabel: 'Retry Connection',
      })
      return
    }
    setIsConnecting(true)
    setConnectError(null)
    try {
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      const address = accounts[0]
      setWalletAddress(address)
      onWalletConnected(address)
    } catch (err: unknown) {
      setConnectError(classifyMetaMaskError(err, 'connect'))
    } finally {
      setIsConnecting(false)
    }
  }, [onWalletConnected])

  const sendEthTransaction = useCallback(async () => {
    if (!walletAddress || ethAmount === undefined) return
    setIsSendingTx(true)
    setTxError(null)
    // Clear any previous tx so the user can retry
    setTxHash('')
    onTxHashCleared?.()
    try {
      const toAddress = process.env.NEXT_PUBLIC_PLATFORM_ETH_WALLET
      if (!toAddress) throw new Error('Platform wallet address not configured')

      const amountInWei = BigInt(Math.floor(ethAmount * 1e18)).toString(16)
      const hash = (await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{ from: walletAddress, to: toAddress, value: `0x${amountInWei}` }],
      })) as string

      setTxHash(hash)
      onTxHashReceived(hash)
    } catch (err: unknown) {
      setTxError(classifyMetaMaskError(err, 'transaction'))
    } finally {
      setIsSendingTx(false)
    }
  }, [ethAmount, onTxHashCleared, onTxHashReceived, walletAddress])

  const handleDisconnect = useCallback(() => {
    setWalletAddress('')
    setTxHash('')
    setTxError(null)
    setConnectError(null)
    onWalletDisconnected?.()
  }, [onWalletDisconnected])

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm space-y-4">
      {!walletAddress ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-4xl">🦊</span>
          <p className="text-[14px] text-[#595959] text-center">
            Connect your MetaMask wallet to pay with ETH
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
              onClick={handleDisconnect}
              className="text-[11px] text-[#989898] hover:text-[#595959] underline"
            >
              Disconnect
            </button>
          </div>

          {!txHash && (
            <button
              type="button"
              onClick={sendEthTransaction}
              disabled={isSendingTx || ethAmount === undefined}
              className="w-full rounded-2xl bg-[#F97316] px-6 py-4 text-[14px] font-bold text-white transition hover:bg-[#EA6C0A] disabled:opacity-60"
            >
              {isSendingTx ? 'Confirm in MetaMask…' : `Send ${ethAmount?.toFixed(4) ?? '…'} ETH`}
            </button>
          )}

          {txHash && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF]">Transaction Sent</p>
              <p className="mt-1 text-[12px] font-mono text-[#191414] break-all">
                {txHash.slice(0, 10)}…{txHash.slice(-8)}
              </p>
            </div>
          )}

          {txError && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-red-500">{txError.message}</p>
              {txError.canRetry && (
                <button
                  type="button"
                  onClick={sendEthTransaction}
                  className="self-start text-[12px] font-semibold text-[#0066FF] underline"
                >
                  {txError.retryLabel}
                </button>
              )}
            </div>
          )}

          {errors?.txHash?.message && (
            <p className="text-[12px] text-red-500">{String(errors.txHash.message)}</p>
          )}
        </div>
      )}
    </div>
  )
}
