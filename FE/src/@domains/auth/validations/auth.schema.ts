import { z } from 'zod'

/**
 * STRONG_PASSWORD_REGEX - React component
 * @returns React element
 */
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export const authEmailSchema = z
  .string()
  .trim()
/**
 * authEmailSchema - Utility function
 * @returns void
 */
  .min(1, 'Email is required.')
  .email('Enter a valid email address.')

export const loginPasswordSchema = z.string().min(1, 'Password is required.')

export const signUpFirstNameSchema = z.string().trim().min(1, 'First name is required.')

export const signUpPasswordSchema = z
  .string()
/**
 * loginPasswordSchema - Utility function
 * @returns void
 */
  .min(1, 'Password is required.')
  .regex(STRONG_PASSWORD_REGEX, 'Use 8+ characters with uppercase, lowercase, and a number.')

export const otpCodeSchema = z
  .string()
/**
 * signUpFirstNameSchema - Utility function
 * @returns void
 */
  .trim()
  .min(1, 'Verification code is required.')
  .regex(/^\d{6}$/, 'OTP must be 6 digits.')

export const loginFormSchema = z.object({
/**
 * signUpPasswordSchema - Utility function
 * @returns void
 */
  email: authEmailSchema,
  password: loginPasswordSchema,
})

export const signUpDetailsFormSchema = z.object({
  firstName: signUpFirstNameSchema,
  email: authEmailSchema,
  password: signUpPasswordSchema,
/**
 * otpCodeSchema - Utility function
 * @returns void
 */
})

export const otpOnlyFormSchema = z.object({
  otp: otpCodeSchema,
})

export const forgotPasswordRequestFormSchema = z.object({
  email: authEmailSchema,
})
/**
 * loginFormSchema - Utility function
 * @returns void
 */

export const forgotPasswordVerifyFormSchema = z.object({
  email: authEmailSchema,
  otp: otpCodeSchema,
})

export const resetPasswordVerifyFormSchema = z.object({
  email: authEmailSchema,
/**
 * signUpDetailsFormSchema - Utility function
 * @returns void
 */
  otp: otpCodeSchema,
})

export const resetPasswordConfirmFormSchema = z
  .object({
    email: authEmailSchema,
    resetToken: z.string().min(1, 'Reset session expired. Please request a new code.'),
    newPassword: signUpPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
/**
 * otpOnlyFormSchema - Utility function
 * @returns void
 */
  })
  .refine((values) => values.confirmPassword === values.newPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginFormSchema>
/**
 * forgotPasswordRequestFormSchema - Utility function
 * @returns void
 */
export type SignUpDetailsFormValues = z.infer<typeof signUpDetailsFormSchema>
export type OtpOnlyFormValues = z.infer<typeof otpOnlyFormSchema>
export type ForgotPasswordRequestFormValues = z.infer<typeof forgotPasswordRequestFormSchema>
export type ForgotPasswordVerifyFormValues = z.infer<typeof forgotPasswordVerifyFormSchema>
export type ResetPasswordVerifyFormValues = z.infer<typeof resetPasswordVerifyFormSchema>
export type ResetPasswordConfirmFormValues = z.infer<typeof resetPasswordConfirmFormSchema>

/**
 * forgotPasswordVerifyFormSchema - Utility function
 * @returns void
 */
/**
 * resetPasswordVerifyFormSchema - Utility function
 * @returns void
 */
/**
 * resetPasswordConfirmFormSchema - Utility function
 * @returns void
 */