// next
import Image from 'next/image'

import { Button } from '@shared/components/ui/button'

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
      <Button
        type="button"
        variant="ghost"
        onClick={onGoogleClick}
        disabled={isGoogleDisabled}
        className="flex flex-1 gap-3 rounded-4xl border border-black/10 px-5 py-3 text-sm font-semibold text-kokushoku-black hover:bg-black/5 hover:text-kokushoku-black disabled:opacity-60"
      >
        <Image
          src="/images/auth/google-icon-logo-svgrepo-com.svg"
          alt="Google"
          width={24}
          height={24}
        />
        <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
      </Button>

      {/* apple */}
      <Button
        type="button"
        variant="ghost"
        disabled
        className="flex flex-1 gap-3 rounded-4xl border border-black/10 px-5 py-3 text-sm font-semibold text-kokushoku-black hover:bg-black/5 hover:text-kokushoku-black disabled:opacity-60"
      >
        <Image src="/images/auth/apple-svgrepo-com.svg" alt="Apple" width={24} height={24} />
        <span className="pt-1">Apple</span>
      </Button>
    </div>
  )
}
