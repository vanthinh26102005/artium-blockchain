// react
import { useState, ChangeEvent, FormEvent } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// third-party
import { Mail, Phone } from 'lucide-react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - auth
import { AuthShell, FormErrorMessage } from '@domains/auth/components'
import { useForgotPassword } from '@domains/auth/hooks/useForgotPassword'

type RecoveryMethod = 'email' | 'phone'

export const ForgotPasswordPage = () => {
  // -- routing --
  const router = useRouter()

  // -- state --
  const { requestReset, verifyReset, isLoading, error: apiError } = useForgotPassword()
  const [method, setMethod] = useState<RecoveryMethod>('email')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [notice, setNotice] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  // -- derived --
  const trimmedEmail = email.trim()
  const trimmedPhone = phone.trim()
  const isEmailValid = trimmedEmail.length > 0 && trimmedEmail.includes('@')
  const isPhoneValid = trimmedPhone.length > 0
  const isOtpValid = /^\d{6}$/.test(otp.trim())
  const isFormValid =
    method === 'email'
      ? step === 'verify'
        ? isEmailValid && isOtpValid
        : isEmailValid
      : isPhoneValid
  const shouldShowValidation = hasSubmitted && !isFormValid
  const validationMessage =
    method === 'phone'
      ? 'Enter a valid phone number.'
      : step === 'verify' && !isOtpValid
        ? 'OTP must be 6 digits.'
        : !isEmailValid
          ? 'Enter a valid email address.'
          : ''
  const formErrorMessage =
    serverError || apiError || (shouldShowValidation ? validationMessage : '')
  const shouldShowError = formErrorMessage.length > 0
  const isSubmitDisabled = isLoading || !isFormValid

  // -- handlers --
  const handleMethodChange = (nextMethod: RecoveryMethod) => {
    setMethod(nextMethod)
    setStep('request')
    setOtp('')
    setHasSubmitted(false)
    setNotice('')
    setServerError('')
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleOtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value)
    if (serverError) {
      setServerError('')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)
    setServerError('')
    setNotice('')

    if (!isFormValid) {
      return
    }

    if (method === 'phone') {
      setServerError('Phone recovery is not available yet. Please use email.')
      return
    }

    try {
      if (step === 'request') {
        await requestReset({ email: trimmedEmail })
        setStep('verify')
        setOtp('')
        setNotice('We sent a verification code to your email.')
        setHasSubmitted(false)
        return
      }

      const response = await verifyReset({ email: trimmedEmail, otp: otp.trim() })
      if (response?.resetToken) {
        const nextUrl = `/reset-password?email=${encodeURIComponent(
          trimmedEmail,
        )}&resetToken=${encodeURIComponent(response.resetToken)}`
        await router.push(nextUrl)
      } else {
        setServerError('Reset verification failed.')
      }
    } catch (error) {
      // errors are handled by hook state
    }
  }

  // -- render --
  return (
    <AuthShell>
      <Metadata title="Forgot password | Artium" />

      {/* card */}
      <div className="shadow-artium-xl flex w-[88vw] max-w-[640px] flex-col gap-6 rounded-[32px] bg-white px-10 py-10 text-black sm:px-12 lg:px-14 lg:py-12">
        {/* main content */}
        <div className="rounded-[16px] border border-black/10 px-7 py-9">
          {/* header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#191414]">Forgot password</h1>
            <p className="text-base text-[#6b6b6b]">
              Confirm your account email/phone and for us to send instructions to.
            </p>
          </div>

          {/* method selection */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleMethodChange('phone')}
              className={cn(
                'flex w-full items-center justify-center gap-3 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition',
                method === 'phone' ? 'bg-[#E5E5E5]' : 'bg-white',
              )}
            >
              <Phone className="h-5 w-5" />
              <span>Phone</span>
            </button>

            <button
              type="button"
              onClick={() => handleMethodChange('email')}
              className={cn(
                'flex w-full items-center justify-center gap-3 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition',
                method === 'email' ? 'bg-[#E5E5E5]' : 'bg-white',
              )}
            >
              <Mail className="h-5 w-5" />
              <span>Email</span>
            </button>
          </div>

          {/* form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            {notice ? <p className="text-sm font-semibold text-emerald-600">{notice}</p> : null}
            <div>
              {method === 'email' ? (
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleEmailChange}
                  aria-invalid={shouldShowError}
                  aria-describedby="forgot-error"
                  disabled={step === 'verify'}
                  className="h-auto rounded-none border-b-2 border-black border-transparent px-0 py-2 text-base text-[#191414] placeholder:text-[#898788] focus-visible:ring-0"
                />
              ) : (
                <Input
                  id="forgot-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  aria-invalid={shouldShowError}
                  aria-describedby="forgot-error"
                  className="h-auto rounded-none border-b-2 border-black border-transparent px-0 py-2 text-base text-[#191414] placeholder:text-[#898788] focus-visible:ring-0"
                />
              )}
            </div>

            {method === 'email' && step === 'verify' ? (
              <div>
                <Input
                  id="forgot-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  aria-invalid={shouldShowError}
                  aria-describedby="forgot-error"
                  className="h-auto rounded-none border-b-2 border-black border-transparent px-0 py-2 text-base text-[#191414] placeholder:text-[#898788] focus-visible:ring-0"
                />
              </div>
            ) : null}

            <FormErrorMessage
              id="forgot-error"
              message={formErrorMessage}
              visible={shouldShowError}
            />

            <Button
              className="bg-mint-green hover:bg-mint-green/80 w-full rounded-full border border-black/10 py-3 text-base font-semibold tracking-[0.2em] text-black uppercase"
              loading={isLoading}
              disabled={isSubmitDisabled}
              type="submit"
            >
              {step === 'verify'
                ? isLoading
                  ? 'Verifying...'
                  : 'Verify'
                : isLoading
                  ? 'Sending...'
                  : 'Send'}
            </Button>
          </form>
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
