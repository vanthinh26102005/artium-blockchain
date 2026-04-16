import type { LoginResponse } from './auth'

export type WalletNonceResponse = {
  nonce: string
}

export type WalletLoginInput = {
  message: string
  signature: string
}

export type WalletAuthResponse = LoginResponse

export type EthereumRequestArguments = {
  method: string
  params?: unknown[] | object
}

export type EthereumProvider = {
  isMetaMask?: boolean
  providers?: EthereumProvider[]
  request: <T = unknown>(args: EthereumRequestArguments) => Promise<T>
}
