import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'

const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'
const BID_FUNCTION_SELECTOR = '0x7aef951c'
const WEI_DECIMALS = 18

export type AuctionBidWalletErrorCode =
  | 'missing_wallet'
  | 'wrong_chain'
  | 'rejected'
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

const normalizeAddress = (address: string) => address.trim()

const assertContractAddress = (contractAddress: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new AuctionBidWalletError('invalid_contract', 'Auction contract address is invalid.')
  }
}

const decimalEthToWei = (amountEth: string | number) => {
  const normalized = String(amountEth).trim()

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new AuctionBidWalletError('invalid_amount', 'Bid amount must be a valid ETH value.')
  }

  const [wholePart, fractionPart = ''] = normalized.split('.')
  if (fractionPart.length > WEI_DECIMALS) {
    throw new AuctionBidWalletError(
      'invalid_amount',
      'Bid amount supports up to 18 decimal places.',
    )
  }

  const wei =
    BigInt(wholePart) * BigInt(10) ** BigInt(WEI_DECIMALS) +
    BigInt(fractionPart.padEnd(WEI_DECIMALS, '0'))

  if (wei <= BigInt(0)) {
    throw new AuctionBidWalletError('invalid_amount', 'Bid amount must be greater than zero.')
  }

  return wei
}

const toHexQuantity = (value: bigint) => `0x${value.toString(16)}`

const padHexWord = (hexValue: string) => hexValue.padStart(64, '0')

const utf8ToHex = (value: string) =>
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
  try {
    accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
  } catch (error) {
    throw new AuctionBidWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
      isRejectedRequest(error)
        ? 'You rejected the MetaMask account request.'
        : 'MetaMask account request failed.',
      error,
    )
  }

  const walletAddress = accounts[0] ? normalizeAddress(accounts[0]) : ''
  if (!walletAddress) {
    throw new AuctionBidWalletError('missing_wallet', 'No wallet account was selected.')
  }

  const value = toHexQuantity(decimalEthToWei(bidAmountEth))
  const data = encodeBidCalldata(auctionId)

  try {
    const txHash = await provider.request<string>({
      method: 'eth_sendTransaction',
      params: [
        {
          from: walletAddress,
          to: contractAddress,
          value,
          data,
        },
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
        : 'MetaMask could not submit the bid transaction.',
      error,
    )
  }
}
