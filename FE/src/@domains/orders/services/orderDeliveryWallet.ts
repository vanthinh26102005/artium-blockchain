import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'

const CONFIRM_DELIVERY_FUNCTION_SELECTOR = '0xa4506460'

export type OrderDeliveryWalletErrorCode =
  | 'missing_wallet'
  | 'wrong_chain'
  | 'rejected'
  | 'invalid_order'
  | 'invalid_contract'
  | 'contract_revert'
  | 'transaction_failed'

export class OrderDeliveryWalletError extends Error {
  constructor(
    public readonly code: OrderDeliveryWalletErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'OrderDeliveryWalletError'
  }
}

export type SubmitOrderDeliveryConfirmationInput = {
  onChainOrderId: string
  contractAddress: string
  expectedBuyerWallet?: string | null
}

export type SubmitOrderDeliveryConfirmationResult = {
  txHash: string
  walletAddress: string
  chainId: string
}

const getProvider = (): EthereumProvider => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new OrderDeliveryWalletError(
      'missing_wallet',
      'MetaMask is required to confirm this delivery.',
    )
  }

  return window.ethereum
}

const isRejectedRequest = (error: unknown) => {
  const maybeError = error as MetaMaskError | undefined
  return maybeError?.code === 4001
}

const assertContractAddress = (contractAddress: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new OrderDeliveryWalletError('invalid_contract', 'Auction contract address is invalid.')
  }
}

const assertOrderId = (onChainOrderId: string) => {
  if (!onChainOrderId.trim()) {
    throw new OrderDeliveryWalletError('invalid_order', 'On-chain order ID is missing.')
  }
}

const normalizeAddress = (address?: string | null) => address?.trim().toLowerCase() ?? null

const padHexWord = (hexValue: string) => hexValue.padStart(64, '0')

const utf8ToHex = (value: string) =>
  Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const encodeConfirmDeliveryCalldata = (onChainOrderId: string) => {
  const stringHex = utf8ToHex(onChainOrderId)
  const byteLength = stringHex.length / 2
  const paddedStringHex = stringHex.padEnd(Math.ceil(stringHex.length / 64) * 64, '0')

  return [
    CONFIRM_DELIVERY_FUNCTION_SELECTOR,
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
    case '0x229f9334':
      return 'This auction order does not exist on the configured contract.'
    case '0x3a5f4d4a':
      return 'Only the winning buyer wallet can confirm this delivery.'
    default:
      return 'The auction contract rejected this delivery confirmation. Refresh the order and try again.'
  }
}

export const submitOrderDeliveryConfirmation = async ({
  onChainOrderId,
  contractAddress,
  expectedBuyerWallet,
}: SubmitOrderDeliveryConfirmationInput): Promise<SubmitOrderDeliveryConfirmationResult> => {
  const provider = getProvider()
  assertContractAddress(contractAddress)
  assertOrderId(onChainOrderId)

  const chainId = await provider.request<string>({ method: 'eth_chainId' })
  if (chainId.toLowerCase() !== WALLET_TARGET_CHAIN.chainIdHex.toLowerCase()) {
    throw new OrderDeliveryWalletError(
      'wrong_chain',
      `Switch MetaMask to ${WALLET_TARGET_CHAIN.name} before confirming delivery.`,
    )
  }

  let accounts: string[]
  try {
    accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
  } catch (error) {
    throw new OrderDeliveryWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
      isRejectedRequest(error)
        ? 'You rejected the MetaMask account request.'
        : 'MetaMask account request failed.',
      error,
    )
  }

  const walletAddress = accounts[0]?.trim() ?? ''
  if (!walletAddress) {
    throw new OrderDeliveryWalletError('missing_wallet', 'No wallet account was selected.')
  }

  if (
    normalizeAddress(expectedBuyerWallet) &&
    normalizeAddress(walletAddress) !== normalizeAddress(expectedBuyerWallet)
  ) {
    throw new OrderDeliveryWalletError(
      'rejected',
      'Switch MetaMask to the winning buyer wallet before confirming delivery.',
    )
  }

  const transaction = {
    from: walletAddress,
    to: contractAddress,
    data: encodeConfirmDeliveryCalldata(onChainOrderId),
  }

  try {
    await provider.request({
      method: 'eth_call',
      params: [transaction, 'latest'],
    })
  } catch (error) {
    throw new OrderDeliveryWalletError('contract_revert', getContractRevertMessage(error), error)
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
    throw new OrderDeliveryWalletError(
      isRejectedRequest(error) ? 'rejected' : 'transaction_failed',
      isRejectedRequest(error)
        ? 'You rejected the delivery confirmation transaction.'
        : 'MetaMask could not submit the delivery confirmation transaction.',
      error,
    )
  }
}
