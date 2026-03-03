// react
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - auth
import {
  AuthFooter,
  AuthFormCard,
  AuthInput,
  AuthShell,
  FormErrorMessage,
  PasswordInput,
} from '@domains/auth/components'
import { useResetPassword } from '@domains/auth/hooks/useResetPassword'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export const ResetPasswordPage = () => {
  // -- routing --
  const router = useRouter()

  // -- state --
  const { verifyReset, confirmReset, isLoading, error: apiError } = useResetPassword()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [step, setStep] = useState<'verify' | 'confirm'>('verify')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  // -- derived --
  const trimmedEmail = email.trim()
  const isEmailValid = trimmedEmail.length > 0 && trimmedEmail.includes('@')
  const isOtpValid = /^\d{6}$/.test(otp.trim())
  const isNewPasswordValid = newPassword.length >= 8
  const isConfirmPasswordValid = confirmPassword.length >= 8 && confirmPassword === newPassword
  const isFormValid =
    step === 'verify'
      ? isEmailValid && isOtpValid
      : isEmailValid && resetToken.length > 0 && isNewPasswordValid && isConfirmPasswordValid
  const showEmailError = (hasSubmitted || email.length > 0) && !isEmailValid
  const showOtpError = step === 'verify' && (hasSubmitted || otp.length > 0) && !isOtpValid
  const showNewPasswordError =
    step === 'confirm' && (hasSubmitted || newPassword.length > 0) && !isNewPasswordValid
  const showConfirmPasswordError =
    step === 'confirm' && (hasSubmitted || confirmPassword.length > 0) && !isConfirmPasswordValid
  const shouldShowValidation = hasSubmitted && !isFormValid
  const validationMessage =
    step === 'verify'
      ? !isEmailValid
        ? 'Email is required and must include @.'
        : !isOtpValid
          ? 'OTP must be 6 digits.'
          : ''
      : !isEmailValid
        ? 'Email is required and must include @.'
        : !isNewPasswordValid
          ? 'Password must be at least 8 characters.'
          : !isConfirmPasswordValid
            ? 'Passwords do not match.'
            : ''
  const formErrorMessage =
    serverError || apiError || (shouldShowValidation ? validationMessage : '')
  const shouldShowError = formErrorMessage.length > 0
  const isSubmitDisabled = isLoading || !isFormValid

  // -- handlers --
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleOtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleNewPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)
    setServerError('')
    setNotice('')

    if (!isFormValid) {
      return
    }

    try {
      if (step === 'verify') {
        const response = await verifyReset({
          email: trimmedEmail,
          otp: otp.trim(),
        })
        if (response?.resetToken) {
          setResetToken(response.resetToken)
          setStep('confirm')
          setHasSubmitted(false)
          setNotice('Verification successful. Set your new password.')
        } else {
          setServerError('Verification failed.')
        }
        return
      }

      const response = await confirmReset({
        email: trimmedEmail,
        resetToken,
        newPassword,
        confirmPassword,
      })
      if (response?.accessToken && response?.refreshToken && response?.user) {
        setAuth(response)
        await router.push('/')
      } else {
        await router.push('/login?reset=success')
      }
    } catch (error) {
      // errors are handled by hook state
    }
  }

  // -- effects --
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const emailQuery = typeof router.query.email === 'string' ? router.query.email : ''
    const resetTokenQuery =
      typeof router.query.resetToken === 'string'
        ? router.query.resetToken
        : typeof router.query.token === 'string'
          ? router.query.token
          : ''

    if (!email && emailQuery) {
      setEmail(emailQuery)
    }

    if (!resetToken && resetTokenQuery) {
      setResetToken(resetTokenQuery)
      setStep('confirm')
    }
  }, [router.isReady, router.query, email, resetToken])

  // -- render --
  return (
    <AuthShell>
      <Metadata title="Reset password | Artium" />
      <AuthFormCard>
        {/* header */}
        <h1 className="font-monument-grotes text-center text-3xl font-bold text-[#191414] lg:text-[48px]">
          Reset password
        </h1>

        <form className="mt-3 space-y-4" onSubmit={handleSubmit} noValidate>
          {notice ? <p className="text-xs font-semibold text-emerald-600">{notice}</p> : null}

          <AuthInput
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            label="Email address"
            required
            value={email}
            onChange={handleEmailChange}
            aria-invalid={showEmailError}
            aria-describedby="reset-error"
            hasError={showEmailError}
            disabled={step === 'confirm' && trimmedEmail.length > 0}
          />

          {step === 'verify' ? (
            <AuthInput
              id="reset-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              label="Verification code"
              required
              value={otp}
              onChange={handleOtpChange}
              aria-invalid={showOtpError}
              aria-describedby="reset-error"
              hasError={showOtpError}
            />
          ) : (
            <>
              <PasswordInput
                id="reset-new-password"
                name="newPassword"
                autoComplete="new-password"
                placeholder="New password"
                label="New password"
                required
                value={newPassword}
                onChange={handleNewPasswordChange}
                aria-invalid={showNewPasswordError}
                aria-describedby="reset-error"
                hasError={showNewPasswordError}
              />
              <PasswordInput
                id="reset-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm new password"
                label="Confirm new password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                aria-invalid={showConfirmPasswordError}
                aria-describedby="reset-error"
                hasError={showConfirmPasswordError}
              />
            </>
          )}

          <FormErrorMessage id="reset-error" message={formErrorMessage} visible={shouldShowError} />

          <Button
            className="h-[56px] w-full rounded-[40px] border border-black/10 text-base font-semibold tracking-[0.3em] uppercase"
            loading={isLoading}
            disabled={isSubmitDisabled}
            type="submit"
          >
            {step === 'verify'
              ? isLoading
                ? 'Verifying...'
                : 'Verify code'
              : isLoading
                ? 'Resetting...'
                : 'Reset password'}
          </Button>
        </form>

        <div className="space-y-3 text-center">
          <p className="text-sm text-[#191414]">
            Remembered your password?{' '}
            <Link href="/login" className="text-primary font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <AuthFooter />
      </AuthFormCard>
    </AuthShell>
  )
}
