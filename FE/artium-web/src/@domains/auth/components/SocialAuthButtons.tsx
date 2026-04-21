// next
import Image from 'next/image'

type SocialAuthButtonsProps = {
  onGoogleClick?: () => void
  isGoogleLoading?: boolean
}

export const SocialAuthButtons = ({
  onGoogleClick,
  isGoogleLoading = false,
}: SocialAuthButtonsProps) => {
  const isGoogleDisabled = isGoogleLoading || !onGoogleClick

  // -- render --
  return (
    <div className="inline-flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
      {/* google */}
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isGoogleDisabled}
        className="flex flex-1 items-center justify-center gap-3 rounded-4xl border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Image
          src="/images/auth/google-icon-logo-svgrepo-com.svg"
          alt="Google"
          width={24}
          height={24}
        />
        <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
      </button>

      {/* apple */}
      <button
        type="button"
        disabled
        className="flex flex-1 items-center justify-center gap-3 rounded-4xl border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Image src="/images/auth/apple-svgrepo-com.svg" alt="Apple" width={24} height={24} />
        <span className="pt-1">Apple</span>
      </button>
    </div>
  )
}
