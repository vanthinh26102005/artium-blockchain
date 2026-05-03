// react
import { useState } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

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
  AuthDivider,
  AuthFormInput,
  AuthFormOtpInput,
  AuthFormPasswordInput,
  AuthFooter,
  AuthFormCard,
  AuthInput,
  AuthShell,
  SocialAuthButtons,
} from '@domains/auth/components'
import {
  otpOnlyFormSchema,
  signUpDetailsFormSchema,
  type OtpOnlyFormValues,
  type SignUpDetailsFormValues,
} from '@domains/auth/validations/auth.schema'
import { FormErrorMessage } from '@/@shared/components/ui/form-error-message'

/**
 * SignUpPage - React component
 * @returns React element
 */
export const SignUpPage = () => {
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')
  const { initiate, complete, isLoading, error: registerError } = useRegister()
  /**
   * router - Utility function
   * @returns void
   */
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [pendingDetails, setPendingDetails] = useState<SignUpDetailsFormValues | null>(null)
  const detailsForm = useForm<SignUpDetailsFormValues>({
    resolver: zodResolver(signUpDetailsFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      /**
       * detailsForm - Utility function
       * @returns void
       */
      email: '',
      password: '',
    },
  })
  const otpForm = useForm<OtpOnlyFormValues>({
    resolver: zodResolver(otpOnlyFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      otp: '',
    },
  })

  /**
   * otpForm - Utility function
   * @returns void
   */
  const handleDetailsSubmit = async (values: SignUpDetailsFormValues) => {
    detailsForm.clearErrors('root')

    try {
      await initiate({
        firstName: values.firstName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      setPendingDetails(values)
      setStep('otp')
      otpForm.reset({ otp: '' })
      /**
       * handleDetailsSubmit - Utility function
       * @returns void
       */
    } catch (error) {
      const message =
        error instanceof Error ? error.message : (registerError ?? 'Registration failed.')
      detailsForm.setError('root', { message })
    }
  }

  const handleOtpSubmit = async (values: OtpOnlyFormValues) => {
    otpForm.clearErrors('root')

    if (!pendingDetails) {
      otpForm.setError('root', { message: 'Registration session expired. Please sign up again.' })
      return
    }

    try {
      await complete({ email: pendingDetails.email.trim(), otp: values.otp.trim() })
      /**
       * message - Utility function
       * @returns void
       */
      await router.push('/login?signup=success')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : (registerError ?? 'OTP verification failed.')
      otpForm.setError('root', { message })
    }
  }

  const handleGoogleSignIn = async () => {
    /**
     * handleOtpSubmit - Utility function
     * @returns void
     */
    setIsGoogleSubmitting(true)

    try {
      await signIn('google', {
        callbackUrl: buildAuthCallbackUrl('/sign-up', router.query.next, '/discover?tab=top-picks'),
      })
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  /**
   * message - Utility function
   * @returns void
   */
  // -- render --
  if (!canRenderGuestPage) {
    return null
  }

  return (
    <AuthShell>
      <Metadata title="Sign up | Artium" />
      /** * handleGoogleSignIn - Utility function * @returns void */
      <AuthFormCard>
        {/* header */}
        <h1 className="text-center font-monument-grotes text-3xl font-bold text-[#191414] lg:text-[48px]">
          Sign up
        </h1>

        {/* social auth */}
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          isGoogleLoading={isGoogleSubmitting || isGoogleBridgeLoading}
        />

        {googleError ? <FormErrorMessage id="signup-google-error" message={googleError} /> : null}

        <AuthDivider text="Or sign up with" />

        {step === 'details' ? (
          <FormProvider {...detailsForm}>
            <form
              className="mt-3 space-y-4"
              onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)}
              noValidate
            >
              <AuthFormInput<SignUpDetailsFormValues>
                id="signup-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                label="First name"
                required
                aria-invalid={Boolean(detailsForm.formState.errors.firstName)}
                aria-describedby="signup-error"
              />

              <AuthFormInput<SignUpDetailsFormValues>
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                label="Email address"
                required
                aria-invalid={Boolean(detailsForm.formState.errors.email)}
                aria-describedby="signup-error"
              />

              <AuthFormPasswordInput<SignUpDetailsFormValues>
                id="signup-password"
                name="password"
                autoComplete="new-password"
                placeholder="Password"
                label="Password"
                required
                aria-invalid={Boolean(detailsForm.formState.errors.password)}
                aria-describedby="signup-error"
              />

              {!detailsForm.formState.errors.password ? (
                <p className="text-xs text-[#6b6b6b]">
                  Use at least 8 characters with uppercase, lowercase, and a number.
                </p>
              ) : null}

              <FormErrorMessage
                id="signup-error"
                message={detailsForm.formState.errors.root?.message ?? ''}
                visible={Boolean(detailsForm.formState.errors.root?.message)}
              />

              <Button
                className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold uppercase tracking-[0.3em]"
                loading={detailsForm.formState.isSubmitting || isLoading}
                disabled={detailsForm.formState.isSubmitting || isLoading}
                type="submit"
              >
                {detailsForm.formState.isSubmitting || isLoading ? 'Signing up...' : 'Sign up'}
              </Button>
            </form>
          </FormProvider>
        ) : (
          <FormProvider {...otpForm}>
            <form
              className="mt-3 space-y-4"
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
              noValidate
            >
              <AuthInput
                id="signup-email-readonly"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                label="Email address"
                required
                value={pendingDetails?.email.trim() ?? ''}
                disabled
              />
              <AuthFormOtpInput<OtpOnlyFormValues>
                id="signup-otp"
                name="otp"
                label="Verification code"
                description="Enter the 6-digit code we sent to your email."
                disabled={otpForm.formState.isSubmitting || isLoading}
              />

              <FormErrorMessage
                id="signup-error"
                message={otpForm.formState.errors.root?.message ?? ''}
                visible={Boolean(otpForm.formState.errors.root?.message)}
              />

              <Button
                className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold uppercase tracking-[0.3em]"
                loading={otpForm.formState.isSubmitting || isLoading}
                disabled={otpForm.formState.isSubmitting || isLoading}
                type="submit"
              >
                {otpForm.formState.isSubmitting || isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          </FormProvider>
        )}

        {/* footer links */}
        <div className="space-y-3 text-center">
          <p className="text-base text-[#191414]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-[#898788]">
            By signing up, you agree to our{' '}
            <span className="font-semibold text-primary">Terms &amp; Conditions</span>
          </p>
        </div>

        <AuthFooter />
      </AuthFormCard>
    </AuthShell>
  )
}
