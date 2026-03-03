// react
import { useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - auth
import { useRegister } from '@domains/auth/hooks/useRegister'
import {
  AuthDivider,
  AuthFooter,
  AuthFormCard,
  AuthInput,
  AuthShell,
  FormErrorMessage,
  PasswordInput,
  SocialAuthButtons,
} from '@domains/auth/components'

export const SignUpPage = () => {
  // -- routing --
  const router = useRouter()

  // -- state --
  const { initiate, complete, isLoading, error: registerError } = useRegister()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // -- derived --
  const trimmedEmail = email.trim()
  const isFirstNameValid = firstName.trim().length > 0
  const isEmailValid = trimmedEmail.length > 0 && trimmedEmail.includes('@')
  const isPasswordValid = password.length >= 8
  const isOtpValid = /^\d{6}$/.test(otp.trim())
  const isFormValid =
    step === 'details' ? isFirstNameValid && isEmailValid && isPasswordValid : isOtpValid
  const hasInput = firstName.length > 0 || email.length > 0 || password.length > 0
  const shouldShowValidation = (hasSubmitted || hasInput) && !isFormValid
  const validationMessage = !isFirstNameValid
    ? 'First name is required.'
    : !isEmailValid
      ? 'Email is required and must include @.'
      : !isPasswordValid
        ? 'Password must be at least 8 characters.'
        : ''
  const inlineErrorMessage = shouldShowValidation ? validationMessage : ''
  const otpErrorMessage = hasSubmitted && !isOtpValid ? 'OTP must be 6 digits.' : ''
  const formErrorMessage =
    registerError ?? (step === 'details' ? inlineErrorMessage : otpErrorMessage)
  const showFirstNameError = (hasSubmitted || firstName.length > 0) && !isFirstNameValid
  const showEmailError = (hasSubmitted || email.length > 0) && !isEmailValid
  const showPasswordError = (hasSubmitted || password.length > 0) && !isPasswordValid
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

  const handleOtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value)
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
        await initiate({ firstName, email: trimmedEmail, password })
        setStep('otp')
        setHasSubmitted(false)
        return
      }

      await complete({ email: trimmedEmail, otp: otp.trim() })
      await router.push('/login?signup=success')
    } catch (error) {
      // errors are handled by hook state
    } finally {
      setIsSubmitting(false)
    }
  }

  // -- render --
  return (
    <AuthShell>
      <Metadata title="Sign up | Artium" />
      <AuthFormCard>
        {/* header */}
        <h1 className="font-monument-grotes text-center text-3xl font-bold text-[#191414] lg:text-[48px]">
          Sign up
        </h1>

        {/* social auth */}
        <SocialAuthButtons />

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
                aria-invalid={showFirstNameError}
                aria-describedby="signup-error"
                hasError={showFirstNameError}
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
                aria-invalid={showEmailError}
                aria-describedby="signup-error"
                hasError={showEmailError}
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
                aria-invalid={showPasswordError}
                aria-describedby="signup-error"
                hasError={showPasswordError}
              />
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
              <AuthInput
                id="signup-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                label="Verification code"
                required
                value={otp}
                onChange={handleOtpChange}
                aria-invalid={Boolean(otpErrorMessage)}
                aria-describedby="signup-error"
                hasError={Boolean(otpErrorMessage)}
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
