// @domains - auth
import { WALLET_SIWE_STATEMENT } from '@domains/auth/constants/wallet'

type BuildSiweMessageInput = {
  address: string
  chainId: number
  nonce: string
}

const getSiweOrigin = () => {
  if (typeof window === 'undefined') {
    return {
      domain: 'localhost:3000',
      uri: 'http://localhost:3000',
    }
  }

  return {
    domain: window.location.host,
    uri: window.location.origin,
  }
}

export const buildSiweMessage = ({ address, chainId, nonce }: BuildSiweMessageInput) => {
  const { domain, uri } = getSiweOrigin()
  const issuedAt = new Date()
  const expirationTime = new Date(issuedAt.getTime() + 5 * 60 * 1000)

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    WALLET_SIWE_STATEMENT,
    '',
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    `Expiration Time: ${expirationTime.toISOString()}`,
  ].join('\n')
}
