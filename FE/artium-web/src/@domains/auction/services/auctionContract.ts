import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther } from 'ethers'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'

const AUCTION_ESCROW_ABI = [
  'function getAuction(string orderId) view returns (address seller, address highestBidder, uint256 highestBid, uint256 startTime, uint256 endTime, uint256 minBidIncrement, string ipfsHash, uint8 state)',
  'function bid(string orderId) payable',
] as const

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export type AuctionContractState = {
  seller: string
  highestBidder: string
  highestBidWei: string
  highestBidEth: number
  startTime: string
  endTime: string
  minBidIncrementWei: string
  minBidIncrementEth: number
  ipfsHash: string
  state: number
  exists: boolean
}

export type PlaceBidInput = {
  orderId: string
  amountEth: string
  onTransactionHash?: (transactionHash: string) => void
}

const getContractAddress = () => {
  const configuredAddress =
    process.env.NEXT_PUBLIC_AUCTION_ESCROW_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_PLATFORM_ETH_WALLET ||
    ''

  if (!configuredAddress) {
    throw new Error('Auction escrow contract address is not configured.')
  }

  return configuredAddress
}

const getRpcUrl = () => process.env.NEXT_PUBLIC_ETH_RPC_URL || process.env.NEXT_PUBLIC_WEB3_RPC_URL || ''

const getReadProvider = () => {
  const rpcUrl = getRpcUrl()

  if (!rpcUrl) {
    throw new Error('Ethereum RPC URL is not configured.')
  }

  return new JsonRpcProvider(rpcUrl)
}

const getBigNumberishString = (value: unknown) =>
  value === null || value === undefined ? '0' : value.toString()

const classifyContractError = (error: unknown, fallback: string) => {
  const maybeError = error as { code?: number | string; shortMessage?: string; reason?: string; message?: string }
  const message = maybeError.shortMessage || maybeError.reason || maybeError.message || fallback

  if (maybeError.code === 4001 || message.toLowerCase().includes('user rejected')) {
    return 'You rejected the MetaMask request.'
  }

  if (message.includes('SellerCannotBid')) {
    return 'The seller wallet cannot bid on its own auction.'
  }

  if (message.includes('BidBelowMinimum') || message.includes('BidIncrementTooLow')) {
    return 'The bid is below the current on-chain minimum.'
  }

  if (message.includes('AuctionNotFound')) {
    return 'This on-chain auction does not exist.'
  }

  if (message.includes('InvalidState')) {
    return 'This auction is no longer accepting bids.'
  }

  if (message.includes('AuctionNotExpired')) {
    return 'This auction state is not ready for that action yet.'
  }

  return message
}

const ensureMetaMaskOnTargetChain = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is required to place an on-chain bid.')
  }

  const chainId = await window.ethereum.request<string>({ method: 'eth_chainId' })

  if (chainId?.toLowerCase() === WALLET_TARGET_CHAIN.chainIdHex.toLowerCase()) {
    return
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: WALLET_TARGET_CHAIN.chainIdHex }],
    })
  } catch (error) {
    throw new Error(classifyContractError(error, `Switch MetaMask to ${WALLET_TARGET_CHAIN.name}.`))
  }
}

export const readAuctionState = async (orderId: string): Promise<AuctionContractState> => {
  try {
    const contract = new Contract(getContractAddress(), AUCTION_ESCROW_ABI, getReadProvider())
    const result = await contract.getAuction(orderId)
    const seller = String(result.seller ?? ZERO_ADDRESS)
    const highestBidder = String(result.highestBidder ?? ZERO_ADDRESS)
    const highestBidWei = getBigNumberishString(result.highestBid)
    const minBidIncrementWei = getBigNumberishString(result.minBidIncrement)

    return {
      seller,
      highestBidder,
      highestBidWei,
      highestBidEth: Number(formatEther(highestBidWei)),
      startTime: getBigNumberishString(result.startTime),
      endTime: getBigNumberishString(result.endTime),
      minBidIncrementWei,
      minBidIncrementEth: Number(formatEther(minBidIncrementWei)),
      ipfsHash: String(result.ipfsHash ?? ''),
      state: Number(result.state ?? 0),
      exists: seller.toLowerCase() !== ZERO_ADDRESS,
    }
  } catch (error) {
    throw new Error(classifyContractError(error, 'Unable to read auction state from the contract.'))
  }
}

export const placeBidOnAuction = async ({
  orderId,
  amountEth,
  onTransactionHash,
}: PlaceBidInput): Promise<{ transactionHash: string }> => {
  try {
    await ensureMetaMaskOnTargetChain()

    if (!window.ethereum) {
      throw new Error('MetaMask is required to place an on-chain bid.')
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' })

    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new Contract(getContractAddress(), AUCTION_ESCROW_ABI, signer)
    const transaction = await contract.bid(orderId, { value: parseEther(amountEth) })

    onTransactionHash?.(transaction.hash)

    const receipt = await transaction.wait()
    if (receipt?.status !== 1) {
      throw new Error('The bid transaction was mined but reverted on-chain.')
    }

    return { transactionHash: transaction.hash }
  } catch (error) {
    throw new Error(classifyContractError(error, 'Unable to submit bid transaction.'))
  }
}
