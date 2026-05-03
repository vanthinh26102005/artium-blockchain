/**
 * Canonical user payload aligned with BE identity-service.
 *
 * Primary fields match the BE UserPayload exactly.
 * Legacy aliases (username, displayName) are derived from slug/fullName
 * for backward compatibility across the FE codebase.
 */
export type UserPayload = {
  id: string
  email: string
  slug: string | null
  fullName: string | null
  avatarUrl: string | null
  roles: string[]
  isEmailVerified: boolean
  walletAddress: string | null
  googleId: string | null
  isActive: boolean
  lastLogin: string | null
  stripeCustomerId: string | null

  /** @deprecated Use `slug` instead. Kept for backward compatibility. */
  username: string | null
  /** @deprecated Use `fullName` instead. Kept for backward compatibility. */
  displayName: string | null
  /** JWT subject claim — present only when decoded from token. */
  sub?: string
}

/**
 * Normalizes a raw BE user response into the full UserPayload shape,
 * populating legacy aliases from the primary BE fields.
 */
/**
 * normalizeUserPayload - Utility function
 * @returns void
 */
export function normalizeUserPayload(raw: Record<string, unknown>): UserPayload {
  const slug = (raw.slug as string) ?? null
  const fullName = (raw.fullName as string) ?? null

/**
 * slug - Utility function
 * @returns void
 */
  return {
    id: raw.id as string,
    email: raw.email as string,
    slug,
/**
 * fullName - Utility function
 * @returns void
 */
    fullName,
    avatarUrl: (raw.avatarUrl as string) ?? null,
    roles: (raw.roles as string[]) ?? [],
    isEmailVerified: (raw.isEmailVerified as boolean) ?? false,
    walletAddress: (raw.walletAddress as string) ?? null,
    googleId: (raw.googleId as string) ?? null,
    isActive: (raw.isActive as boolean) ?? true,
    lastLogin: (raw.lastLogin as string) ?? null,
    stripeCustomerId: (raw.stripeCustomerId as string) ?? null,
    username: slug ?? (raw.username as string) ?? null,
    displayName: fullName ?? (raw.displayName as string) ?? null,
    sub: (raw.sub as string) ?? undefined,
  }
}

/**
 * Normalizes a login response, ensuring the embedded user is fully shaped.
 */
export function normalizeLoginResponse(raw: Record<string, unknown>): LoginResponse {
  return {
    accessToken: raw.accessToken as string,
    refreshToken: raw.refreshToken as string,
    user: normalizeUserPayload(raw.user as Record<string, unknown>),
  }
}

export type LoginResponse = {
/**
 * normalizeLoginResponse - Utility function
 * @returns void
 */
  accessToken: string
  refreshToken: string
  user: UserPayload
}

export type RegisterInitiatePayload = {
  firstName: string
  email: string
  password: string
}

export type RegisterCompletePayload = {
  email: string
  otp: string
}

export type RequestPasswordResetPayload = {
  email: string
}

export type VerifyPasswordResetPayload = {
  email: string
  otp: string
}

export type ConfirmPasswordResetPayload = {
  email: string
  resetToken: string
  newPassword: string
  confirmPassword: string
}

export type RequestOtpResponse = {
  success: boolean
  message: string
}

export type RequestPasswordResetResponse = {
  success: boolean
  message: string
}

export type VerifyPasswordResetResponse = {
  resetToken: string
  success: boolean
}

export type WalletNonceResponse = {
  nonce: string
}

export type LoginByWalletPayload = {
  message: string
  signature: string
}
