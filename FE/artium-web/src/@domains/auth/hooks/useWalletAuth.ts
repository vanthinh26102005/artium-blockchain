import { useCallback, useState } from 'react'
import walletAuthApi from '@shared/apis/walletAuthApi'
import type { WalletAuthResponse, EthereumProvider } from '@shared/types/walletAuth'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type UseWalletAuthResult = {
  login: () => Promise<WalletAuthResponse>
  isLoading: boolean
  error: string | null
  walletAddress: string | null
}

type SiweMessageInput = {
  address: string
  chainId: number
  nonce: string
  domain: string
  uri: string
  issuedAt: string
}

const DEFAULT_SIWE_CHAIN_ID = 11155111
const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_CHAIN_HEX = '0xaa36a7'

const getEthereumProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const globalWindow = window as Window & {
    ethereum?: EthereumProvider
  }

  const injectedProvider = globalWindow.ethereum

  if (!injectedProvider) {
    return null
  }

  const discoveredProviders = Array.isArray(injectedProvider.providers)
    ? injectedProvider.providers
    : []

  const metaMaskProvider = discoveredProviders.find((provider) => provider.isMetaMask)

  if (metaMaskProvider) {
    return metaMaskProvider
  }

  if (injectedProvider.isMetaMask) {
    return injectedProvider
  }

  return injectedProvider
}

const resolveTargetChainId = () => {
  const configuredChainId = Number.parseInt(
    process.env.NEXT_PUBLIC_SIWE_CHAIN_ID ?? `${DEFAULT_SIWE_CHAIN_ID}`,
    10,
  )

  return Number.isInteger(configuredChainId) && configuredChainId > 0
    ? configuredChainId
    : DEFAULT_SIWE_CHAIN_ID
}

const resolveSiweDomain = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SIWE_DOMAIN ?? 'localhost'
  }

  return process.env.NEXT_PUBLIC_SIWE_DOMAIN ?? window.location.host
}

const resolveSiweUri = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SIWE_URI ?? 'http://localhost:3000'
  }

  return process.env.NEXT_PUBLIC_SIWE_URI ?? window.location.origin
}

const parseChainId = (value: string) => {
  if (value.startsWith('0x')) {
    return Number.parseInt(value, 16)
  }

  return Number.parseInt(value, 10)
}

const toHexChainId = (value: number) => `0x${value.toString(16)}`

const getCurrentChainId = async (provider: EthereumProvider) => {
  const chainIdHex = await provider.request<string>({ method: 'eth_chainId' })
  const chainId = parseChainId(chainIdHex)

  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error('Unable to resolve the current wallet chain ID.')
  }

  return chainId
}

const ensureTargetChain = async (provider: EthereumProvider, targetChainId: number) => {
  const currentChainId = await getCurrentChainId(provider)
  if (currentChainId === targetChainId) {
    return currentChainId
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: toHexChainId(targetChainId) }],
    })
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 4902 &&
      targetChainId === SEPOLIA_CHAIN_ID
    ) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_HEX,
            chainName: 'Sepolia',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'SepoliaETH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      })

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      })
    } else if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 4001
    ) {
      throw new Error('Wallet network switch was rejected by the user.')
    } else {
      throw error
    }
  }

  const updatedChainId = await getCurrentChainId(provider)
  if (updatedChainId !== targetChainId) {
    throw new Error(
      `Wallet network mismatch. Expected chain id ${targetChainId}, received ${updatedChainId}.`,
    )
  }

  return updatedChainId
}

const buildSiweMessage = ({
  address,
  chainId,
  nonce,
  domain,
  uri,
  issuedAt,
}: SiweMessageInput) => {
  return `${domain} wants you to sign in with your Ethereum account:
${address}

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`
}

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: number }).code === 4001
  ) {
    return 'Wallet request was rejected by the user.'
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return 'Wallet login failed.'
}

export const useWalletAuth = (): UseWalletAuthResult => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const login = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const provider = getEthereumProvider()

      if (!provider) {
        throw new Error('No Ethereum wallet detected in this browser.')
      }

      const accounts = await provider.request<string[]>({
        method: 'eth_requestAccounts',
      })
      const address = accounts[0]

      if (!address) {
        throw new Error('No wallet account is available.')
      }

      const chainId = await ensureTargetChain(provider, resolveTargetChainId())
      const { nonce } = await walletAuthApi.getWalletNonce(address)

      const issuedAt = new Date().toISOString()
      const message = buildSiweMessage({
        address,
        chainId,
        nonce,
        domain: resolveSiweDomain(),
        uri: resolveSiweUri(),
        issuedAt,
      })

      const signature = await provider.request<string>({
        method: 'personal_sign',
        params: [message, address],
      })

      const response = await walletAuthApi.loginWithWallet({
        message,
        signature,
      })

      setAuth(response)
      setWalletAddress(address.toLowerCase())

      return response
    } catch (error) {
      const message = getErrorMessage(error)
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setAuth])

  return {
    login,
    isLoading,
    error,
    walletAddress,
  }
}
