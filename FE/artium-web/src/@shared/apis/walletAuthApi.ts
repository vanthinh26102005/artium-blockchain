import { apiFetch } from '@shared/services/apiClient'
import type {
  WalletAuthResponse,
  WalletLoginInput,
  WalletNonceResponse,
} from '@shared/types/walletAuth'

const walletAuthApi = {
  getWalletNonce: (address: string) =>
    apiFetch<WalletNonceResponse>(
      `/identity/auth/wallet/nonce?address=${encodeURIComponent(address)}`,
      {
        auth: false,
        cache: 'no-store',
      },
    ),
  loginWithWallet: (input: WalletLoginInput) =>
    apiFetch<WalletAuthResponse>('/identity/auth/wallet', {
      auth: false,
      method: 'POST',
      body: JSON.stringify(input),
    }),
}

export default walletAuthApi
