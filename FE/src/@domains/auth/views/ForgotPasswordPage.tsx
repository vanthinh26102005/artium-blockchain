// react
import { useState } from 'react'

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
  AuthInput,
  AuthShell,
  TurnstileChallenge,
} from '@domains/auth/components'
import { useForgotPassword } from '@domains/auth/hooks/useForgotPassword'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { writePasswordResetSession } from '@domains/auth/services/browserAuthState'
import {
  getPracticalAuthErrorMessage,
  isCaptchaRequiredError,
} from '@domains/auth/utils/authErrors'
import {
  forgotPasswordRequestFormSchema,
  forgotPasswordVerifyFormSchema,
  type ForgotPasswordRequestFormValues,
  type ForgotPasswordVerifyFormValues,
} from '@domains/auth/validations/auth.schema'
import { FormErrorMessage } from '@/@shared/components/ui/form-error-message'

export const ForgotPasswordPage = () => {
  const router = useRouter()
  const { canRenderGuestPage } = useRedirectAuthenticatedUser('/')
  const { requestReset, verifyReset, isLoading, error: apiError } = useForgotPassword()
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [pendingEmail, setPendingEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [isCaptchaRequired, setIsCaptchaRequired] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaChallengeKey, setCaptchaChallengeKey] = useState(0)
  const requestForm = useForm<ForgotPasswordRequestFormValues>({
    resolver: zodResolver(forgotPasswordRequestFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  })
  const verifyForm = useForm<ForgotPasswordVerifyFormValues>({
    resolver: zodResolver(forgotPasswordVerifyFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
    },
  })

  const handleRequestSubmit = async (values: ForgotPasswordRequestFormValues) => {
    requestForm.clearErrors('root')
    setNotice('')

    try {
      const normalizedEmail = values.email.trim()
      await requestReset({
        email: normalizedEmail,
        captchaToken: isCaptchaRequired ? (captchaToken ?? undefined) : undefined,
      })
      setPendingEmail(normalizedEmail)
      setStep('verify')
      setNotice('We sent a verification code to your email.')
      verifyForm.reset({
        email: normalizedEmail,
        otp: '',
      })
    } catch (error) {
      if (isCaptchaRequiredError(error)) {
        setIsCaptchaRequired(true)
      }
      if (isCaptchaRequired || isCaptchaRequiredError(error)) {
        setCaptchaToken(null)
        setCaptchaChallengeKey((current) => current + 1)
      }
      const message = getPracticalAuthErrorMessage(
        error,
        apiError || 'Something went wrong. Please try again.',
        'forgotRequest',
      )
      requestForm.setError('root', { message })
    }
  }

  const handleVerifySubmit = async (values: ForgotPasswordVerifyFormValues) => {
    verifyForm.clearErrors('root')
    setNotice('')

    try {
      const response = await verifyReset({
        email: values.email.trim(),
        otp: values.otp.trim(),
      })

      if (!response?.resetToken) {
        verifyForm.setError('root', {
          message: 'The code is incorrect or expired. Request a new code.',
        })
        return
      }

      writePasswordResetSession({
        email: values.email.trim(),
        resetToken: response.resetToken,
      })
      const nextUrl = `/reset-password?email=${encodeURIComponent(values.email.trim())}`
      await router.push(nextUrl)
    } catch (error) {
      const message = getPracticalAuthErrorMessage(
        error,
        apiError || 'The code is incorrect or expired. Request a new code.',
        'forgotVerify',
      )
      verifyForm.setError('root', { message })
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
      <div className="shadow-artium-xl flex w-[88vw] max-w-160 flex-col gap-6 rounded-4xl bg-white px-10 py-10 text-black sm:px-12 lg:px-14 lg:py-12">
        {/* main content */}
        <div className="rounded-2xl border border-black/10 px-7 py-9">
          {/* header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#191414]">Forgot password</h1>
            <p className="text-base text-[#6b6b6b]">
              Enter your account email and we&apos;ll send a 6-digit verification code.
            </p>
          </div>

          {/* form */}
          {step === 'request' ? (
            <FormProvider {...requestForm}>
              <form
                className="mt-6 space-y-6"
                onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
                noValidate
              >
                {notice ? <p className="text-sm font-semibold text-emerald-600">{notice}</p> : null}
                <AuthFormInput<ForgotPasswordRequestFormValues>
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email address"
                  label="Email address"
                  required
                  aria-invalid={Boolean(requestForm.formState.errors.email)}
                />

                {isCaptchaRequired ? (
                  <TurnstileChallenge
                    action="password_reset_request"
                    challengeKey={captchaChallengeKey}
                    onTokenChange={setCaptchaToken}
                    onError={() =>
                      requestForm.setError('root', {
                        message: 'Verification failed. Please try again.',
                      })
                    }
                  />
                ) : null}

                <FormErrorMessage
                  id="forgot-submit-error"
                  message={requestForm.formState.errors.root?.message ?? ''}
                  visible={Boolean(requestForm.formState.errors.root?.message)}
                />

                <Button
                  className="bg-mint-green hover:bg-mint-green/80 w-full rounded-full border border-black/10 py-3 text-base font-semibold tracking-[0.2em] text-black uppercase"
                  loading={requestForm.formState.isSubmitting || isLoading}
                  disabled={
                    requestForm.formState.isSubmitting ||
                    isLoading ||
                    (isCaptchaRequired && !captchaToken)
                  }
                  type="submit"
                >
                  {requestForm.formState.isSubmitting || isLoading ? 'Sending...' : 'Send code'}
                </Button>
              </form>
            </FormProvider>
          ) : (
            <FormProvider {...verifyForm}>
              <form
                className="mt-6 space-y-6"
                onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
                noValidate
              >
                {notice ? <p className="text-sm font-semibold text-emerald-600">{notice}</p> : null}
                <AuthInput
                  id="forgot-email-readonly"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  value={pendingEmail}
                  disabled
                />

                <AuthFormOtpInput<ForgotPasswordVerifyFormValues>
                  id="forgot-otp"
                  name="otp"
                  label="Verification code"
                  description="Enter the 6-digit code we sent to your email."
                  disabled={verifyForm.formState.isSubmitting || isLoading}
                />

                <FormErrorMessage
                  id="forgot-submit-error"
                  message={verifyForm.formState.errors.root?.message ?? ''}
                  visible={Boolean(verifyForm.formState.errors.root?.message)}
                />

                <Button
                  className="bg-mint-green hover:bg-mint-green/80 w-full rounded-full border border-black/10 py-3 text-base font-semibold tracking-[0.2em] text-black uppercase"
                  loading={verifyForm.formState.isSubmitting || isLoading}
                  disabled={verifyForm.formState.isSubmitting || isLoading}
                  type="submit"
                >
                  {verifyForm.formState.isSubmitting || isLoading ? 'Verifying...' : 'Verify code'}
                </Button>
              </form>
            </FormProvider>
          )}
        </div>

        {/* sign up link */}
        <div className="rounded-2xl border border-black/10 px-8 py-6 text-center">
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
