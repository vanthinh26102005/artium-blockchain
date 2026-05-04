import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// third-party
import { Wallet } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog'

// @domains - auth
import { useGoogleLoginBridge } from '@domains/auth/hooks/useGoogleLoginBridge'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { useWalletLogin } from '@domains/auth/hooks/useWalletLogin'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { buildAuthCallbackUrl, getSafeNextPath } from '@domains/auth/utils/authRedirect'
import {
  AuthDivider,
  AuthFormInput,
  AuthFormPasswordInput,
  AuthFooter,
  AuthFormCard,
  AuthProviderButton,
  AuthShell,
  SocialAuthButtons,
  WalletLoginPanel,
} from '@domains/auth/components'
import { type LoginFormValues, loginFormSchema } from '@domains/auth/validations/auth.schema'
import { FormErrorMessage } from '@/@shared/components/ui/form-error-message'

export const LoginPage = () => {
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')
  const setAuth = useAuthStore((state) => state.setAuth)
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const walletLogin = useWalletLogin()
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const [isUnregisteredWalletDialogOpen, setIsUnregisteredWalletDialogOpen] = useState(false)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    if (walletLogin.status === 'unregistered') {
      setIsWalletDialogOpen(false)
      setIsUnregisteredWalletDialogOpen(true)
    }
  }, [walletLogin.status])

  const handleLogin = async (values: LoginFormValues) => {
    form.clearErrors('root')

    try {
      const response = await usersApi.loginByEmail({
        email: values.email.trim(),
        password: values.password,
      })
      const nextPath = getSafeNextPath(router.query.next, '/discover?tab=top-picks')
      setAuth(response)

      // Prompt to connect wallet if they just signed up
      if (router.query.signup === 'success') {
        const profileHandle = response.user.slug || response.user.username || response.user.id
        await router.push(`/profile/${encodeURIComponent(profileHandle)}/edit?connectWallet=true`)
      } else {
        await router.push(nextPath)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      setError('root', { message })
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true)
    let callbackUrl = buildAuthCallbackUrl(
      '/login',
      router.query.next,
      '/discover?tab=top-picks',
    )
    if (router.query.signup === 'success') {
      callbackUrl = buildAuthCallbackUrl('/login', '/discover?tab=top-picks')
    }

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
  if (!canRenderGuestPage) {
    return null
  }

  return (
    <AuthShell>
      <Metadata title="Log in | Artium" />
      <AuthFormCard>
        {/* header */}
        <h1 className="font-monument-grotes text-center text-3xl font-bold text-[#191414] lg:text-[48px]">
          Welcome back
        </h1>

        {router.query.signup === 'success' ? (
          <div className="mb-4 rounded-xl bg-[#f1faf4] p-3 text-center text-sm font-semibold text-[#1f7a43]">
            Account created! Please log in to continue.
          </div>
        ) : null}

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

        <FormProvider {...form}>
          <form className="mt-3 space-y-4" onSubmit={handleSubmit(handleLogin)} noValidate>
            <AuthFormInput<LoginFormValues>
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              label="Email address"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby="login-error"
            />

            <AuthFormPasswordInput<LoginFormValues>
              id="login-password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              label="Password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby="login-error"
            />

            <FormErrorMessage
              id="login-error"
              message={errors.root?.message ?? ''}
              visible={Boolean(errors.root?.message)}
            />

            <Button
              className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold tracking-[0.3em] uppercase"
              loading={isSubmitting}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Logging in...' : 'Sign in'}
            </Button>
          </form>
        </FormProvider>

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

      <AlertDialog open={isUnregisteredWalletDialogOpen} onOpenChange={setIsUnregisteredWalletDialogOpen}>
        <AlertDialogContent onClose={() => setIsUnregisteredWalletDialogOpen(false)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Wallet Not Linked</AlertDialogTitle>
            <AlertDialogDescription>
              This wallet is not linked to any Artium account. Please login or register using your email or social accounts first. Once logged in, you can connect your wallet in your Profile Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsUnregisteredWalletDialogOpen(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthShell>
  )
}
