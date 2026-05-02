import type { EthereumProvider } from '@domains/auth/types/wallet'

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export {}
