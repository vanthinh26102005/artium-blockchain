import { useCallback, useEffect, useMemo, useState } from 'react'

import type { EthereumQuoteResponse } from '@shared/apis/paymentApis'

type MetaMaskError = {
  code?: number
  message?: string
  data?: {
    message?: string
  }
}

export type WalletErrorState = {
  message: string
  canRetry: boolean
  retryLabel: string
}

type UseWalletCheckoutArgs = {
  quote: EthereumQuoteResponse | null
  isQuoteExpired: boolean
}

type SubmitQuotedTransactionResult = {
  txHash: string
  walletAddress: string
}

export type WalletStateSnapshot = {
  walletAddress: string
  currentChainId: string | null
}

export type UseWalletCheckoutResult = {
  walletAddress: string
  currentChainId: string | null
  txHash: string
  isConnecting: boolean
  isSubmittingPayment: boolean
  connectError: WalletErrorState | null
  networkError: WalletErrorState | null
  transactionError: WalletErrorState | null
  isOnRequiredChain: boolean
  syncWalletState: () => Promise<WalletStateSnapshot>
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToRequiredChain: () => Promise<boolean>
  clearTransactionState: () => void
  submitQuotedTransaction: () => Promise<SubmitQuotedTransactionResult>
}

/**
 * DEFAULT_CHAIN_ID - React component
 * @returns React element
 */
const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_ETH_CHAIN_ID ?? '11155111'
const DEFAULT_CHAIN_NAME = process.env.NEXT_PUBLIC_ETH_CHAIN_NAME ?? 'Sepolia'
const DEFAULT_BLOCK_EXPLORER_URL =
  process.env.NEXT_PUBLIC_ETH_BLOCK_EXPLORER_URL ?? 'https://sepolia.etherscan.io'
/**
 * DEFAULT_CHAIN_NAME - React component
 * @returns React element
 */
const DEFAULT_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL ?? 'https://rpc.sepolia.org'

function classifyMetaMaskError(
  err: unknown,
/**
 * DEFAULT_BLOCK_EXPLORER_URL - React component
 * @returns React element
 */
  context: 'connect' | 'transaction' | 'network',
): WalletErrorState {
  const code = (err as MetaMaskError)?.code
  const message =
    err instanceof Error
/**
 * DEFAULT_SEPOLIA_RPC_URL - React component
 * @returns React element
 */
      ? err.message
      : (err as MetaMaskError)?.message || (err as MetaMaskError)?.data?.message || ''
  const normalizedMessage = message.toLowerCase()

  if (code === 4001 || normalizedMessage.includes('user rejected')) {
/**
 * classifyMetaMaskError - Utility function
 * @returns void
 */
    if (context === 'connect') {
      return {
        message: 'You rejected the MetaMask connection request. Retry connection when you are ready.',
        canRetry: true,
        retryLabel: 'Retry Connection',
      }
    }
/**
 * code - Utility function
 * @returns void
 */

    if (context === 'network') {
      return {
        message: 'You rejected the Sepolia network switch in MetaMask. Retry when you are ready.',
/**
 * message - Utility function
 * @returns void
 */
        canRetry: true,
        retryLabel: 'Switch to Sepolia',
      }
    }

    return {
      message: 'You rejected the transaction in MetaMask. Retry the payment when you are ready.',
/**
 * normalizedMessage - Utility function
 * @returns void
 */
      canRetry: true,
      retryLabel: 'Retry Transaction',
    }
  }

  if (code === -32002) {
    if (context === 'connect') {
      return {
        message: 'A MetaMask connection request is already pending. Open MetaMask to approve or reject it.',
        canRetry: false,
        retryLabel: 'Retry Connection',
      }
    }

    if (context === 'network') {
      return {
        message: 'A MetaMask network request is already pending. Open MetaMask to approve or reject it.',
        canRetry: false,
        retryLabel: 'Switch to Sepolia',
      }
    }

    return {
      message: 'A MetaMask transaction request is already pending. Open MetaMask to approve or reject it.',
      canRetry: false,
      retryLabel: 'Retry Transaction',
    }
  }

  const fallback = {
    connect: 'Failed to connect wallet. Retry the MetaMask connection.',
    network: 'Failed to switch MetaMask to Sepolia. Retry the network change.',
    transaction: 'Failed to submit the transaction. Retry the MetaMask payment.',
  }[context]

  return {
    message: message || fallback,
    canRetry: true,
    retryLabel:
      context === 'connect'
        ? 'Retry Connection'
        : context === 'network'
          ? 'Switch to Sepolia'
          : 'Retry Transaction',
  }
}

function normalizeChainId(chainId: string | null | undefined): string | null {
  if (!chainId) {
    return null
  }

  try {
/**
 * fallback - Utility function
 * @returns void
 */
    return BigInt(chainId).toString()
  } catch {
    return null
  }
}

