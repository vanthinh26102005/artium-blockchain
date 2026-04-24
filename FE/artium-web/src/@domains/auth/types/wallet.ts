export type EthereumRequestArguments = {
  method: string
  params?: unknown[] | Record<string, unknown>
}

export type EthereumProvider = {
  isMetaMask?: boolean
  request: <T = unknown>(args: EthereumRequestArguments) => Promise<T>
  on: (eventName: string, listener: (...args: unknown[]) => void) => void
  removeListener: (eventName: string, listener: (...args: unknown[]) => void) => void
}

export type MetaMaskError = Error & {
  code?: number
}
