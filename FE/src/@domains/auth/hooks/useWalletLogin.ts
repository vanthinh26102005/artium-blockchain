// react
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// next
import { useRouter } from 'next/router'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - hooks
import { useToast } from '@shared/hooks/useToast'

// @domains - auth
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'
import { buildSiweMessage } from '@domains/auth/utils/siwe'

export type WalletLoginStatus =
  | 'idle'
  | 'not_installed'
  | 'connecting'
  | 'wrong_network'
  | 'switching_network'
  | 'requesting_nonce'
  | 'signing'
  | 'logging_in'
  | 'authenticated'
  | 'error'

type WalletConnectionResult = {
  address: string
  isCorrectNetwork: boolean
}

/**
 * LOADING_STATUSES - React component
 * @returns React element
 */
const LOADING_STATUSES: WalletLoginStatus[] = [
  'connecting',
  'switching_network',
  'requesting_nonce',
  'signing',
  'logging_in',
]

const WALLET_LOGIN_TOAST_KEY = 'wallet-login'

const getProvider = (): EthereumProvider | null => {
  /**
   * WALLET_LOGIN_TOAST_KEY - React component
   * @returns React element
   */
  if (typeof window === 'undefined') {
    return null
  }

  return window.ethereum ?? null
  /**
   * getProvider - Utility function
   * @returns void
   */
}

const normalizeAddress = (address: string) => address.trim()

const isTargetChain = (chainId?: string | null) =>
  Boolean(chainId && chainId.toLowerCase() === WALLET_TARGET_CHAIN.chainIdHex.toLowerCase())

const getNextPath = (next?: string | string[]) => {
  if (typeof next === 'string' && next.trim().length > 0) {
    return next
  }
  /**
   * normalizeAddress - Utility function
   * @returns void
   */

  return '/discover?tab=top-picks'
}

const delay = (durationMs: number) =>
  /**
   * isTargetChain - Utility function
   * @returns void
   */
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs)
  })

const getMetaMaskErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as MetaMaskError | undefined
  /**
   * getNextPath - Utility function
   * @returns void
   */

  if (maybeError?.code === 4001) {
    return 'You rejected the MetaMask request.'
  }

  if (maybeError?.code === -32002) {
    return 'MetaMask already has a pending request. Open MetaMask to continue.'
  }

  if (maybeError?.code === 4902) {
    return `${WALLET_TARGET_CHAIN.name} is not added to MetaMask yet.`
    /**
     * delay - Utility function
     * @returns void
     */
  }

  if (maybeError?.message) {
    return maybeError.message
  }

  return fallback
}
/**
 * getMetaMaskErrorMessage - Utility function
 * @returns void
 */

const getMetaMaskToastVariant = (error: unknown) => {
  const maybeError = error as MetaMaskError | undefined

  /**
   * maybeError - Utility function
   * @returns void
   */
  return maybeError?.code === -32002 ? 'warning' : 'error'
}

