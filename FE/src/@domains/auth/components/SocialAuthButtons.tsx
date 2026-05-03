// next
import Image from 'next/image'

import { Button } from '@shared/components/ui/button'

type SocialAuthButtonsProps = {
  onGoogleClick?: () => void
  isGoogleLoading?: boolean
}

/**
 * SocialAuthButtons - React component
 * @returns React element
 */
export const SocialAuthButtons = ({
  onGoogleClick,
  isGoogleLoading = false,
}: SocialAuthButtonsProps) => {
  const isGoogleDisabled = isGoogleLoading || !onGoogleClick

  // -- render --
  /**
   * isGoogleDisabled - Utility function
   * @returns void
   */
  return (
    <div className="inline-flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
      {/* google */}
      <Button
        type="button"
        variant="ghost"
        onClick={onGoogleClick}
        disabled={isGoogleDisabled}
        className="rounded-4xl flex flex-1 gap-3 border border-black/10 px-5 py-3 text-sm font-semibold text-kokushoku-black hover:bg-black/5 hover:text-kokushoku-black disabled:opacity-60"
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
        className="rounded-4xl flex flex-1 gap-3 border border-black/10 px-5 py-3 text-sm font-semibold text-kokushoku-black hover:bg-black/5 hover:text-kokushoku-black disabled:opacity-60"
      >
        <Image src="/images/auth/apple-svgrepo-com.svg" alt="Apple" width={24} height={24} />
        <span className="pt-1">Apple</span>
      </Button>
    </div>
  )
}
