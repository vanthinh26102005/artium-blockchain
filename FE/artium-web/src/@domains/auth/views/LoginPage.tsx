// react
import { useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// third-party
import { Wallet } from 'lucide-react'
import { signIn } from 'next-auth/react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'

// @domains - auth
import { useGoogleLoginBridge } from '@domains/auth/hooks/useGoogleLoginBridge'
import { useWalletLogin } from '@domains/auth/hooks/useWalletLogin'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import {
  AuthDivider,
  AuthFooter,
  AuthFormCard,
  AuthInput,
  AuthProviderButton,
  AuthShell,
  FormErrorMessage,
  PasswordInput,
  SocialAuthButtons,
  WalletLoginPanel,
} from '@domains/auth/components'

export const LoginPage = () => {
  // -- routing --
  const router = useRouter()

  // -- state --
  const setAuth = useAuthStore((state) => state.setAuth)
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const walletLogin = useWalletLogin()
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  // -- derived --
  const trimmedEmail = email.trim()
  const isEmailValid = trimmedEmail.length > 0 && trimmedEmail.includes('@')
  const isPasswordValid = password.length >= 6
  const isFormValid = isEmailValid && isPasswordValid
  const hasInput = email.length > 0 || password.length > 0
  const shouldShowValidation = (hasSubmitted || hasInput) && !isFormValid
  const validationMessage = !isEmailValid
    ? 'Email is required and must include @.'
    : !isPasswordValid
      ? 'Password must be at least 6 characters.'
      : ''
  const inlineErrorMessage = shouldShowValidation ? validationMessage : ''
  const formErrorMessage = serverError || inlineErrorMessage
  const showEmailError = (hasSubmitted || email.length > 0) && !isEmailValid
  const showPasswordError = (hasSubmitted || password.length > 0) && !isPasswordValid
  const isSubmitDisabled = isSubmitting || !isFormValid
  const shouldShowError = formErrorMessage.length > 0
  // -- handlers --
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)
    setServerError('')

    if (!isFormValid) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await usersApi.loginByEmail({
        email: trimmedEmail,
        password,
      })
      const nextPath =
        typeof router.query.next === 'string' ? router.query.next : '/discover?tab=top-picks'
      setAuth(response)
      await router.push(nextPath)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true)
    const nextPath = typeof router.query.next === 'string' ? router.query.next : '/'
    const callbackUrl = `/login?next=${encodeURIComponent(nextPath)}`

    try {
      await signIn('google', { callbackUrl })
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const handleWalletSignIn = async () => {
    await walletLogin.loginWithWallet()
  }

  const handleSwitchWalletNetwork = async () => {
    await walletLogin.switchToTargetChain()
  }

  // -- render --
  return (
    <AuthShell>
      <Metadata title="Log in | Artium" />
      <AuthFormCard>
        {/* header */}
        <h1 className="font-monument-grotes text-center text-3xl font-bold text-[#191414] lg:text-[48px]">
          Welcome back
        </h1>

        {/* social auth */}
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          isGoogleLoading={isGoogleSubmitting || isGoogleBridgeLoading}
        />

        {googleError ? <FormErrorMessage id="google-error" message={googleError} /> : null}

        <AuthProviderButton
          icon={<Wallet className="h-6 w-6 shrink-0 text-[#191414]" />}
          label="Login with MetaMask"
          loadingLabel="Opening MetaMask..."
          isLoading={walletLogin.isLoading}
          onClick={() => setIsWalletDialogOpen(true)}
          className="w-full flex-none"
        />

        <AuthDivider text="Or sign in with" />

        {/* form */}
        <form className="mt-3 space-y-4" onSubmit={handleSubmit} noValidate>
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email address"
            label="Email address"
            required
            value={email}
            onChange={handleEmailChange}
            aria-invalid={showEmailError}
            aria-describedby="login-error"
            hasError={showEmailError}
          />

          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter password"
            label="Password"
            required
            value={password}
            onChange={handlePasswordChange}
            aria-invalid={showPasswordError}
            aria-describedby="login-error"
            hasError={showPasswordError}
          />

          <FormErrorMessage id="login-error" message={formErrorMessage} visible={shouldShowError} />

          <Button
            className="h-[56px] w-full rounded-[40px] border border-black/10 text-base font-semibold tracking-[0.3em] uppercase"
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? 'Logging in...' : 'Sign in'}
          </Button>
        </form>

        {/* footer links */}
        <div className="space-y-3 text-center">
          <Link href="/forgot-password" className="text-primary text-base font-semibold">
            Forgot Password?
          </Link>
          <p className="text-base text-[#191414]">
            Not yet on Artium?{' '}
            <Link href="/sign-up" className="text-primary font-semibold">
              Sign up
            </Link>
          </p>
          <button type="button" className="text-sm text-[#898788]">
            Need help? <span className="font-semibold">Contact Support</span>
          </button>
        </div>

        <AuthFooter />
      </AuthFormCard>

      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent
          size="lg"
          closeButtonClassName="top-6 right-6 h-10 w-10 border border-black/10 bg-white text-[#6f6a67] hover:bg-[#f7f5f2] hover:text-[#191414] focus:ring-black/20 sm:top-7 sm:right-7"
          className="max-h-[90vh] max-w-[520px] overflow-y-auto rounded-2xl bg-white p-6 text-black shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-7"
        >
          <DialogHeader className="mb-6 !px-0 pr-14 text-left sm:mb-7">
            <div className="min-w-0">
              <DialogTitle className="text-left text-[22px] leading-[1.15] font-bold text-[#191414] sm:text-2xl">
                Sign in with MetaMask
              </DialogTitle>
              <p className="max-w-[390px] text-left text-sm leading-6 font-medium text-[#6f6a67]">
                Connect your wallet and sign a secure message to access Artium.
              </p>
            </div>
          </DialogHeader>

          <WalletLoginPanel
            buttonLabel={walletLogin.buttonLabel}
            isLoading={walletLogin.isLoading}
            isWrongNetwork={walletLogin.isWrongNetwork}
            onLogin={handleWalletSignIn}
            onSwitchNetwork={handleSwitchWalletNetwork}
            shortenedAddress={walletLogin.shortenedAddress}
            status={walletLogin.status}
            targetChainName={walletLogin.targetChain.name}
          />
        </DialogContent>
      </Dialog>
    </AuthShell>
  )
}
