import { z } from 'zod'

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export const authEmailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.')

export const loginPasswordSchema = z.string().min(1, 'Password is required.')

export const signUpFirstNameSchema = z.string().trim().min(1, 'First name is required.')

export const signUpPasswordSchema = z
  .string()
  .min(1, 'Password is required.')
  .regex(STRONG_PASSWORD_REGEX, 'Use 8+ characters with uppercase, lowercase, and a number.')

export const otpCodeSchema = z
  .string()
  .trim()
  .min(1, 'Verification code is required.')
  .regex(/^\d{6}$/, 'OTP must be 6 digits.')

export const loginFormSchema = z.object({
  email: authEmailSchema,
  password: loginPasswordSchema,
})

export const signUpDetailsFormSchema = z.object({
  firstName: signUpFirstNameSchema,
  email: authEmailSchema,
  password: signUpPasswordSchema,
})

export const otpOnlyFormSchema = z.object({
  otp: otpCodeSchema,
})

export const forgotPasswordRequestFormSchema = z.object({
  email: authEmailSchema,
})

export const forgotPasswordVerifyFormSchema = z.object({
  email: authEmailSchema,
  otp: otpCodeSchema,
})

export const resetPasswordVerifyFormSchema = z.object({
  email: authEmailSchema,
  otp: otpCodeSchema,
})

export const resetPasswordConfirmFormSchema = z
  .object({
    email: authEmailSchema,
    resetToken: z.string().min(1, 'Reset session expired. Please request a new code.'),
    newPassword: signUpPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.confirmPassword === values.newPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type SignUpDetailsFormValues = z.infer<typeof signUpDetailsFormSchema>
export type OtpOnlyFormValues = z.infer<typeof otpOnlyFormSchema>
export type ForgotPasswordRequestFormValues = z.infer<typeof forgotPasswordRequestFormSchema>
export type ForgotPasswordVerifyFormValues = z.infer<typeof forgotPasswordVerifyFormSchema>
export type ResetPasswordVerifyFormValues = z.infer<typeof resetPasswordVerifyFormSchema>
export type ResetPasswordConfirmFormValues = z.infer<typeof resetPasswordConfirmFormSchema>
