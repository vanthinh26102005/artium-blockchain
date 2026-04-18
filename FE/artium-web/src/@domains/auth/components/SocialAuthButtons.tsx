// next
import Image from 'next/image'

// @domains - auth
import { AuthProviderButton } from './AuthProviderButton'

type SocialAuthButtonsProps = {
  onGoogleClick?: () => void
  isGoogleLoading?: boolean
}

export const SocialAuthButtons = ({
  onGoogleClick,
  isGoogleLoading = false,
}: SocialAuthButtonsProps) => {
  // -- render --
  return (
    <div className="inline-flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
      <AuthProviderButton
        icon={
          <Image
            src="/images/auth/google-icon-logo-svgrepo-com.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
        }
        label="Google"
        loadingLabel="Connecting..."
        onClick={onGoogleClick}
        isLoading={isGoogleLoading}
      />

      <AuthProviderButton
        icon={
          <Image
            src="/images/auth/apple-svgrepo-com.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
        }
        label="Apple"
      />
    </div>
  )
}
