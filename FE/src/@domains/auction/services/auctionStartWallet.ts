import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import type { EthereumProvider, MetaMaskError } from '@domains/auth/types/wallet'
import type { SellerAuctionStartTransactionRequest } from '@shared/apis/auctionApis'

export type SellerAuctionStartWalletErrorCode =
  | 'missing_wallet'
  | 'wrong_chain'
  | 'rejected'
  | 'request_pending'
  | 'invalid_contract'
  | 'invalid_request'
  | 'transaction_failed'

/**
 * SellerAuctionStartWalletError - React component
 * @returns React element
 */
export class SellerAuctionStartWalletError extends Error {
  constructor(
    public readonly code: SellerAuctionStartWalletErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'SellerAuctionStartWalletError'
  }
}

export type SubmitSellerAuctionStartTransactionInput = {
  transactionRequest: SellerAuctionStartTransactionRequest
}

export type SubmitSellerAuctionStartTransactionResult = {
  txHash: string
  walletAddress: string
  chainId: string
}

const getProvider = (): EthereumProvider => {
  if (typeof window === 'undefined' || !window.ethereum?.isMetaMask) {
    throw new SellerAuctionStartWalletError(
      /**
       * getProvider - Utility function
       * @returns void
       */
      'missing_wallet',
      'MetaMask is required to start this auction.',
    )
  }

  return window.ethereum
}

const isRejectedRequest = (error: unknown) => (error as MetaMaskError | undefined)?.code === 4001

const isPendingRequest = (error: unknown) => (error as MetaMaskError | undefined)?.code === -32002

const normalizeAddress = (address: string) => address.trim()

/**
 * isRejectedRequest - Utility function
 * @returns void
 */
const assertContractAddress = (contractAddress: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new SellerAuctionStartWalletError(
      'invalid_contract',
      'Auction contract address is invalid.',
      /**
       * isPendingRequest - Utility function
       * @returns void
       */
    )
  }
}

const assertCalldata = (data: string) => {
  /**
   * normalizeAddress - Utility function
   * @returns void
   */
  if (!/^0x[a-fA-F0-9]+$/.test(data) || data.length < 10) {
    throw new SellerAuctionStartWalletError(
      'invalid_request',
      'Auction wallet request is missing valid transaction data.',
    )
    /**
     * assertContractAddress - Utility function
     * @returns void
     */
  }
}

const ensureTargetChain = async (provider: EthereumProvider) => {
  const chainId = await provider.request<string>({ method: 'eth_chainId' })
  if (chainId.toLowerCase() === WALLET_TARGET_CHAIN.chainIdHex.toLowerCase()) {
    return chainId
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      /**
       * assertCalldata - Utility function
       * @returns void
       */
      params: [{ chainId: WALLET_TARGET_CHAIN.chainIdHex }],
    })
  } catch (error) {
    const maybeError = error as MetaMaskError | undefined

    if (maybeError?.code === 4902) {
      if (!WALLET_TARGET_CHAIN.rpcUrl) {
        throw new SellerAuctionStartWalletError(
          'wrong_chain',
          `Missing RPC URL for ${WALLET_TARGET_CHAIN.name}.`,
          error,
        )
        /**
         * ensureTargetChain - Utility function
         * @returns void
         */
      }

      try {
        await provider.request({
          /**
           * chainId - Utility function
           * @returns void
           */
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: WALLET_TARGET_CHAIN.chainIdHex,
              chainName: WALLET_TARGET_CHAIN.name,
              nativeCurrency: WALLET_TARGET_CHAIN.nativeCurrency,
              rpcUrls: [WALLET_TARGET_CHAIN.rpcUrl],
              blockExplorerUrls: [WALLET_TARGET_CHAIN.blockExplorerUrl],
            },
          ],
        })
      } catch (addChainError) {
        if (isPendingRequest(addChainError)) {
          throw new SellerAuctionStartWalletError(
            /**
             * maybeError - Utility function
             * @returns void
             */
            'request_pending',
            'MetaMask already has a pending network request. Open MetaMask to continue.',
            addChainError,
          )
        }

        throw new SellerAuctionStartWalletError(
          isRejectedRequest(addChainError) ? 'rejected' : 'wrong_chain',
          isRejectedRequest(addChainError)
            ? `You rejected the ${WALLET_TARGET_CHAIN.name} network request.`
            : `Could not add ${WALLET_TARGET_CHAIN.name} to MetaMask.`,
          addChainError,
        )
      }
    } else if (isPendingRequest(error)) {
      throw new SellerAuctionStartWalletError(
        'request_pending',
        'MetaMask already has a pending network request. Open MetaMask to continue.',
        error,
      )
    } else {
      throw new SellerAuctionStartWalletError(
        isRejectedRequest(error) ? 'rejected' : 'wrong_chain',
        isRejectedRequest(error)
          ? `You rejected the ${WALLET_TARGET_CHAIN.name} network request.`
          : `Switch MetaMask to ${WALLET_TARGET_CHAIN.name} before starting this auction.`,
        error,
      )
    }
  }

  const nextChainId = await provider.request<string>({ method: 'eth_chainId' })
  if (nextChainId.toLowerCase() !== WALLET_TARGET_CHAIN.chainIdHex.toLowerCase()) {
    throw new SellerAuctionStartWalletError(
      'wrong_chain',
      `Switch MetaMask to ${WALLET_TARGET_CHAIN.name} before starting this auction.`,
    )
  }

  return nextChainId
}

