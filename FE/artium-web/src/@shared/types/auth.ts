export type UserPayload = {
  id: string
  sub?: string
  email: string
  username?: string | null
  displayName?: string | null
  roles: string[]
  avatarUrl?: string | null
}

export type LoginResponse = {
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
