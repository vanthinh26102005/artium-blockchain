// next
import Image from 'next/image'
import { Wallet } from 'lucide-react'

type SocialAuthButtonsProps = {
  onGoogleClick?: () => void
  isGoogleLoading?: boolean
  onWalletClick?: () => void
  isWalletLoading?: boolean
}

export const SocialAuthButtons = ({
  onGoogleClick,
  isGoogleLoading = false,
  onWalletClick,
  isWalletLoading = false,
}: SocialAuthButtonsProps) => {
  // -- render --
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3 sm:gap-4">
      {/* google */}
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isGoogleLoading}
        className="flex flex-1 items-center justify-center gap-3 rounded-[32px] border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Image
          src="/images/auth/google-icon-logo-svgrepo-com.svg"
          alt="Google"
          width={24}
          height={24}
        />
        <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
      </button>

      {/* wallet */}
      <button
        type="button"
        onClick={onWalletClick}
        disabled={isWalletLoading}
        className="flex flex-1 items-center justify-center gap-3 rounded-[32px] border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Wallet className="h-6 w-6" strokeWidth={1.8} />
        <span>{isWalletLoading ? 'Connecting...' : 'Wallet'}</span>
      </button>

      {/* apple */}
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-3 rounded-[32px] border border-black/10 px-5 py-3 text-sm font-semibold text-[#191414] transition hover:bg-black/5"
      >
        <Image src="/images/auth/apple-svgrepo-com.svg" alt="Apple" width={24} height={24} />
        <span className="pt-1">Apple</span>
      </button>
    </div>
  )
}
