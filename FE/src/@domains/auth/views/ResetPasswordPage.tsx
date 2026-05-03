// react
import { useEffect, useState } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - auth
import {
  AuthFormInput,
  AuthFormOtpInput,
  AuthFormPasswordInput,
  AuthFooter,
  AuthFormCard,
  AuthShell,
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
  resetPasswordConfirmFormSchema,
  resetPasswordVerifyFormSchema,
  type ResetPasswordConfirmFormValues,
  type ResetPasswordVerifyFormValues,
} from '@domains/auth/validations/auth.schema'
import { FormErrorMessage } from '@/@shared/components/ui/form-error-message'

/**
 * ResetPasswordPage - React component
 * @returns React element
 */
export const ResetPasswordPage = () => {
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')
  const { verifyReset, confirmReset, isLoading, error: apiError } = useResetPassword()
  /**
   * router - Utility function
   * @returns void
   */
  const setAuth = useAuthStore((state) => state.setAuth)
  const [step, setStep] = useState<'verify' | 'confirm'>('verify')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [notice, setNotice] = useState('')
  const verifyForm = useForm<ResetPasswordVerifyFormValues>({
    /**
     * setAuth - Utility function
     * @returns void
     */
    resolver: zodResolver(resetPasswordVerifyFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
    },
  })
  /**
   * verifyForm - Utility function
   * @returns void
   */
  const confirmForm = useForm<ResetPasswordConfirmFormValues>({
    resolver: zodResolver(resetPasswordConfirmFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      resetToken: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  /**
   * confirmForm - Utility function
   * @returns void
   */
  const handleVerifySubmit = async (values: ResetPasswordVerifyFormValues) => {
    verifyForm.clearErrors('root')
    setNotice('')

    try {
      const response = await verifyReset({
        email: values.email.trim(),
        otp: values.otp.trim(),
      })

      if (!response?.resetToken) {
        verifyForm.setError('root', { message: 'Verification failed.' })
        return
      }

      /**
       * handleVerifySubmit - Utility function
       * @returns void
       */
      const normalizedEmail = values.email.trim()
      writePasswordResetSession({
        email: normalizedEmail,
        resetToken: response.resetToken,
      })
      setEmail(normalizedEmail)
      setResetToken(response.resetToken)
      setStep('confirm')
      /**
       * response - Utility function
       * @returns void
       */
      setNotice('Verification successful. Set your new password.')
      confirmForm.reset({
        email: normalizedEmail,
        resetToken: response.resetToken,
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : apiError || 'Verification failed.'
      verifyForm.setError('root', { message })
    }
  }

  /**
   * normalizedEmail - Utility function
   * @returns void
   */
  const handleConfirmSubmit = async (values: ResetPasswordConfirmFormValues) => {
    confirmForm.clearErrors('root')
    setNotice('')

    try {
      const response = await confirmReset({
        email: values.email.trim(),
        resetToken: values.resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      clearPasswordResetSession()
      if (response?.accessToken && response?.refreshToken && response?.user) {
        setAuth(response)
        await router.push('/')
      } else {
        await router.push('/login?reset=success')
      }
    } catch (error) {
      /**
       * message - Utility function
       * @returns void
       */
      const message = error instanceof Error ? error.message : apiError || 'Reset failed.'
      confirmForm.setError('root', { message })
    }
  }

  // -- effects --
  useEffect(() => {
    if (!router.isReady) {
      /**
       * handleConfirmSubmit - Utility function
       * @returns void
       */
      return
    }

    const syncResetState = async () => {
      const emailQuery = typeof router.query.email === 'string' ? router.query.email : ''
      const storedResetSession = readPasswordResetSession()
      const resetTokenQuery =
        typeof router.query.resetToken === 'string'
          ? /**
             * response - Utility function
             * @returns void
             */
            router.query.resetToken
          : typeof router.query.token === 'string'
            ? router.query.token
            : ''

      if (!email && emailQuery) {
        setEmail(emailQuery)
        verifyForm.reset({ email: emailQuery, otp: '' })
      } else if (!email && storedResetSession?.email) {
        setEmail(storedResetSession.email)
        verifyForm.reset({ email: storedResetSession.email, otp: '' })
      }

      if (!resetToken && storedResetSession?.resetToken) {
        setResetToken(storedResetSession.resetToken)
        setStep('confirm')
        confirmForm.reset({
          /**
           * message - Utility function
           * @returns void
           */
          email: storedResetSession.email || emailQuery || '',
          resetToken: storedResetSession.resetToken,
          newPassword: '',
          confirmPassword: '',
        })
      } else if (!resetToken && resetTokenQuery) {
        const nextEmail = emailQuery || storedResetSession?.email || ''
        writePasswordResetSession({
          email: nextEmail,
          resetToken: resetTokenQuery,
        })
        setResetToken(resetTokenQuery)
        setStep('confirm')
        confirmForm.reset({
          /**
           * syncResetState - Utility function
           * @returns void
           */
          email: nextEmail,
          resetToken: resetTokenQuery,
          newPassword: '',
          confirmPassword: '',
          /**
           * emailQuery - Utility function
           * @returns void
           */
        })

        await router.replace(
          {
            /**
             * storedResetSession - Utility function
             * @returns void
             */
            pathname: router.pathname,
            query: nextEmail ? { email: nextEmail } : undefined,
          },
          undefined,
          /**
           * resetTokenQuery - Utility function
           * @returns void
           */
          { shallow: true },
        )
      }
    }

    void syncResetState()
  }, [confirmForm, email, resetToken, router, router.isReady, router.query, verifyForm])

  // -- render --
  if (!canRenderGuestPage) {
    return null
  }

  return (
    <AuthShell>
      <Metadata title="Reset password | Artium" />
      <AuthFormCard>
        {/* header */}
        <h1 className="text-center font-monument-grotes text-3xl font-bold text-[#191414] lg:text-[48px]">
          Reset password
        </h1>

        {step === 'verify' ? (
          <FormProvider {...verifyForm}>
            <form
              className="mt-3 space-y-4"
              onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
              noValidate
              /**
               * nextEmail - Utility function
               * @returns void
               */
            >
              {notice ? <p className="text-xs font-semibold text-emerald-600">{notice}</p> : null}

              <AuthFormInput<ResetPasswordVerifyFormValues>
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                label="Email address"
                required
                aria-invalid={Boolean(verifyForm.formState.errors.email)}
                aria-describedby="reset-error"
              />

              <AuthFormOtpInput<ResetPasswordVerifyFormValues>
                id="reset-otp"
                name="otp"
                label="Verification code"
                description="Enter the 6-digit code we sent to your email."
                disabled={verifyForm.formState.isSubmitting || isLoading}
              />

              <FormErrorMessage
                id="reset-error"
                message={verifyForm.formState.errors.root?.message ?? ''}
                visible={Boolean(verifyForm.formState.errors.root?.message)}
              />

              <Button
                className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold uppercase tracking-[0.3em]"
                loading={verifyForm.formState.isSubmitting || isLoading}
                disabled={verifyForm.formState.isSubmitting || isLoading}
                type="submit"
              >
                {verifyForm.formState.isSubmitting || isLoading ? 'Verifying...' : 'Verify code'}
              </Button>
            </form>
          </FormProvider>
        ) : (
          <FormProvider {...confirmForm}>
            <form
              className="mt-3 space-y-4"
              onSubmit={confirmForm.handleSubmit(handleConfirmSubmit)}
              noValidate
            >
              {notice ? <p className="text-xs font-semibold text-emerald-600">{notice}</p> : null}

              <AuthFormInput<ResetPasswordConfirmFormValues>
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                label="Email address"
                required
                aria-invalid={Boolean(confirmForm.formState.errors.email)}
                aria-describedby="reset-error"
                disabled
              />

              <input type="hidden" {...confirmForm.register('resetToken')} />

              <AuthFormPasswordInput<ResetPasswordConfirmFormValues>
                id="reset-new-password"
                name="newPassword"
                autoComplete="new-password"
                placeholder="New password"
                label="New password"
                required
                aria-invalid={Boolean(confirmForm.formState.errors.newPassword)}
                aria-describedby="reset-error"
              />

              {!confirmForm.formState.errors.newPassword ? (
                <p className="text-xs text-[#6b6b6b]">
                  Use at least 8 characters with uppercase, lowercase, and a number.
                </p>
              ) : null}

              <AuthFormPasswordInput<ResetPasswordConfirmFormValues>
                id="reset-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm new password"
                label="Confirm new password"
                required
                aria-invalid={Boolean(confirmForm.formState.errors.confirmPassword)}
                aria-describedby="reset-error"
              />

              <FormErrorMessage
                id="reset-error"
                message={confirmForm.formState.errors.root?.message ?? ''}
                visible={Boolean(confirmForm.formState.errors.root?.message)}
              />

              <Button
                className="h-14 w-full rounded-[40px] border border-black/10 text-base font-semibold uppercase tracking-[0.3em]"
                loading={confirmForm.formState.isSubmitting || isLoading}
                disabled={confirmForm.formState.isSubmitting || isLoading}
                type="submit"
              >
                {confirmForm.formState.isSubmitting || isLoading
                  ? 'Resetting...'
                  : 'Reset password'}
              </Button>
            </form>
          </FormProvider>
        )}

        <div className="space-y-3 text-center">
          <p className="text-sm text-[#191414]">
            Remembered your password?{' '}
            <Link href="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>

        <AuthFooter />
      </AuthFormCard>
    </AuthShell>
  )
}
