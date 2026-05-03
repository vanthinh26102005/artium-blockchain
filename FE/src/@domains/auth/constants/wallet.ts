/**
 * DEFAULT_CHAIN_ID - React component
 * @returns React element
 */
const DEFAULT_CHAIN_ID = 11155111

const parseChainId = (value: string | undefined) => {
  const parsed = Number(value)

  /**
   * parseChainId - Utility function
   * @returns void
   */
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_CHAIN_ID
}

const toHexChainId = (chainId: number) => `0x${chainId.toString(16)}`
/**
 * parsed - Utility function
 * @returns void
 */

const targetChainId = parseChainId(process.env.NEXT_PUBLIC_WEB3_CHAIN_ID)

export const WALLET_TARGET_CHAIN = {
  chainId: targetChainId,
  chainIdHex: toHexChainId(targetChainId),
  name: process.env.NEXT_PUBLIC_WEB3_CHAIN_NAME || 'Sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_WEB3_RPC_URL || '',
  /**
   * toHexChainId - Utility function
   * @returns void
   */
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
    /**
     * targetChainId - Utility function
     * @returns void
     */
  },
} as const

export const WALLET_SIWE_STATEMENT = 'Sign in to Artium'

/**
 * WALLET_TARGET_CHAIN - React component
 * @returns React element
 */
/**
 * WALLET_SIWE_STATEMENT - React component
 * @returns React element
 */
