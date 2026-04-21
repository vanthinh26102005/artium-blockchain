// react
import { useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - auth
import { useGoogleLoginBridge } from '@domains/auth/hooks/useGoogleLoginBridge'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { useRegister } from '@domains/auth/hooks/useRegister'
import { buildAuthCallbackUrl } from '@domains/auth/utils/authRedirect'
import {
  getEmailValidationMessage,
  getSignUpFirstNameValidationMessage,
  getSignUpPasswordValidationMessage,
} from '@domains/auth/utils/authValidation'
import {
  AuthDivider,
  AuthFooter,
  AuthFormCard,
  AuthInput,
  AuthShell,
  FormErrorMessage,
  OtpCodeInput,
  PasswordInput,
  SocialAuthButtons,
} from '@domains/auth/components'

export const SignUpPage = () => {
  // -- routing --
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')

  // -- state --
  const { initiate, complete, isLoading, error: registerError } = useRegister()
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [touchedFirstName, setTouchedFirstName] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)
  const [touchedPassword, setTouchedPassword] = useState(false)
  const [touchedOtp, setTouchedOtp] = useState(false)

  // -- derived --
  const trimmedEmail = email.trim()
  const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6)
  const firstNameError = getSignUpFirstNameValidationMessage(firstName)
  const emailError = getEmailValidationMessage(trimmedEmail)
  const passwordError = getSignUpPasswordValidationMessage(password)
  const isFirstNameValid = !firstNameError
  const isEmailValid = !emailError
  const isPasswordValid = !passwordError
  const isOtpValid = /^\d{6}$/.test(otp.trim())
  const isFormValid =
    step === 'details' ? isFirstNameValid && isEmailValid && isPasswordValid : isOtpValid
  const otpErrorMessage = !normalizedOtp
    ? 'Verification code is required.'
    : !isOtpValid
      ? 'OTP must be 6 digits.'
      : ''
  const formErrorMessage = registerError ?? ''
  const showFirstNameError = (hasSubmitted || touchedFirstName) && !isFirstNameValid
  const showEmailError = (hasSubmitted || touchedEmail) && !isEmailValid
  const showPasswordError = (hasSubmitted || touchedPassword) && !isPasswordValid
  const showOtpError = step === 'otp' && (hasSubmitted || touchedOtp) && !isOtpValid
  const isSubmitDisabled = isSubmitting || isLoading || !isFormValid
  const shouldShowError = formErrorMessage.length > 0

  // -- handlers --
  const handleFirstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value)
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)

    if (!isFormValid) {
      return
    }

    setIsSubmitting(true)

    try {
      if (step === 'details') {
        await initiate({ firstName: firstName.trim(), email: trimmedEmail, password })
        setStep('otp')
        setOtp('')
        setTouchedOtp(false)
        setHasSubmitted(false)
        return
      }

      await complete({ email: trimmedEmail, otp: normalizedOtp })
      await router.push('/login?signup=success')
    } catch {
      // errors are handled by hook state
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true)

    try {
      await signIn('google', {
        callbackUrl: buildAuthCallbackUrl(
          '/sign-up',
          router.query.next,
          '/discover?tab=top-picks',
        ),
      })
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  // -- render --
  if (!canRenderGuestPage) {
    return null
  }

  return (
    <AuthShell>
      <Metadata title="Sign up | Artium" />
      <AuthFormCard>
        {/* header */}
        <h1 className="font-monument-grotes text-center text-3xl font-bold text-[#191414] lg:text-[48px]">
          Sign up
        </h1>

        {/* social auth */}
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          isGoogleLoading={isGoogleSubmitting || isGoogleBridgeLoading}
        />

        {googleError ? <FormErrorMessage id="signup-google-error" message={googleError} /> : null}

        <AuthDivider text="Or sign up with" />

        {/* form */}
        <form className="mt-3 space-y-4" onSubmit={handleSubmit} noValidate>
          {step === 'details' ? (
            <>
              <AuthInput
                id="signup-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                label="First name"
                required
                value={firstName}
                onChange={handleFirstNameChange}
                onBlur={() => setTouchedFirstName(true)}
                aria-invalid={showFirstNameError}
                aria-describedby="signup-error"
                hasError={showFirstNameError}
                errorMessage={showFirstNameError ? firstNameError : undefined}
              />

              <AuthInput
                id="signup-email"
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
                aria-describedby="signup-error"
                hasError={showEmailError}
                errorMessage={showEmailError ? emailError : undefined}
              />

              <PasswordInput
                id="signup-password"
                name="password"
                autoComplete="new-password"
                placeholder="Password"
                label="Password"
                required
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setTouchedPassword(true)}
                aria-invalid={showPasswordError}
                aria-describedby="signup-error"
                hasError={showPasswordError}
                errorMessage={showPasswordError ? passwordError : undefined}
              />

              {!showPasswordError ? (
                <p className="text-xs text-[#6b6b6b]">
                Use at least 8 characters with uppercase, lowercase, and a number.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <AuthInput
                id="signup-email-readonly"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                label="Email address"
                required
                value={trimmedEmail}
                disabled
              />
              <OtpCodeInput
                id="signup-otp"
                label="Verification code"
                value={normalizedOtp}
                onChange={(value) => {
                  setTouchedOtp(true)
                  setOtp(value)
                }}
                hasError={showOtpError}
                errorMessage={showOtpError ? otpErrorMessage : undefined}
                description="Enter the 6-digit code we sent to your email."
                disabled={isSubmitting || isLoading}
              />
            </>
          )}

          <FormErrorMessage
            id="signup-error"
            message={formErrorMessage}
            visible={shouldShowError}
          />

          <Button
            className="h-[56px] w-full rounded-[40px] border border-black/10 text-base font-semibold tracking-[0.3em] uppercase"
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            type="submit"
          >
            {step === 'details'
              ? isSubmitting
                ? 'Signing up...'
                : 'Sign up'
              : isSubmitting
                ? 'Verifying...'
                : 'Verify OTP'}
          </Button>
        </form>

        {/* footer links */}
        <div className="space-y-3 text-center">
          <p className="text-base text-[#191414]">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-[#898788]">
            By signing up, you agree to our{' '}
            <span className="text-primary font-semibold">Terms &amp; Conditions</span>
          </p>
        </div>

        <AuthFooter />
      </AuthFormCard>
    </AuthShell>
  )
}
