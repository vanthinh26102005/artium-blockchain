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
import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

// @domains - auth
import { AuthFormOtpInput, AuthShell } from '@domains/auth/components'
import { useForgotPassword } from '@domains/auth/hooks/useForgotPassword'
import { useRedirectAuthenticatedUser } from '@domains/auth/hooks/useRedirectAuthenticatedUser'
import { writePasswordResetSession } from '@domains/auth/services/browserAuthState'
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

  const requestEmailField = requestForm.register('email')
  const requestEmailError = requestForm.formState.errors.email?.message

  const handleRequestSubmit = async (values: ForgotPasswordRequestFormValues) => {
    requestForm.clearErrors('root')
    setNotice('')

    try {
      const normalizedEmail = values.email.trim()
      await requestReset({ email: normalizedEmail })
      setPendingEmail(normalizedEmail)
      setStep('verify')
      setNotice('We sent a verification code to your email.')
      verifyForm.reset({
        email: normalizedEmail,
        otp: '',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : apiError || 'Request failed.'
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
        verifyForm.setError('root', { message: 'Reset verification failed.' })
        return
      }

      writePasswordResetSession({
        email: values.email.trim(),
        resetToken: response.resetToken,
      })
      const nextUrl = `/reset-password?email=${encodeURIComponent(values.email.trim())}`
      await router.push(nextUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : apiError || 'Verification failed.'
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
      <div className="shadow-artium-xl flex w-[88vw] max-w-[640px] flex-col gap-6 rounded-4xl bg-white px-10 py-10 text-black sm:px-12 lg:px-14 lg:py-12">
        {/* main content */}
        <div className="rounded-[16px] border border-black/10 px-7 py-9">
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
                <div>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email"
                    aria-invalid={Boolean(requestForm.formState.errors.email)}
                    aria-describedby="forgot-error"
                    className={cn(
                      'h-auto rounded-none border-b-2 border-black px-0 py-2 text-base text-[#191414] placeholder:text-[#898788] focus-visible:ring-0',
                      requestEmailError &&
                      'border-[#FF4337] text-[#FF4337] focus-visible:border-[#FF4337]',
                    )}
                    {...requestEmailField}
                    onChange={(event) => {
                      requestForm.clearErrors('root')
                      requestEmailField.onChange(event)
                    }}
                  />
                  {requestEmailError ? (
                    <p className="mt-2 text-xs font-medium text-[#FF4337]">{requestEmailError}</p>
                  ) : null}
                </div>

                <FormErrorMessage
                  id="forgot-error"
                  message={requestForm.formState.errors.root?.message ?? ''}
                  visible={Boolean(requestForm.formState.errors.root?.message)}
                />

                <Button
                  className="bg-mint-green hover:bg-mint-green/80 w-full rounded-full border border-black/10 py-3 text-base font-semibold tracking-[0.2em] text-black uppercase"
                  loading={requestForm.formState.isSubmitting || isLoading}
                  disabled={requestForm.formState.isSubmitting || isLoading}
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
                <div>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={pendingEmail}
                    disabled
                    className="h-auto rounded-none border-b-2 border-black border-black px-0 py-2 text-base text-[#191414] placeholder:text-[#898788] focus-visible:ring-0"
                  />
                </div>

                <AuthFormOtpInput<ForgotPasswordVerifyFormValues>
                  id="forgot-otp"
                  name="otp"
                  label="Verification code"
                  description="Enter the 6-digit code we sent to your email."
                  disabled={verifyForm.formState.isSubmitting || isLoading}
                />

                <FormErrorMessage
                  id="forgot-error"
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
        <div className="rounded-[16px] border border-black/10 px-8 py-6 text-center">
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