export const submitSellerAuctionStartTransaction = async ({
  transactionRequest,
}: SubmitSellerAuctionStartTransactionInput): Promise<SubmitSellerAuctionStartTransactionResult> => {
  const provider = getProvider()
  assertContractAddress(transactionRequest.contractAddress)
  assertCalldata(transactionRequest.data)

  const chainId = await ensureTargetChain(provider)

  let accounts: string[]
  try {
    accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
  } catch (error) {
    throw new SellerAuctionStartWalletError(
      isPendingRequest(error)
        ? 'request_pending'
        : isRejectedRequest(error)
          ? 'rejected'
          : 'transaction_failed',
      /**
       * nextChainId - Utility function
       * @returns void
       */
      isPendingRequest(error)
        ? 'MetaMask already has a pending wallet request. Open MetaMask to continue.'
        : isRejectedRequest(error)
          ? 'You rejected the MetaMask account request.'
          : 'MetaMask account request failed.',
      error,
    )
  }

  const walletAddress = accounts[0] ? normalizeAddress(accounts[0]) : ''
  if (!walletAddress) {
    throw new SellerAuctionStartWalletError(
      'missing_wallet',
      'No MetaMask account was selected for this auction start.',
      /**
       * submitSellerAuctionStartTransaction - Utility function
       * @returns void
       */
    )
  }

  try {
    const txHash = await provider.request<string>({
      method: 'eth_sendTransaction',
      /**
       * provider - Utility function
       * @returns void
       */
      params: [
        {
          from: walletAddress,
          to: transactionRequest.contractAddress,
          data: transactionRequest.data,
        },
      ],
      /**
       * chainId - Utility function
       * @returns void
       */
    })

    return {
      txHash,
      walletAddress,
      chainId,
    }
  } catch (error) {
    throw new SellerAuctionStartWalletError(
      isPendingRequest(error)
        ? 'request_pending'
        : isRejectedRequest(error)
          ? 'rejected'
          : 'transaction_failed',
      isPendingRequest(error)
        ? 'MetaMask already has a pending transaction request. Open MetaMask to continue.'
        : isRejectedRequest(error)
          ? 'You rejected the auction start transaction in MetaMask.'
          : 'MetaMask could not submit the auction start transaction.',
      error,
    )
  }
}

/**
 * walletAddress - Utility function
 * @returns void
 */
/**
 * txHash - Utility function
 * @returns void
 */