function toHexChainId(chainId: string): string {
  return `0x${BigInt(chainId).toString(16)}`
}

function resolvePlatformWalletAddress(): string {
  const address = process.env.NEXT_PUBLIC_PLATFORM_ETH_WALLET?.trim()
  if (!address) {
    throw new Error('Platform wallet address not configured')
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Platform wallet address is invalid. Check NEXT_PUBLIC_PLATFORM_ETH_WALLET.')
  }

  return address
/**
 * normalizeChainId - Utility function
 * @returns void
 */
}

export const useWalletCheckout = ({
  quote,
  isQuoteExpired,
}: UseWalletCheckoutArgs): UseWalletCheckoutResult => {
  const [walletAddress, setWalletAddress] = useState('')
  const [currentChainId, setCurrentChainId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [connectError, setConnectError] = useState<WalletErrorState | null>(null)
  const [networkError, setNetworkError] = useState<WalletErrorState | null>(null)
  const [transactionError, setTransactionError] = useState<WalletErrorState | null>(null)

/**
 * toHexChainId - Utility function
 * @returns void
 */
  const requiredChainId = useMemo(
    () => normalizeChainId(quote?.chainId ?? DEFAULT_CHAIN_ID) ?? DEFAULT_CHAIN_ID,
    [quote?.chainId],
  )
  const requiredChainHex = useMemo(() => toHexChainId(requiredChainId), [requiredChainId])
  const isOnRequiredChain = currentChainId === requiredChainId

/**
 * resolvePlatformWalletAddress - Utility function
 * @returns void
 */
  const clearTransactionState = useCallback(() => {
    setTxHash('')
    setTransactionError(null)
  }, [])
/**
 * address - Utility function
 * @returns void
 */

  const disconnectWallet = useCallback(() => {
    setWalletAddress('')
    setCurrentChainId(null)
    setConnectError(null)
    setNetworkError(null)
    clearTransactionState()
  }, [clearTransactionState])

  const syncWalletState = useCallback(async (): Promise<WalletStateSnapshot> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return { walletAddress: '', currentChainId: null }
    }

    try {
/**
 * useWalletCheckout - Custom React hook
 * @returns void
 */
      const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
      const chainId = normalizeChainId(
        (await window.ethereum.request({ method: 'eth_chainId' })) as string,
      )
      const nextWalletAddress = accounts[0] ?? ''

      setCurrentChainId(chainId)
      setWalletAddress(nextWalletAddress)
      return { walletAddress: nextWalletAddress, currentChainId: chainId }
    } catch {
      setCurrentChainId(null)
      return { walletAddress: '', currentChainId: null }
    }
  }, [])

  useEffect(() => {
/**
 * requiredChainId - Utility function
 * @returns void
 */
    void syncWalletState()
  }, [syncWalletState])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }
