export interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  platformPrivateKey: string;
}

export const BLOCKCHAIN_CONFIG = Symbol('BLOCKCHAIN_CONFIG');
export const ESCROW_CONTRACT = Symbol('ESCROW_CONTRACT');
export const BLOCKCHAIN_PROVIDER = Symbol('BLOCKCHAIN_PROVIDER');
export const PLATFORM_SIGNER = Symbol('PLATFORM_SIGNER');
