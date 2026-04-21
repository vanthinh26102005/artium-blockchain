// react
import { useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// third-party
import { signIn } from 'next-auth/react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - auth
import { useGoogleLoginBridge } from '@domains/auth/hooks/useGoogleLoginBridge'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { buildAuthCallbackUrl, getSafeNextPath } from '@domains/auth/utils/authRedirect'
import {
  getEmailValidationMessage,
  getLoginPasswordValidationMessage,
} from '@domains/auth/utils/authValidation'
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

export const LoginPage = () => {
  // -- routing --
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')

  // -- state --
  const setAuth = useAuthStore((state) => state.setAuth)
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)
  const [touchedPassword, setTouchedPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  // -- derived --
  const trimmedEmail = email.trim()
  const emailError = getEmailValidationMessage(trimmedEmail)
  const passwordError = getLoginPasswordValidationMessage(password)
  const isEmailValid = !emailError
  const isPasswordValid = !passwordError
  const isFormValid = isEmailValid && isPasswordValid
  const formErrorMessage = serverError
  const showEmailError = (hasSubmitted || touchedEmail) && !isEmailValid
  const showPasswordError = (hasSubmitted || touchedPassword) && !isPasswordValid
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
      const nextPath = getSafeNextPath(router.query.next, '/discover?tab=top-picks')
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
    const callbackUrl = buildAuthCallbackUrl(
      '/login',
      router.query.next,
      '/discover?tab=top-picks',
    )

    try {
      await signIn('google', { callbackUrl })
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
            onBlur={() => setTouchedEmail(true)}
            aria-invalid={showEmailError}
            aria-describedby="login-error"
            hasError={showEmailError}
            errorMessage={showEmailError ? emailError : undefined}
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
            onBlur={() => setTouchedPassword(true)}
            aria-invalid={showPasswordError}
            aria-describedby="login-error"
            hasError={showPasswordError}
            errorMessage={showPasswordError ? passwordError : undefined}
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
    </AuthShell>
  )
}
