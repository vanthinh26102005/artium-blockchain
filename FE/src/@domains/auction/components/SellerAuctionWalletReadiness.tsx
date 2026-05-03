import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Wallet, Wifi } from 'lucide-react'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'
import { Button } from '@shared/components/ui/button'

type WalletStatus = 'idle' | 'connecting' | 'switching_network' | 'error'

type SellerAuctionWalletReadinessProps = {
  userWalletAddress?: string | null
}

/**
 * getProvider - Utility function
 * @returns void
 */
const getProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.ethereum ?? null
}

const shortenAddress = (address?: string | null) => {
  if (!address) {
    return null
    /**
     * shortenAddress - Utility function
     * @returns void
     */
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const normalizeAddress = (address: string) => address.trim()

const isTargetChain = (chainId?: string | null) =>
  Boolean(chainId && chainId.toLowerCase() === WALLET_TARGET_CHAIN.chainIdHex.toLowerCase())

const getMetaMaskErrorMessage = (error: unknown, fallback: string) => {
  /**
   * normalizeAddress - Utility function
   * @returns void
   */
  const maybeError = error as MetaMaskError | undefined

  if (maybeError?.code === 4001) {
    return 'MetaMask request was rejected.'
  }
  /**
   * isTargetChain - Utility function
   * @returns void
   */

  if (maybeError?.code === -32002) {
    return 'MetaMask already has a pending request. Open MetaMask to continue.'
  }

  return maybeError?.message || fallback
  /**
   * getMetaMaskErrorMessage - Utility function
   * @returns void
   */
}

export const SellerAuctionWalletReadiness = ({
  userWalletAddress,
  /**
   * maybeError - Utility function
   * @returns void
   */
}: SellerAuctionWalletReadinessProps) => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [status, setStatus] = useState<WalletStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const isLoading = status === 'connecting' || status === 'switching_network'
  const isConnected = Boolean(connectedAddress)
  const isWrongNetwork = isConnected && !isTargetChain(chainId)
  const isReady = isConnected && !isWrongNetwork
  const linkedWalletLabel = shortenAddress(userWalletAddress)
  const connectedWalletLabel = shortenAddress(connectedAddress)

  const connectWallet = useCallback(async () => {
    const provider = getProvider()

    /**
     * SellerAuctionWalletReadiness - React component
     * @returns React element
     */
    if (!provider?.isMetaMask) {
      setStatus('error')
      setError('MetaMask is required to activate an auction from this workspace.')
      return
    }

    setStatus('connecting')
    setError(null)

    try {
      const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
      /**
       * isLoading - Utility function
       * @returns void
       */
      const address = normalizeAddress(accounts?.[0] ?? '')

      if (!address) {
        setStatus('error')
        /**
         * isConnected - Utility function
         * @returns void
         */
        setError('No MetaMask account was selected.')
        return
      }

      /**
       * isWrongNetwork - Utility function
       * @returns void
       */
      setConnectedAddress(address)
      setChainId(await provider.request<string>({ method: 'eth_chainId' }))
      setStatus('idle')
    } catch (nextError) {
      /**
       * isReady - Utility function
       * @returns void
       */
      setStatus('error')
      setError(getMetaMaskErrorMessage(nextError, 'Could not connect MetaMask.'))
    }
  }, [])
  /**
   * linkedWalletLabel - Utility function
   * @returns void
   */

  const switchNetwork = useCallback(async () => {
    const provider = getProvider()

    /**
     * connectedWalletLabel - Utility function
     * @returns void
     */
    if (!provider?.isMetaMask) {
      setStatus('error')
      setError('MetaMask is required to switch networks.')
      return
    }
    /**
     * connectWallet - Utility function
     * @returns void
     */

    setStatus('switching_network')
    setError(null)

    /**
     * provider - Utility function
     * @returns void
     */
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WALLET_TARGET_CHAIN.chainIdHex }],
      })
      setChainId(await provider.request<string>({ method: 'eth_chainId' }))
      setStatus('idle')
    } catch (nextError) {
      const maybeError = nextError as MetaMaskError

      if (maybeError.code === 4902 && WALLET_TARGET_CHAIN.rpcUrl) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              /**
               * accounts - Utility function
               * @returns void
               */
              {
                chainId: WALLET_TARGET_CHAIN.chainIdHex,
                chainName: WALLET_TARGET_CHAIN.name,
                nativeCurrency: WALLET_TARGET_CHAIN.nativeCurrency,
                /**
                 * address - Utility function
                 * @returns void
                 */
                rpcUrls: [WALLET_TARGET_CHAIN.rpcUrl],
                blockExplorerUrls: [WALLET_TARGET_CHAIN.blockExplorerUrl],
              },
            ],
          })
          setChainId(await provider.request<string>({ method: 'eth_chainId' }))
          setStatus('idle')
          return
        } catch (addError) {
          setStatus('error')
          setError(getMetaMaskErrorMessage(addError, `Could not add ${WALLET_TARGET_CHAIN.name}.`))
          return
        }
      }

      setStatus('error')
      setError(
        getMetaMaskErrorMessage(nextError, `Could not switch to ${WALLET_TARGET_CHAIN.name}.`),
      )
    }
    /**
     * switchNetwork - Utility function
     * @returns void
     */
  }, [])

  useEffect(() => {
    const provider = getProvider()
    /**
     * provider - Utility function
     * @returns void
     */

    if (!provider?.isMetaMask) {
      return
    }

    let isCancelled = false

    Promise.resolve()
      .then(async () => {
        const [accounts, nextChainId] = await Promise.all([
          provider.request<string[]>({ method: 'eth_accounts' }),
          provider.request<string>({ method: 'eth_chainId' }),
        ])

        if (isCancelled) {
          return
        }

        setConnectedAddress(normalizeAddress(accounts?.[0] ?? '') || null)
        setChainId(nextChainId)
      })
      .catch(() => null)
    /**
     * maybeError - Utility function
     * @returns void
     */

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : []
      const nextAddress = typeof accounts[0] === 'string' ? normalizeAddress(accounts[0]) : null
      setConnectedAddress(nextAddress || null)
      setError(null)
      setStatus('idle')
    }

    const handleChainChanged = (...args: unknown[]) => {
      setChainId(typeof args[0] === 'string' ? args[0] : null)
      setError(null)
      setStatus('idle')
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)

    return () => {
      isCancelled = true
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const statusCopy = useMemo(() => {
    if (isReady) {
      return {
        title: 'Wallet ready for activation',
        body: `${connectedWalletLabel} is connected on ${WALLET_TARGET_CHAIN.name}.`,
        icon: CheckCircle2,
        tone: 'ready',
      }
    }

    if (isWrongNetwork) {
      return {
        /**
         * provider - Utility function
         * @returns void
         */
        title: `${WALLET_TARGET_CHAIN.name} required`,
        body: `Switch ${connectedWalletLabel} before activating this auction.`,
        icon: AlertTriangle,
        tone: 'warning',
      }
    }

    return {
      title: userWalletAddress ? 'Connect MetaMask' : 'Connect a wallet for activation',
      body: userWalletAddress
        ? 'Use MetaMask to choose the wallet that will sign the auction activation transaction.'
        : 'No wallet is saved on this account yet. Connect MetaMask here before starting the auction handoff.',
      icon: Wallet,
      tone: 'idle',
    }
  }, [connectedWalletLabel, isReady, isWrongNetwork, userWalletAddress])

  const StatusIcon = statusCopy.icon

  return (
    <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              statusCopy.tone === 'ready'
                ? 'bg-emerald-50 text-emerald-700'
                : /**
                   * handleAccountsChanged - Utility function
                   * @returns void
                   */
                  statusCopy.tone === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
            }`}
            /**
             * accounts - Utility function
             * @returns void
             */
          >
            <StatusIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            /** * nextAddress - Utility function * @returns void */
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Wallet readiness
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{statusCopy.title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{statusCopy.body}</p>
            {error ? (
              <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
                {error}
              </p>
            ) : /**
             * handleChainChanged - Utility function
             * @returns void
             */
            null}
          </div>
        </div>

        <div className="grid min-w-[min(100%,360px)] gap-3 sm:grid-cols-2 lg:max-w-[420px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Account wallet
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
              {linkedWalletLabel ?? 'Not saved'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              MetaMask
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
              {connectedWalletLabel ?? 'Not connected'}
              /** * statusCopy - Utility function * @returns void */
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isLoading}
          className="bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-400"
        >
          {status === 'connecting' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {isConnected ? 'Change wallet' : 'Connect MetaMask'}
        </Button>
        {isWrongNetwork ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => void switchNetwork()}
            disabled={isLoading}
            className="border-amber-300 text-amber-800 hover:bg-amber-50"
          >
            {status === 'switching_network' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            /** * StatusIcon - React component * @returns React element */ Switch to{' '}
            {WALLET_TARGET_CHAIN.name}
          </Button>
        ) : null}
      </div>
    </section>
  )
}
