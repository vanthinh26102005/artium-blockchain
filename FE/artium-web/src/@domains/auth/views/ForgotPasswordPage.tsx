// react
import { useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

// @domains - auth
import { AuthShell, FormErrorMessage, OtpCodeInput } from '@domains/auth/components'
import { useForgotPassword } from '@domains/auth/hooks/useForgotPassword'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { writePasswordResetSession } from '@domains/auth/services/browserAuthState'
import { getEmailValidationMessage } from '@domains/auth/utils/authValidation'

export const ForgotPasswordPage = () => {
  // -- routing --
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')

  // -- state --
  const { requestReset, verifyReset, isLoading, error: apiError } = useForgotPassword()
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [notice, setNotice] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)
  const [touchedOtp, setTouchedOtp] = useState(false)
  const [serverError, setServerError] = useState('')

  // -- derived --
  const trimmedEmail = email.trim()
  const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6)
  const emailError = getEmailValidationMessage(trimmedEmail)
  const otpError = !normalizedOtp ? 'Verification code is required.' : !/^\d{6}$/.test(normalizedOtp)
    ? 'OTP must be 6 digits.'
    : ''
  const isEmailValid = !emailError
  const isOtpValid = !otpError
  const isFormValid = step === 'verify' ? isEmailValid && isOtpValid : isEmailValid
  const formErrorMessage = serverError || apiError || ''
  const shouldShowError = formErrorMessage.length > 0
  const isSubmitDisabled = isLoading || !isFormValid
  const showEmailError = (hasSubmitted || touchedEmail) && !isEmailValid
  const showOtpError = step === 'verify' && (hasSubmitted || touchedOtp) && !isOtpValid

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)
    setServerError('')
    setNotice('')

    if (!isFormValid) {
      return
    }

    try {
      if (step === 'request') {
        await requestReset({ email: trimmedEmail })
        setStep('verify')
        setOtp('')
        setNotice('We sent a verification code to your email.')
        setTouchedOtp(false)
        setHasSubmitted(false)
        return
      }

      const response = await verifyReset({ email: trimmedEmail, otp: normalizedOtp })
      if (response?.resetToken) {
        writePasswordResetSession({
          email: trimmedEmail,
          resetToken: response.resetToken,
        })
        const nextUrl = `/reset-password?email=${encodeURIComponent(trimmedEmail)}`
        await router.push(nextUrl)
      } else {
        setServerError('Reset verification failed.')
      }
    } catch {
      // errors are handled by hook state
    }
  }

  // -- render --
  if (!canRenderGuestPage) {
    return null
  }

  return (
    <AuthShell>
      <Metadata title="Forgot password | Artium" />

      {/* card */}
      <div className="shadow-artium-xl flex w-[88vw] max-w-[640px] flex-col gap-6 rounded-[32px] bg-white px-10 py-10 text-black sm:px-12 lg:px-14 lg:py-12">
        {/* main content */}
        <div className="rounded-[16px] border border-black/10 px-7 py-9">
          {/* header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#191414]">Forgot password</h1>
            <p className="text-base text-[#6b6b6b]">
              Enter your account email and we&apos;ll send a 6-digit verification code.
            </p>
          </div>

          {/* form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            {notice ? <p className="text-sm font-semibold text-emerald-600">{notice}</p> : null}
            <div>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setTouchedEmail(true)}
                aria-invalid={showEmailError}
                aria-describedby="forgot-error"
                disabled={step === 'verify'}
                className={cn(
                  'h-auto rounded-none border-b-2 border-black border-transparent px-0 py-2 text-base text-[#191414] placeholder:text-[#898788] focus-visible:ring-0',
                  showEmailError && 'border-[#FF4337] text-[#FF4337] focus-visible:border-[#FF4337]',
                )}
              />
              {showEmailError ? (
                <p className="mt-2 text-xs font-medium text-[#FF4337]">{emailError}</p>
              ) : null}
            </div>

            {step === 'verify' ? (
              <OtpCodeInput
                id="forgot-otp"
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
            ) : null}

            <FormErrorMessage
              id="forgot-error"
              message={formErrorMessage}
              visible={shouldShowError}
            />

            <Button
              className="bg-mint-green hover:bg-mint-green/80 w-full rounded-full border border-black/10 py-3 text-base font-semibold tracking-[0.2em] text-black uppercase"
              loading={isLoading}
              disabled={isSubmitDisabled}
              type="submit"
            >
              {step === 'verify'
                ? isLoading
                  ? 'Verifying...'
                  : 'Verify code'
                : isLoading
                  ? 'Sending...'
                  : 'Send code'}
            </Button>
          </form>
        </div>

        {/* sign up link */}
        <div className="rounded-[16px] border border-black/10 px-8 py-6 text-center">
          <p className="text-base text-[#191414]">
            Not yet on Artium?{' '}
            <Link href="/sign-up" className="text-primary font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* support */}
        <button type="button" className="text-sm text-[#898788]">
          Need help? <span className="font-semibold">Contact Support</span>
        </button>
      </div>
    </AuthShell>
  )
}
