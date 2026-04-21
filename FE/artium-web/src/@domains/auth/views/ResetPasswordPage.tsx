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
  OtpCodeInput,
  PasswordInput,
} from '@domains/auth/components'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { useResetPassword } from '@domains/auth/hooks/useResetPassword'
import {
  clearPasswordResetSession,
  readPasswordResetSession,
  writePasswordResetSession,
} from '@domains/auth/services/browserAuthState'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import {
  getEmailValidationMessage,
  getSignUpPasswordValidationMessage,
} from '@domains/auth/utils/authValidation'

export const ResetPasswordPage = () => {
  // -- routing --
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')

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
  const [touchedEmail, setTouchedEmail] = useState(false)
  const [touchedOtp, setTouchedOtp] = useState(false)
  const [touchedNewPassword, setTouchedNewPassword] = useState(false)
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  // -- derived --
  const trimmedEmail = email.trim()
  const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6)
  const emailError = getEmailValidationMessage(trimmedEmail)
  const otpError = !normalizedOtp ? 'Verification code is required.' : !/^\d{6}$/.test(normalizedOtp)
    ? 'OTP must be 6 digits.'
    : ''
  const newPasswordError = getSignUpPasswordValidationMessage(newPassword)
  const confirmPasswordError = !confirmPassword
    ? 'Confirm your new password.'
    : confirmPassword !== newPassword
      ? 'Passwords do not match.'
      : ''
  const isEmailValid = !emailError
  const isOtpValid = !otpError
  const isNewPasswordValid = !newPasswordError
  const isConfirmPasswordValid = !confirmPasswordError
  const isFormValid =
    step === 'verify'
      ? isEmailValid && isOtpValid
      : isEmailValid && resetToken.length > 0 && isNewPasswordValid && isConfirmPasswordValid
  const showEmailError = (hasSubmitted || touchedEmail) && !isEmailValid
  const showOtpError = step === 'verify' && (hasSubmitted || touchedOtp) && !isOtpValid
  const showNewPasswordError =
    step === 'confirm' && (hasSubmitted || touchedNewPassword) && !isNewPasswordValid
  const showConfirmPasswordError =
    step === 'confirm' && (hasSubmitted || touchedConfirmPassword) && !isConfirmPasswordValid
  const formErrorMessage = serverError || apiError || ''
  const shouldShowError = formErrorMessage.length > 0
  const isSubmitDisabled = isLoading || !isFormValid

  // -- handlers --
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleOtpCodeChange = (value: string) => {
    setOtp(value)
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
          otp: normalizedOtp,
        })
        if (response?.resetToken) {
          writePasswordResetSession({
            email: trimmedEmail,
            resetToken: response.resetToken,
          })
          setResetToken(response.resetToken)
          setStep('confirm')
          setHasSubmitted(false)
          setTouchedNewPassword(false)
          setTouchedConfirmPassword(false)
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
      clearPasswordResetSession()
      if (response?.accessToken && response?.refreshToken && response?.user) {
        setAuth(response)
        await router.push('/')
      } else {
        await router.push('/login?reset=success')
      }
    } catch {
      // errors are handled by hook state
    }
  }

  // -- effects --
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    const syncResetState = async () => {
      const emailQuery = typeof router.query.email === 'string' ? router.query.email : ''
      const storedResetSession = readPasswordResetSession()
      const resetTokenQuery =
        typeof router.query.resetToken === 'string'
          ? router.query.resetToken
          : typeof router.query.token === 'string'
            ? router.query.token
            : ''

      if (!email && emailQuery) {
        setEmail(emailQuery)
      } else if (!email && storedResetSession?.email) {
        setEmail(storedResetSession.email)
      }

      if (!resetToken && storedResetSession?.resetToken) {
        setResetToken(storedResetSession.resetToken)
        setStep('confirm')
      } else if (!resetToken && resetTokenQuery) {
        const nextEmail = emailQuery || storedResetSession?.email || ''
        writePasswordResetSession({
          email: nextEmail,
          resetToken: resetTokenQuery,
        })
        setResetToken(resetTokenQuery)
        setStep('confirm')

        await router.replace(
          {
            pathname: router.pathname,
            query: nextEmail ? { email: nextEmail } : undefined,
          },
          undefined,
          { shallow: true },
        )
      }
    }

    void syncResetState()
  }, [router, router.isReady, router.query, email, resetToken])

  // -- render --
  if (!canRenderGuestPage) {
    return null
  }

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
            onBlur={() => setTouchedEmail(true)}
            aria-invalid={showEmailError}
            aria-describedby="reset-error"
            hasError={showEmailError}
            errorMessage={showEmailError ? emailError : undefined}
            disabled={step === 'confirm' && trimmedEmail.length > 0}
          />

          {step === 'verify' ? (
            <OtpCodeInput
              id="reset-otp"
              label="Verification code"
              value={normalizedOtp}
              onChange={(value) => {
                setTouchedOtp(true)
                handleOtpCodeChange(value)
              }}
              hasError={showOtpError}
              errorMessage={showOtpError ? otpError : undefined}
              description="Enter the 6-digit code we sent to your email."
              disabled={isLoading}
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
                onBlur={() => setTouchedNewPassword(true)}
                aria-invalid={showNewPasswordError}
                aria-describedby="reset-error"
                hasError={showNewPasswordError}
                errorMessage={showNewPasswordError ? newPasswordError : undefined}
              />
              {!showNewPasswordError ? (
                <p className="text-xs text-[#6b6b6b]">
                Use at least 8 characters with uppercase, lowercase, and a number.
                </p>
              ) : null}
              <PasswordInput
                id="reset-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm new password"
                label="Confirm new password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => setTouchedConfirmPassword(true)}
                aria-invalid={showConfirmPasswordError}
                aria-describedby="reset-error"
                hasError={showConfirmPasswordError}
                errorMessage={showConfirmPasswordError ? confirmPasswordError : undefined}
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