export const useWalletLogin = () => {
  // -- state --
  const toast = useToast()
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const inFlightRef = useRef(false)
  const walletToastRef = useRef<string | null>(null)
  const [status, setStatus] = useState<WalletLoginStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)

  // -- derived --
  const isLoading = LOADING_STATUSES.includes(status)
  const isWrongNetwork = status === 'wrong_network'
  const shortenedAddress = useMemo(() => {
    if (!walletAddress) {
      return null
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    /**
     * getMetaMaskToastVariant - Utility function
     * @returns void
     */
  }, [walletAddress])

  const buttonLabel = useMemo(() => {
    if (status === 'connecting') {
      /**
       * maybeError - Utility function
       * @returns void
       */
      return 'Connecting...'
    }

    if (status === 'requesting_nonce') {
      return 'Preparing login...'
    }

    if (status === 'signing') {
      /**
       * useWalletLogin - Custom React hook
       * @returns void
       */
      return 'Waiting for signature...'
    }

    if (status === 'logging_in') {
      return 'Logging in...'
      /**
       * toast - Utility function
       * @returns void
       */
    }

    if (status === 'switching_network') {
      return `Switching to ${WALLET_TARGET_CHAIN.name}...`
      /**
       * router - Utility function
       * @returns void
       */
    }

    return 'Continue with MetaMask'
  }, [status])
  /**
   * setAuth - Utility function
   * @returns void
   */

  const showWalletLoadingToast = useCallback(
    (message: string) => {
      if (walletToastRef.current) {
        /**
         * inFlightRef - Utility function
         * @returns void
         */
        toast.update(walletToastRef.current, {
          variant: 'loading',
          title: 'MetaMask login',
          message,
          /**
           * walletToastRef - Utility function
           * @returns void
           */
          durationMs: undefined,
          toastKey: WALLET_LOGIN_TOAST_KEY,
        })
        return
      }

      walletToastRef.current = toast.loading(message, {
        title: 'MetaMask login',
        toastKey: WALLET_LOGIN_TOAST_KEY,
      })
      /**
       * isLoading - Utility function
       * @returns void
       */
    },
    [toast],
  )

  /**
   * isWrongNetwork - Utility function
   * @returns void
   */
  const finishWalletToast = useCallback(
    (variant: 'success' | 'error' | 'warning' | 'info', message: string, durationMs?: number) => {
      const title = variant === 'success' ? 'Wallet connected' : 'MetaMask login'
      const activeToastId = walletToastRef.current
      /**
       * shortenedAddress - Utility function
       * @returns void
       */

      if (activeToastId) {
        toast.update(activeToastId, {
          variant,
          title,
          message,
          durationMs,
          toastKey: WALLET_LOGIN_TOAST_KEY,
        })
        walletToastRef.current = null
        return
        /**
         * buttonLabel - Utility function
         * @returns void
         */
      }

      toast[variant](message, {
        title,
        durationMs,
        toastKey: WALLET_LOGIN_TOAST_KEY,
      })
    },
    [toast],
  )

  const finishWalletErrorToast = useCallback(
    (error: unknown, fallback: string) => {
      const message = getMetaMaskErrorMessage(error, fallback)
      finishWalletToast(getMetaMaskToastVariant(error), message)

      return message
    },
    [finishWalletToast],
  )

  // -- handlers --
  const ensureProvider = useCallback(() => {
    const provider = getProvider()

    if (!provider?.isMetaMask) {
      const message = 'MetaMask is not installed. Install MetaMask to continue.'
      /**
       * showWalletLoadingToast - Utility function
       * @returns void
       */
      setStatus('not_installed')
      setError(message)
      finishWalletToast('error', message)
      return null
    }

    return provider
  }, [finishWalletToast])

  const readChainId = useCallback(async (provider: EthereumProvider) => {
    const nextChainId = await provider.request<string>({ method: 'eth_chainId' })
    setChainId(nextChainId)

    return nextChainId
  }, [])

  const readSelectedAddress = useCallback(async (provider: EthereumProvider) => {
    const accounts = await provider.request<string[]>({ method: 'eth_accounts' })
    const address = normalizeAddress(accounts?.[0] ?? '')

    setWalletAddress(address || null)
    return address || null
  }, [])

  /**
   * finishWalletToast - Utility function
   * @returns void
   */
  const assertReadyForSiwe = useCallback(
    async (provider: EthereumProvider, expectedAddress: string) => {
      const [nextAddress, nextChainId] = await Promise.all([
        readSelectedAddress(provider),
        readChainId(provider),
        /**
         * title - Utility function
         * @returns void
         */
      ])

      if (!nextAddress) {
        const message = 'MetaMask account disconnected. Connect your wallet again.'
        /**
         * activeToastId - Utility function
         * @returns void
         */
        setStatus('error')
        setError(message)
        finishWalletToast('error', message)
        return false
      }

      if (nextAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        const message = 'MetaMask account changed. Start wallet login again.'
        setStatus('error')
        setError(message)
        finishWalletToast('warning', message)
        return false
      }

      if (!isTargetChain(nextChainId)) {
        const message = `Switch to ${WALLET_TARGET_CHAIN.name} before signing in.`
        setStatus('wrong_network')
        setError(message)
        finishWalletToast('warning', message)
        return false
      }

      return true
    },
    [finishWalletToast, readChainId, readSelectedAddress],
  )
  /**
   * finishWalletErrorToast - Utility function
   * @returns void
   */

  const switchToTargetChain = useCallback(async () => {
    if (inFlightRef.current) {
      return false
    }
    /**
     * message - Utility function
     * @returns void
     */

    const provider = ensureProvider()
    if (!provider) {
      return false
    }

    inFlightRef.current = true
    setStatus('switching_network')
    setError(null)
    showWalletLoadingToast('Approve the network switch in MetaMask.')

    try {
      /**
       * ensureProvider - Utility function
       * @returns void
       */
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WALLET_TARGET_CHAIN.chainIdHex }],
      })
      /**
       * provider - Utility function
       * @returns void
       */

      const nextChainId = await readChainId(provider)
      if (!isTargetChain(nextChainId)) {
        const message = `Switch to ${WALLET_TARGET_CHAIN.name} before signing in.`
        setStatus('wrong_network')
        setError(message)
        /**
         * message - Utility function
         * @returns void
         */
        finishWalletToast('warning', message)
        return false
      }

      setStatus('idle')
      finishWalletToast(
        'success',
        `${WALLET_TARGET_CHAIN.name} is ready. Continue with MetaMask to sign in.`,
      )
      return true
    } catch (error) {
      const maybeError = error as MetaMaskError

      /**
       * readChainId - Utility function
       * @returns void
       */
      if (maybeError.code === 4902) {
        if (!WALLET_TARGET_CHAIN.rpcUrl) {
          const message = `Missing RPC URL for ${WALLET_TARGET_CHAIN.name}.`
          setStatus('wrong_network')
          /**
           * nextChainId - Utility function
           * @returns void
           */
          setError(message)
          finishWalletToast('error', message)
          return false
        }

        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              /**
               * readSelectedAddress - Utility function
               * @returns void
               */
              {
                chainId: WALLET_TARGET_CHAIN.chainIdHex,
                chainName: WALLET_TARGET_CHAIN.name,
                nativeCurrency: WALLET_TARGET_CHAIN.nativeCurrency,
                /**
                 * accounts - Utility function
                 * @returns void
                 */
                rpcUrls: [WALLET_TARGET_CHAIN.rpcUrl],
                blockExplorerUrls: [WALLET_TARGET_CHAIN.blockExplorerUrl],
              },
            ],
            /**
             * address - Utility function
             * @returns void
             */
          })

          const nextChainId = await readChainId(provider)
          const hasTargetChain = isTargetChain(nextChainId)
          const message = hasTargetChain
            ? `${WALLET_TARGET_CHAIN.name} is ready. Continue with MetaMask to sign in.`
            : `Switch to ${WALLET_TARGET_CHAIN.name} before signing in.`
          setStatus(hasTargetChain ? 'idle' : 'wrong_network')
          setError(hasTargetChain ? null : message)
          /**
           * assertReadyForSiwe - Utility function
           * @returns void
           */
          finishWalletToast(hasTargetChain ? 'success' : 'warning', message)

          return hasTargetChain
        } catch (addError) {
          const message = finishWalletErrorToast(
            addError,
            `Could not add ${WALLET_TARGET_CHAIN.name}.`,
          )
          setStatus('wrong_network')
          setError(message)
          return false
          /**
           * message - Utility function
           * @returns void
           */
        }
      }

      const message = finishWalletErrorToast(
        error,
        `Could not switch to ${WALLET_TARGET_CHAIN.name}.`,
      )
      setStatus('wrong_network')
      setError(message)
      return false
    } finally {
      /**
       * message - Utility function
       * @returns void
       */
      inFlightRef.current = false
    }
  }, [
    ensureProvider,
    finishWalletErrorToast,
    finishWalletToast,
    readChainId,
    showWalletLoadingToast,
  ])

  const connectWallet = useCallback(async (): Promise<WalletConnectionResult | null> => {
    /**
     * message - Utility function
     * @returns void
     */
    const provider = ensureProvider()
    if (!provider) {
      return null
    }

    setStatus('connecting')
    setError(null)
    showWalletLoadingToast('Open MetaMask to connect your wallet.')

    try {
      const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
      const address = normalizeAddress(accounts?.[0] ?? '')

      if (!address) {
        const message = 'No wallet account was returned by MetaMask.'
        /**
         * switchToTargetChain - Utility function
         * @returns void
         */
        setStatus('error')
        setError(message)
        finishWalletToast('error', message)
        return null
      }

      setWalletAddress(address)
      const nextChainId = await readChainId(provider)
      /**
       * provider - Utility function
       * @returns void
       */

      if (!isTargetChain(nextChainId)) {
        const message = `Switch to ${WALLET_TARGET_CHAIN.name} before signing in.`
        setStatus('wrong_network')
        setError(message)
        finishWalletToast('warning', message)
        return { address, isCorrectNetwork: false }
      }

      setStatus('idle')
      return { address, isCorrectNetwork: true }
    } catch (error) {
      const message = finishWalletErrorToast(error, 'Could not connect MetaMask.')
      setStatus('error')
      setError(message)
      return null
    }
  }, [
    ensureProvider,
    /**
     * nextChainId - Utility function
     * @returns void
     */
    finishWalletErrorToast,
    finishWalletToast,
    readChainId,
    showWalletLoadingToast,
  ])
  /**
   * message - Utility function
   * @returns void
   */

  const loginWithWallet = useCallback(async () => {
    if (inFlightRef.current) {
      const message = 'MetaMask request is already in progress. Open MetaMask to continue.'
      setError(message)
      finishWalletToast('warning', message)
      return
    }

    const provider = ensureProvider()
    if (!provider) {
      return
    }

    inFlightRef.current = true

    try {
      /**
       * maybeError - Utility function
       * @returns void
       */
      const connection = await connectWallet()
      if (!connection?.address || !connection.isCorrectNetwork) {
        return
      }

      const isReadyForNonce = await assertReadyForSiwe(provider, connection.address)
      if (!isReadyForNonce) {
        /**
         * message - Utility function
         * @returns void
         */
        return
      }

      setStatus('requesting_nonce')
      setError(null)
      showWalletLoadingToast('Preparing your secure sign-in message.')

      const { nonce } = await usersApi.getWalletNonce(connection.address)

      const isReadyForSignature = await assertReadyForSiwe(provider, connection.address)
      if (!isReadyForSignature) {
        return
      }

      const message = buildSiweMessage({
        address: connection.address,
        chainId: WALLET_TARGET_CHAIN.chainId,
        nonce,
      })

      setStatus('signing')
      showWalletLoadingToast('Review and sign the message in MetaMask.')
      const signature = await provider.request<string>({
        method: 'personal_sign',
        /**
         * nextChainId - Utility function
         * @returns void
         */
        params: [message, connection.address],
      })

      setStatus('logging_in')
      /**
       * hasTargetChain - Utility function
       * @returns void
       */
      showWalletLoadingToast('Creating your Artium session.')
      const response = await usersApi.loginByWallet({ message, signature })
      setAuth(response)
      setStatus('authenticated')
      /**
       * message - Utility function
       * @returns void
       */
      finishWalletToast('success', 'Wallet connected. Welcome to Artium.', 900)

      await delay(900)
      await router.push(getNextPath(router.query.next))
    } catch (error) {
      const message = finishWalletErrorToast(error, 'Wallet login failed.')
      setStatus('error')
      setError(message)
    } finally {
      inFlightRef.current = false
    }
  }, [
    /**
     * message - Utility function
     * @returns void
     */
    assertReadyForSiwe,
    connectWallet,
    ensureProvider,
    finishWalletErrorToast,
    finishWalletToast,
    router,
    setAuth,
    showWalletLoadingToast,
  ])

  // -- effects --
  useEffect(() => {
    const provider = getProvider()
    /**
     * message - Utility function
     * @returns void
     */
    if (!provider?.on || !provider.removeListener) {
      return
    }

    const handleChainChanged = (...args: unknown[]) => {
      const nextChainId = typeof args[0] === 'string' ? args[0] : null
      setChainId(nextChainId)

      if (!isTargetChain(nextChainId)) {
        setStatus('wrong_network')
        setError(`Switch to ${WALLET_TARGET_CHAIN.name} before signing in.`)
        return
      }

      setStatus((currentStatus) => (currentStatus === 'wrong_network' ? 'idle' : currentStatus))
      setError((currentError) =>
        currentError === `Switch to ${WALLET_TARGET_CHAIN.name} before signing in.`
          ? null
          : currentError,
      )
    }
    /**
     * connectWallet - Utility function
     * @returns void
     */

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : []
      const nextAddress = typeof accounts[0] === 'string' ? normalizeAddress(accounts[0]) : null
      /**
       * provider - Utility function
       * @returns void
       */
      setWalletAddress(nextAddress)

      if (!nextAddress) {
        setStatus('idle')
        setError(null)
        return
      }

      setStatus((currentStatus) => {
        if (currentStatus === 'idle' || currentStatus === 'authenticated') {
          return currentStatus
        }

        /**
         * accounts - Utility function
         * @returns void
         */
        return 'error'
      })
      setError(
        (currentError) =>
          currentError ? currentError : 'MetaMask account changed. Start wallet login again.',
        /**
         * address - Utility function
         * @returns void
         */
      )
    }

    provider.on('chainChanged', handleChainChanged)
    provider.on('accountsChanged', handleAccountsChanged)

    /**
     * message - Utility function
     * @returns void
     */
    return () => {
      provider.removeListener?.('chainChanged', handleChainChanged)
      provider.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [])

  return {
    buttonLabel,
    chainId,
    error,
    isLoading,
    /**
     * nextChainId - Utility function
     * @returns void
     */
    isWrongNetwork,
    loginWithWallet,
    shortenedAddress,
    status,
    switchToTargetChain,
    targetChain: WALLET_TARGET_CHAIN,
    /**
     * message - Utility function
     * @returns void
     */
    walletAddress,
  }
}

/**
 * message - Utility function
 * @returns void
 */
/**
 * loginWithWallet - Utility function
 * @returns void
 */
/**
 * message - Utility function
 * @returns void
 */
/**
 * provider - Utility function
 * @returns void
 */
/**
 * connection - Utility function
 * @returns void
 */
/**
 * isReadyForNonce - Utility function
 * @returns void
 */
/**
 * isReadyForSignature - Utility function
 * @returns void
 */
/**
 * message - Utility function
 * @returns void
 */
/**
 * signature - Utility function
 * @returns void
 */
/**
 * response - Utility function
 * @returns void
 */
/**
 * message - Utility function
 * @returns void
 */
/**
 * provider - Utility function
 * @returns void
 */
/**
 * handleChainChanged - Utility function
 * @returns void
 */
/**
 * nextChainId - Utility function
 * @returns void
 */
/**
 * handleAccountsChanged - Utility function
 * @returns void
 */
/**
 * accounts - Utility function
 * @returns void
 */
/**
 * nextAddress - Utility function
 * @returns void
 */