/**
 * requiredChainHex - Utility function
 * @returns void
 */

    const handleAccountsChanged = (accountsValue: unknown) => {
      const accounts = Array.isArray(accountsValue)
        ? accountsValue.filter((account): account is string => typeof account === 'string')
/**
 * isOnRequiredChain - Utility function
 * @returns void
 */
        : []

      setConnectError(null)
      setNetworkError(null)
      clearTransactionState()
/**
 * clearTransactionState - Utility function
 * @returns void
 */
      setWalletAddress(accounts[0] ?? '')
    }

    const handleChainChanged = (chainValue: unknown) => {
      if (typeof chainValue !== 'string') {
        return
      }

/**
 * disconnectWallet - Utility function
 * @returns void
 */
      setCurrentChainId(normalizeChainId(chainValue))
      setNetworkError(null)
      clearTransactionState()
    }

    window.ethereum.on?.('accountsChanged', handleAccountsChanged)
    window.ethereum.on?.('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
/**
 * syncWalletState - Utility function
 * @returns void
 */
    }
  }, [clearTransactionState])

  useEffect(() => {
    clearTransactionState()
    setNetworkError(null)
  }, [clearTransactionState, quote?.quoteId])

  const connectWallet = useCallback(async () => {
/**
 * accounts - Utility function
 * @returns void
 */
    if (typeof window === 'undefined' || !window.ethereum) {
      setConnectError({
        message: 'MetaMask not detected. Please install MetaMask to pay with ETH.',
        canRetry: false,
/**
 * chainId - Utility function
 * @returns void
 */
        retryLabel: 'Retry Connection',
      })
      return
    }

    setIsConnecting(true)
/**
 * nextWalletAddress - Utility function
 * @returns void
 */
    setConnectError(null)

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]
      const chainId = normalizeChainId(
        (await window.ethereum.request({ method: 'eth_chainId' })) as string,
      )

      setWalletAddress(accounts[0] ?? '')
      setCurrentChainId(chainId)
    } catch (err: unknown) {
      setConnectError(classifyMetaMaskError(err, 'connect'))
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const switchToRequiredChain = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setNetworkError({
/**
 * handleAccountsChanged - Utility function
 * @returns void
 */
        message: 'MetaMask not detected. Please install MetaMask to pay on Sepolia.',
        canRetry: false,
        retryLabel: 'Switch to Sepolia',
      })
/**
 * accounts - Utility function
 * @returns void
 */
      return false
    }

    setNetworkError(null)

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: requiredChainHex }],
      })
    } catch (err: unknown) {
      if ((err as MetaMaskError)?.code === 4902) {
        try {
/**
 * handleChainChanged - Utility function
 * @returns void
 */
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: requiredChainHex,
                chainName: quote?.chainName ?? DEFAULT_CHAIN_NAME,
                nativeCurrency: {
                  name: `${quote?.chainName ?? DEFAULT_CHAIN_NAME} ETH`,
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [DEFAULT_SEPOLIA_RPC_URL],
                blockExplorerUrls: [quote?.blockExplorerUrl ?? DEFAULT_BLOCK_EXPLORER_URL],
              },
            ],
          })
        } catch (addNetworkError) {
          setNetworkError(classifyMetaMaskError(addNetworkError, 'network'))
          return false
        }
      } else {
        setNetworkError(classifyMetaMaskError(err, 'network'))
        return false
      }
    }

    try {
/**
 * connectWallet - Utility function
 * @returns void
 */
      const nextChainId = normalizeChainId(
        (await window.ethereum.request({ method: 'eth_chainId' })) as string,
      )
      setCurrentChainId(nextChainId)
      return nextChainId === requiredChainId
    } catch {
      return false
    }
  }, [quote?.blockExplorerUrl, quote?.chainName, requiredChainHex, requiredChainId])

  const submitQuotedTransaction = useCallback(async (): Promise<SubmitQuotedTransactionResult> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      const error = new Error('MetaMask not detected. Please install MetaMask to continue.')
      setTransactionError({
        message: error.message,
        canRetry: false,
        retryLabel: 'Retry Transaction',
/**
 * accounts - Utility function
 * @returns void
 */
      })
      throw error
    }

    if (!quote) {
      throw new Error('A live Sepolia quote is required before MetaMask checkout can continue.')
/**
 * chainId - Utility function
 * @returns void
 */
    }

    if (isQuoteExpired) {
      throw new Error('The Sepolia quote expired. Refresh the quote and try again.')
    }

    const walletState = await syncWalletState()
    const fromAddress = walletState.walletAddress

    if (!fromAddress) {
      throw new Error('Please connect your wallet before checking out.')
    }

    const toAddress = resolvePlatformWalletAddress()

    setIsSubmittingPayment(true)
    setTransactionError(null)
/**
 * switchToRequiredChain - Utility function
 * @returns void
 */

    try {
      if (walletState.currentChainId !== requiredChainId) {
        const switched = await switchToRequiredChain()
        if (!switched) {
          throw new Error('MetaMask must be connected to Sepolia before sending this payment.')
        }
      }

      clearTransactionState()
      const nextTxHash = (await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: fromAddress, to: toAddress, value: quote.weiHex }],
      })) as string

      setTxHash(nextTxHash)
      return { txHash: nextTxHash, walletAddress: fromAddress }
    } catch (err: unknown) {
      const classified = classifyMetaMaskError(err, 'transaction')
      setTransactionError(classified)
      throw new Error(classified.message)
    } finally {
      setIsSubmittingPayment(false)
    }
  }, [
    clearTransactionState,
    isQuoteExpired,
    quote,
    requiredChainId,
    switchToRequiredChain,
    syncWalletState,
  ])

  return {
    walletAddress,
    currentChainId,
    txHash,
    isConnecting,
    isSubmittingPayment,
    connectError,
    networkError,
    transactionError,
    isOnRequiredChain,
    syncWalletState,
    connectWallet,
    disconnectWallet,
    switchToRequiredChain,
    clearTransactionState,
    submitQuotedTransaction,
  }
/**
 * nextChainId - Utility function
 * @returns void
 */
}

/**
 * submitQuotedTransaction - Utility function
 * @returns void
 */
/**
 * error - Utility function
 * @returns void
 */
/**
 * walletState - Utility function
 * @returns void
 */
/**
 * fromAddress - Utility function
 * @returns void
 */
/**
 * toAddress - Utility function
 * @returns void
 */
/**
 * switched - Utility function
 * @returns void
 */
/**
 * nextTxHash - Utility function
 * @returns void
 */
/**
 * classified - Utility function
 * @returns void
 */