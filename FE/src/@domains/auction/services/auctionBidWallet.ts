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
  | 'insufficient_funds'
  | 'contract_revert'
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

const formatEthAmount = (wei: bigint) => {
  const base = BigInt(10) ** BigInt(WEI_DECIMALS)
  const whole = wei / base
  const fraction = wei % base
  const fractionText = fraction.toString().padStart(WEI_DECIMALS, '0').replace(/0+$/, '')

  return fractionText ? `${whole}.${fractionText}` : whole.toString()
}

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

const getObjectField = (value: unknown, field: string): unknown => {
  if (!value || typeof value !== 'object' || !(field in value)) {
    return undefined
  }

  return (value as Record<string, unknown>)[field]
}

const extractRevertData = (error: unknown): string | null => {
  if (typeof error === 'string') {
    const match = error.match(/0x[a-fA-F0-9]{8,}/)
    return match?.[0] ?? null
  }

  const data = getObjectField(error, 'data')
  if (typeof data === 'string' && /^0x[a-fA-F0-9]{8,}$/.test(data)) {
    return data
  }

  const nestedData = getObjectField(data, 'data')
  if (typeof nestedData === 'string' && /^0x[a-fA-F0-9]{8,}$/.test(nestedData)) {
    return nestedData
  }

  const messageData = extractRevertData(getObjectField(error, 'message'))
  if (messageData) {
    return messageData
  }

  return extractRevertData(getObjectField(error, 'cause'))
}

const getContractRevertMessage = (error: unknown) => {
  const revertSelector = extractRevertData(error)?.slice(0, 10).toLowerCase()

  switch (revertSelector) {
    case '0xef025889':
      return 'The seller wallet cannot bid on its own auction. Switch to a buyer wallet and try again.'
    case '0x229f9334':
      return 'This auction does not exist on the configured Sepolia contract.'
    case '0x77e5c5f2':
      return 'This auction is not currently accepting bids.'
    case '0x9eafe1b7':
      return 'This auction has already ended on-chain.'
    case '0xf7ea5440':
    case '0x2ebc0046':
      return 'This bid is below the minimum required by the on-chain auction state. Refresh the lot and try again.'
    default:
      return 'The auction contract rejected this bid during simulation. Refresh the lot and try again.'
  }
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
  const valueWei = decimalEthToWei(bidAmountEth)

  const balanceHex = await provider.request<string>({
    method: 'eth_getBalance',
    params: [walletAddress, 'latest'],
  })
  const balanceWei = BigInt(balanceHex)

  if (balanceWei <= valueWei) {
    throw new AuctionBidWalletError(
      'insufficient_funds',
      `Your selected wallet has ${formatEthAmount(
        balanceWei,
      )} SepoliaETH, but this bid sends ${formatEthAmount(
        valueWei,
      )} SepoliaETH before gas. Use a funded buyer wallet or lower the bid if the auction allows it.`,
    )
  }

  const transaction = {
    from: walletAddress,
    to: contractAddress,
    value,
    data,
  }

  try {
    await provider.request({
      method: 'eth_call',
      params: [transaction, 'latest'],
    })
  } catch (error) {
    throw new AuctionBidWalletError('contract_revert', getContractRevertMessage(error), error)
  }

  try {
    const txHash = await provider.request<string>({
      method: 'eth_sendTransaction',
      params: [transaction],
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
