import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'

const MARK_SHIPPED_FUNCTION_SELECTOR = '0xff70a162'

export type OrderShipmentWalletErrorCode =
  | 'missing_wallet'
  | 'wrong_chain'
  | 'rejected'
  | 'invalid_order'
  | 'invalid_contract'
  | 'invalid_tracking'
  | 'wrong_wallet'
  | 'contract_revert'
  | 'transaction_failed'

export class OrderShipmentWalletError extends Error {
  constructor(
    public readonly code: OrderShipmentWalletErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'OrderShipmentWalletError'
  }
}

export type SubmitOrderShipmentInput = {
  onChainOrderId: string
  contractAddress: string
  trackingHash: string
  expectedSellerWallet?: string | null
}

export type SubmitOrderShipmentResult = {
  txHash: string
  walletAddress: string
  chainId: string
}

const getProvider = (): EthereumProvider => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new OrderShipmentWalletError(
      'missing_wallet',
      'MetaMask is required to confirm this shipment on-chain.',
    )
  }

  return window.ethereum
}

const isRejectedRequest = (error: unknown) => {
  const maybeError = error as MetaMaskError | undefined
  return maybeError?.code === 4001
}

const normalizeAddress = (address?: string | null) => address?.trim().toLowerCase() ?? null

const assertContractAddress = (contractAddress: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new OrderShipmentWalletError('invalid_contract', 'Auction contract address is invalid.')
  }
}

const assertOrderId = (onChainOrderId: string) => {
  if (!onChainOrderId.trim()) {
    throw new OrderShipmentWalletError('invalid_order', 'On-chain order ID is missing.')
  }
}

const assertTrackingHash = (trackingHash: string) => {
  if (!trackingHash.trim()) {
    throw new OrderShipmentWalletError(
      'invalid_tracking',
      'Tracking number or shipping proof is required.',
    )
  }
}

const padHexWord = (hexValue: string) => hexValue.padStart(64, '0')

const utf8ToHex = (value: string) =>
  Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const encodeStringTail = (value: string) => {
  const stringHex = utf8ToHex(value)
  const byteLength = stringHex.length / 2
  const paddedStringHex = stringHex.padEnd(Math.ceil(stringHex.length / 64) * 64, '0')

  return `${padHexWord(byteLength.toString(16))}${paddedStringHex}`
}

const encodeMarkShippedCalldata = (onChainOrderId: string, trackingHash: string) => {
  const orderIdTail = encodeStringTail(onChainOrderId)
  const trackingTail = encodeStringTail(trackingHash)
  const orderIdOffsetBytes = 64
  const trackingOffsetBytes = orderIdOffsetBytes + orderIdTail.length / 2

  return [
    MARK_SHIPPED_FUNCTION_SELECTOR,
    padHexWord(orderIdOffsetBytes.toString(16)),
    padHexWord(trackingOffsetBytes.toString(16)),
    orderIdTail,
    trackingTail,
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
    case '0x229f9334':
      return 'This auction order does not exist on the configured contract.'
    default:
      return 'The auction contract rejected this shipment. Confirm the auction is finalized and use the seller wallet.'
  }
}

export const submitOrderShipmentConfirmation = async ({
  onChainOrderId,
  contractAddress,
  trackingHash,
  expectedSellerWallet,
}: SubmitOrderShipmentInput): Promise<SubmitOrderShipmentResult> => {
  const provider = getProvider()
  assertContractAddress(contractAddress)
  assertOrderId(onChainOrderId)
  assertTrackingHash(trackingHash)

  const chainId = await provider.request<string>({ method: 'eth_chainId' })
  if (chainId.toLowerCase() !== WALLET_TARGET_CHAIN.chainIdHex.toLowerCase()) {
    throw new OrderShipmentWalletError(
      'wrong_chain',
      `Switch MetaMask to ${WALLET_TARGET_CHAIN.name} before confirming shipment.`,
    )
  }

  let accounts: string[]
  try {
    accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
  } catch (error) {
    throw new OrderShipmentWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
      isRejectedRequest(error)
        ? 'You rejected the MetaMask account request.'
        : 'MetaMask account request failed.',
      error,
    )
  }

  const walletAddress = accounts[0]?.trim() ?? ''
  if (!walletAddress) {
    throw new OrderShipmentWalletError('missing_wallet', 'No wallet account was selected.')
  }

  if (
    normalizeAddress(expectedSellerWallet) &&
    normalizeAddress(walletAddress) !== normalizeAddress(expectedSellerWallet)
  ) {
    throw new OrderShipmentWalletError(
      'wrong_wallet',
      'Switch MetaMask to the seller wallet before confirming shipment.',
    )
  }

  const transaction = {
    from: walletAddress,
    to: contractAddress,
    data: encodeMarkShippedCalldata(onChainOrderId, trackingHash),
  }

  try {
    await provider.request({
      method: 'eth_call',
      params: [transaction, 'latest'],
    })
  } catch (error) {
    throw new OrderShipmentWalletError('contract_revert', getContractRevertMessage(error), error)
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
    throw new OrderShipmentWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
      isRejectedRequest(error)
        ? 'You rejected the shipment transaction.'
        : 'MetaMask could not submit the shipment transaction.',
      error,
    )
  }
}
