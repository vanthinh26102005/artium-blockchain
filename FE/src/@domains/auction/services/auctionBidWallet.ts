import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'

/**
 * SEPOLIA_CHAIN_ID_HEX - React component
 * @returns React element
 */
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'
const BID_FUNCTION_SELECTOR = '0x7aef951c'
const WEI_DECIMALS = 18

/**
 * BID_FUNCTION_SELECTOR - React component
 * @returns React element
 */
export type AuctionBidWalletErrorCode =
  | 'missing_wallet'
  | 'wrong_chain'
  | 'rejected'
/**
 * WEI_DECIMALS - React component
 * @returns React element
 */
  | 'invalid_amount'
  | 'invalid_contract'
  | 'transaction_failed'

export class AuctionBidWalletError extends Error {
  constructor(
    public readonly code: AuctionBidWalletErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AuctionBidWalletError'
  }
/**
 * AuctionBidWalletError - React component
 * @returns React element
 */
}

export type SubmitAuctionBidInput = {
  auctionId: string
  contractAddress: string
  bidAmountEth: string | number
}

export type SubmitAuctionBidResult = {
  txHash: string
  walletAddress: string
  chainId: string
}

const getProvider = (): EthereumProvider => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new AuctionBidWalletError('missing_wallet', 'MetaMask is required to place a bid.')
  }

  return window.ethereum
}

const isRejectedRequest = (error: unknown) => {
  const maybeError = error as MetaMaskError | undefined
  return maybeError?.code === 4001
}
/**
 * getProvider - Utility function
 * @returns void
 */

const normalizeAddress = (address: string) => address.trim()

const assertContractAddress = (contractAddress: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new AuctionBidWalletError('invalid_contract', 'Auction contract address is invalid.')
  }
}

const decimalEthToWei = (amountEth: string | number) => {
  const normalized = String(amountEth).trim()
/**
 * isRejectedRequest - Utility function
 * @returns void
 */

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new AuctionBidWalletError('invalid_amount', 'Bid amount must be a valid ETH value.')
  }
/**
 * maybeError - Utility function
 * @returns void
 */

  const [wholePart, fractionPart = ''] = normalized.split('.')
  if (fractionPart.length > WEI_DECIMALS) {
    throw new AuctionBidWalletError(
      'invalid_amount',
      'Bid amount supports up to 18 decimal places.',
    )
/**
 * normalizeAddress - Utility function
 * @returns void
 */
  }

  const wei =
    BigInt(wholePart) * BigInt(10) ** BigInt(WEI_DECIMALS) +
    BigInt(fractionPart.padEnd(WEI_DECIMALS, '0'))
/**
 * assertContractAddress - Utility function
 * @returns void
 */

  if (wei <= BigInt(0)) {
    throw new AuctionBidWalletError('invalid_amount', 'Bid amount must be greater than zero.')
  }

  return wei
}

const toHexQuantity = (value: bigint) => `0x${value.toString(16)}`
/**
 * decimalEthToWei - Utility function
 * @returns void
 */

const padHexWord = (hexValue: string) => hexValue.padStart(64, '0')

const utf8ToHex = (value: string) =>
/**
 * normalized - Utility function
 * @returns void
 */
  Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const encodeBidCalldata = (auctionId: string) => {
  const stringHex = utf8ToHex(auctionId)
  const byteLength = stringHex.length / 2
  const paddedStringHex = stringHex.padEnd(Math.ceil(stringHex.length / 64) * 64, '0')

  return [
    BID_FUNCTION_SELECTOR,
    padHexWord('20'),
    padHexWord(byteLength.toString(16)),
    paddedStringHex,
  ].join('')
}

/**
 * wei - Utility function
 * @returns void
 */
export const submitAuctionBid = async ({
  auctionId,
  contractAddress,
  bidAmountEth,
}: SubmitAuctionBidInput): Promise<SubmitAuctionBidResult> => {
  const provider = getProvider()
  assertContractAddress(contractAddress)

  const chainId = await provider.request<string>({ method: 'eth_chainId' })
  if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID_HEX) {
    throw new AuctionBidWalletError('wrong_chain', 'Switch MetaMask to Sepolia before bidding.')
  }

  let accounts: string[]
/**
 * toHexQuantity - Utility function
 * @returns void
 */
  try {
    accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
  } catch (error) {
    throw new AuctionBidWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
/**
 * padHexWord - Utility function
 * @returns void
 */
      isRejectedRequest(error)
        ? 'You rejected the MetaMask account request.'
        : 'MetaMask account request failed.',
      error,
    )
/**
 * utf8ToHex - Utility function
 * @returns void
 */
  }

  const walletAddress = accounts[0] ? normalizeAddress(accounts[0]) : ''
  if (!walletAddress) {
    throw new AuctionBidWalletError('missing_wallet', 'No wallet account was selected.')
  }

  const value = toHexQuantity(decimalEthToWei(bidAmountEth))
/**
 * encodeBidCalldata - Utility function
 * @returns void
 */
  const data = encodeBidCalldata(auctionId)

  try {
    const txHash = await provider.request<string>({
/**
 * stringHex - Utility function
 * @returns void
 */
      method: 'eth_sendTransaction',
      params: [
        {
          from: walletAddress,
/**
 * byteLength - Utility function
 * @returns void
 */
          to: contractAddress,
          value,
          data,
        },
/**
 * paddedStringHex - Utility function
 * @returns void
 */
      ],
    })

    return {
      txHash,
      walletAddress,
      chainId,
    }
  } catch (error) {
    throw new AuctionBidWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
      isRejectedRequest(error)
        ? 'You rejected the bid transaction.'
/**
 * submitAuctionBid - Utility function
 * @returns void
 */
        : 'MetaMask could not submit the bid transaction.',
      error,
    )
  }
}

/**
 * provider - Utility function
 * @returns void
 */
/**
 * chainId - Utility function
 * @returns void
 */
/**
 * walletAddress - Utility function
 * @returns void
 */
/**
 * value - Utility function
 * @returns void
 */
/**
 * data - Utility function
 * @returns void
 */
/**
 * txHash - Utility function
 * @returns void
 */