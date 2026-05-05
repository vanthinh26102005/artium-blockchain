// react
import { useCallback, useMemo, useRef, useState } from 'react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - hooks
import { useToast } from '@shared/hooks/useToast'

// @domains - auth
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'
import { buildSiweMessage } from '@domains/auth/utils/siwe'

export type WalletLinkStatus =
  | 'idle'
  | 'not_installed'
  | 'connecting'
  | 'wrong_network'
  | 'switching_network'
  | 'requesting_nonce'
  | 'signing'
  | 'linking'
  | 'linked'
  | 'unlinking'
  | 'error'

const LOADING_STATUSES: WalletLinkStatus[] = [
  'connecting',
  'switching_network',
  'requesting_nonce',
  'signing',
  'linking',
  'unlinking',
]

const getProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.ethereum ?? null
}

const isTargetChain = (chainId?: string | null) =>
  Boolean(chainId && chainId.toLowerCase() === WALLET_TARGET_CHAIN.chainIdHex.toLowerCase())

const normalizeAddress = (address: string) => address.trim()

const getMetaMaskErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as MetaMaskError | undefined

  if (maybeError?.code === 4001) {
    return 'You rejected the MetaMask request.'
  }

  if (maybeError?.code === -32002) {
    return 'MetaMask already has a pending request. Open MetaMask to continue.'
  }

  if (maybeError?.message) {
    return maybeError.message
  }

  return fallback
}

export const useWalletLink = () => {
  const toast = useToast()
  const refreshMe = useAuthStore((state) => state.refreshMe)
  const inFlightRef = useRef(false)
  const [status, setStatus] = useState<WalletLinkStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)

  const isLoading = LOADING_STATUSES.includes(status)
  const isWrongNetwork = status === 'wrong_network'
  const shortenedAddress = useMemo(() => {
    if (!walletAddress) {
      return null
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
  }, [walletAddress])

  const buttonLabel = useMemo(() => {
    if (status === 'connecting') return 'Connecting...'
    if (status === 'requesting_nonce') return 'Preparing...'
    if (status === 'signing') return 'Waiting for signature...'
    if (status === 'linking') return 'Connecting wallet...'
    if (status === 'switching_network') return `Switching to ${WALLET_TARGET_CHAIN.name}...`

    return 'Connect MetaMask'
  }, [status])

  const ensureProvider = useCallback(() => {
    const provider = getProvider()
    if (!provider?.isMetaMask) {
      const message = 'MetaMask is not installed. Install MetaMask to continue.'
      setStatus('not_installed')
      setError(message)
      toast.error(message, { title: 'Wallet connection' })
      return null
    }

    return provider
  }, [toast])

  const readChainId = useCallback(async (provider: EthereumProvider) => {
    const nextChainId = await provider.request<string>({ method: 'eth_chainId' })
    setChainId(nextChainId)

    return nextChainId
  }, [])

  const switchToTargetChain = useCallback(async () => {
    if (inFlightRef.current) {
      return false
    }

    const provider = ensureProvider()
    if (!provider) {
      return false
    }

    inFlightRef.current = true
    setStatus('switching_network')
    setError(null)

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WALLET_TARGET_CHAIN.chainIdHex }],
      })
      const nextChainId = await readChainId(provider)
      const hasTargetChain = isTargetChain(nextChainId)
      setStatus(hasTargetChain ? 'idle' : 'wrong_network')
      setError(hasTargetChain ? null : `Switch to ${WALLET_TARGET_CHAIN.name} before continuing.`)

      return hasTargetChain
    } catch (error) {
      const message = getMetaMaskErrorMessage(error, `Could not switch to ${WALLET_TARGET_CHAIN.name}.`)
      setStatus('wrong_network')
      setError(message)
      toast.warning(message, { title: 'Wallet connection' })
      return false
    } finally {
      inFlightRef.current = false
    }
  }, [ensureProvider, readChainId, toast])

  const linkWallet = useCallback(
    async (expectedAddress?: string | null) => {
      if (inFlightRef.current) {
        const message = 'MetaMask request is already in progress. Open MetaMask to continue.'
        setError(message)
        toast.warning(message, { title: 'Wallet connection' })
        return null
      }

      const provider = ensureProvider()
      if (!provider) {
        return null
      }

      inFlightRef.current = true
      setStatus('connecting')
      setError(null)

      try {
        const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
        const address = normalizeAddress(accounts?.[0] ?? '')

        if (!address) {
          throw new Error('No wallet account was returned by MetaMask.')
        }

        setWalletAddress(address)

        if (expectedAddress && address.toLowerCase() !== expectedAddress.toLowerCase()) {
          throw new Error(`Switch MetaMask to ${expectedAddress} before connecting this wallet.`)
        }

        const nextChainId = await readChainId(provider)
        if (!isTargetChain(nextChainId)) {
          setStatus('wrong_network')
          setError(`Switch to ${WALLET_TARGET_CHAIN.name} before connecting your wallet.`)
          return null
        }

        setStatus('requesting_nonce')
        const { nonce } = await usersApi.getWalletNonce(address)
        const message = buildSiweMessage({
          address,
          chainId: WALLET_TARGET_CHAIN.chainId,
          nonce,
        })

        setStatus('signing')
        const signature = await provider.request<string>({
          method: 'personal_sign',
          params: [message, address],
        })

        setStatus('linking')
        const user = await usersApi.linkWallet({ message, signature })
        await refreshMe()
        setStatus('linked')
        toast.success('Wallet connected to your account.', { title: 'Wallet connection' })

        return user
      } catch (error) {
        const message = getMetaMaskErrorMessage(error, 'Could not connect wallet.')
        setStatus('error')
        setError(message)
        toast.error(message, { title: 'Wallet connection' })
        return null
      } finally {
        inFlightRef.current = false
      }
    },
    [ensureProvider, readChainId, refreshMe, toast],
  )

  const unlinkWallet = useCallback(async () => {
    if (inFlightRef.current) {
      return null
    }

    inFlightRef.current = true
    setStatus('unlinking')
    setError(null)

    try {
      const user = await usersApi.unlinkWallet()
      await refreshMe()
      setWalletAddress(null)
      setStatus('idle')
      toast.success('Wallet disconnected from your account.', { title: 'Wallet connection' })

      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not disconnect wallet.'
      setStatus('error')
      setError(message)
      toast.error(message, { title: 'Wallet connection' })
      return null
    } finally {
      inFlightRef.current = false
    }
  }, [refreshMe, toast])

  return {
    buttonLabel,
    chainId,
    error,
    isLoading,
    isWrongNetwork,
    linkWallet,
    shortenedAddress,
    status,
    switchToTargetChain,
    targetChain: WALLET_TARGET_CHAIN,
    unlinkWallet,
    walletAddress,
  }
}
