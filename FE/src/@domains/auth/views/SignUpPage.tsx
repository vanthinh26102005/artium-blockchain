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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'

// @domains - auth
import { useGoogleLoginBridge } from '@domains/auth/hooks/useGoogleLoginBridge'
import { useWalletLink } from '@domains/auth/hooks/useWalletLink'
import {
  clearPendingWalletLink,
  readPendingWalletLink,
} from '@domains/auth/services/browserAuthState'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { useRegister } from '@domains/auth/hooks/useRegister'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { buildAuthCallbackUrl, getSafeNextPath } from '@domains/auth/utils/authRedirect'
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
  WalletLoginPanel,
} from '@domains/auth/components'
import {
  otpOnlyFormSchema,
  signUpDetailsFormSchema,
  type OtpOnlyFormValues,
  type SignUpDetailsFormValues,
} from '@domains/auth/validations/auth.schema'
import { FormErrorMessage } from '@/@shared/components/ui/form-error-message'

export const SignUpPage = () => {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { initiate, complete, isLoading, error: registerError } = useRegister()
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const walletLink = useWalletLink()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [isWalletPromptOpen, setIsWalletPromptOpen] = useState(false)
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/', isWalletPromptOpen)
  const [pendingDetails, setPendingDetails] = useState<SignUpDetailsFormValues | null>(null)
  const detailsForm = useForm<SignUpDetailsFormValues>({
    resolver: zodResolver(signUpDetailsFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
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
    } catch (error) {
      const message = error instanceof Error ? error.message : registerError ?? 'Registration failed.'
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
      const response = await complete({ email: pendingDetails.email.trim(), otp: values.otp.trim() })
      setAuth(response)
      setIsWalletPromptOpen(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : registerError ?? 'OTP verification failed.'
      otpForm.setError('root', { message })
    }
  }

  const finishRegistration = async () => {
    clearPendingWalletLink()
    const nextPath = getSafeNextPath(router.query.next, '/discover?tab=top-picks')
    await router.push(nextPath)
  }

  const handleConnectWalletAfterRegistration = async () => {
    const user = await walletLink.linkWallet(readPendingWalletLink())
    if (!user) {
      return
    }

    clearPendingWalletLink()
    setIsWalletPromptOpen(false)
    await finishRegistration()
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
                className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold tracking-[0.3em] uppercase"
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
            <form className="mt-3 space-y-4" onSubmit={otpForm.handleSubmit(handleOtpSubmit)} noValidate>
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
                className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold tracking-[0.3em] uppercase"
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

      <Dialog open={isWalletPromptOpen} onOpenChange={setIsWalletPromptOpen}>
        <DialogContent
          size="lg"
          closeButtonClassName="top-6 right-6 h-10 w-10 border border-black/10 bg-white text-[#6f6a67] hover:bg-[#f7f5f2] hover:text-[#191414] focus:ring-black/20 sm:top-7 sm:right-7"
          className="max-h-[90vh] max-w-[520px] overflow-y-auto rounded-2xl bg-white p-6 text-black shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-7"
        >
          <DialogHeader className="mb-6 !px-0 pr-14 text-left sm:mb-7">
            <DialogTitle className="text-left text-[22px] leading-[1.15] font-bold text-[#191414] sm:text-2xl">
              Connect your wallet?
            </DialogTitle>
            <p className="max-w-[390px] text-left text-sm leading-6 font-medium text-[#6f6a67]">
              Link MetaMask to this account so you can sign in with either email or wallet.
            </p>
          </DialogHeader>

          <WalletLoginPanel
            buttonLabel={walletLink.buttonLabel}
            isLoading={walletLink.isLoading}
            isWrongNetwork={walletLink.isWrongNetwork}
            onLogin={handleConnectWalletAfterRegistration}
            onSwitchNetwork={walletLink.switchToTargetChain}
            shortenedAddress={walletLink.shortenedAddress}
            status={walletLink.status}
            targetChainName={walletLink.targetChain.name}
          />

          <button
            type="button"
            onClick={() => void finishRegistration()}
            className="mt-4 h-11 w-full rounded-lg border border-black/10 text-sm font-bold text-[#191414] transition hover:bg-black/5"
          >
            Do this later
          </button>
        </DialogContent>
      </Dialog>
    </AuthShell>
  )
}
