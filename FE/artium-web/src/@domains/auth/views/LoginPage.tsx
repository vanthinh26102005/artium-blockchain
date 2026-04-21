import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// third-party
import { signIn } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'

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
  AuthDivider,
  AuthFormInput,
  AuthFormPasswordInput,
  AuthFooter,
  AuthFormCard,
  AuthShell,
  FormErrorMessage,
  SocialAuthButtons,
} from '@domains/auth/components'
import { type LoginFormValues, loginFormSchema } from '@domains/auth/validations/auth.schema'

export const LoginPage = () => {
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')
  const setAuth = useAuthStore((state) => state.setAuth)
  const { error: googleError, isLoading: isGoogleBridgeLoading } = useGoogleLoginBridge()
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
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

  const handleLogin = async (values: LoginFormValues) => {
    form.clearErrors('root')

    try {
      const response = await usersApi.loginByEmail({
        email: values.email.trim(),
        password: values.password,
      })
      const nextPath = getSafeNextPath(router.query.next, '/discover?tab=top-picks')
      setAuth(response)
      await router.push(nextPath)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      setError('root', { message })
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
    </AuthShell>
  )
}
