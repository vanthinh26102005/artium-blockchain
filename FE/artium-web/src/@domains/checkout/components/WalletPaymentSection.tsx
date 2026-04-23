import { useState, useCallback } from 'react'
import type { FieldErrors } from 'react-hook-form'

type Props = {
  onWalletConnected: (address: string) => void
  onTxHashReceived: (hash: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
  ethAmount?: number
}

export const WalletPaymentSection = ({ onWalletConnected, onTxHashReceived, errors, ethAmount }: Props) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState('')
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setConnectError('MetaMask not detected. Please install MetaMask.')
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
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setConnectError(message)
    } finally {
      setIsConnecting(false)
    }
  }, [onWalletConnected])

  const sendEthTransaction = useCallback(async () => {
    if (!walletAddress || ethAmount === undefined) return
    setIsSendingTx(true)
    setTxError(null)
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
      const message = err instanceof Error ? err.message : 'Transaction failed'
      setTxError(message)
    } finally {
      setIsSendingTx(false)
    }
  }, [walletAddress, ethAmount, onTxHashReceived])

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
            <p className="text-[12px] text-red-500">{connectError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[13px] font-medium text-green-800">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </span>
          </div>

          {ethAmount !== undefined && !txHash && (
            <button
              type="button"
              onClick={sendEthTransaction}
              disabled={isSendingTx}
              className="w-full rounded-2xl bg-[#F97316] px-6 py-4 text-[14px] font-bold text-white transition hover:bg-[#EA6C0A] disabled:opacity-60"
            >
              {isSendingTx ? 'Confirm in MetaMask…' : `Send ${ethAmount.toFixed(4)} ETH`}
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

          {txError && <p className="text-[12px] text-red-500">{txError}</p>}
          {errors?.txHash?.message && (
            <p className="text-[12px] text-red-500">{String(errors.txHash.message)}</p>
          )}
        </div>
      )}
    </div>
  )
}
