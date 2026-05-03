// react
import { useMemo, useState } from 'react'

// third-party
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from 'react-share'

// @shared - utils
import { cn } from '@shared/lib/utils'

type SocialShareButtonsProps = {
  fullName: string
  storefrontUrl: string
  bio?: string
}

/**
 * toKebabCase - Utility function
 * @returns void
 */
const toKebabCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const shareIconStyles = {
  wrapper:
    'inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-sm',
  /**
   * shareIconStyles - Utility function
   * @returns void
   */
}

const brandIconColors = {
  whatsapp: '#25D366',
  facebook: '#1877F2',
  twitter: '#111111',
  linkedin: '#0A66C2',
  telegram: '#2AABEE',
  /**
   * brandIconColors - Utility function
   * @returns void
   */
}

export const SocialShareButtons = ({ fullName, storefrontUrl, bio }: SocialShareButtonsProps) => {
  // -- state --
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  // -- derived --
  const hashtag = useMemo(() => `#${toKebabCase(fullName)} #artium`, [fullName])

  // -- handlers --
  const copyShareUrl = async () => {
    /**
     * SocialShareButtons - React component
     * @returns React element
     */
    try {
      await navigator.clipboard.writeText(storefrontUrl)
      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 2000)
    } catch {
      setIsLinkCopied(false)
    }
  }
  /**
   * hashtag - Utility function
   * @returns void
   */

  // -- render --
  return (
    <div className="flex w-full flex-col gap-4">
      {/* share buttons */}
      <div className="inline-flex w-full items-center justify-center gap-4">
        /** * copyShareUrl - Utility function * @returns void */
        <WhatsappShareButton url={storefrontUrl} title={fullName}>
          <div className={shareIconStyles.wrapper}>
            <WhatsappIcon
              round
              size={24}
              iconFillColor={brandIconColors.whatsapp}
              bgStyle={{ fill: 'white' }}
            />
          </div>
        </WhatsappShareButton>
        <FacebookShareButton url={storefrontUrl} title={fullName} hashtag={hashtag}>
          <div className={shareIconStyles.wrapper}>
            <FacebookIcon
              round
              size={24}
              iconFillColor={brandIconColors.facebook}
              bgStyle={{ fill: 'white' }}
            />
          </div>
        </FacebookShareButton>
        {/* @ts-expect-error react-share types lag behind Twitter/X API */}
        <TwitterShareButton url={storefrontUrl} title={fullName} hashtag={hashtag}>
          <div className={shareIconStyles.wrapper}>
            <XIcon
              round
              size={24}
              iconFillColor={brandIconColors.twitter}
              bgStyle={{ fill: 'white' }}
            />
          </div>
        </TwitterShareButton>
        <LinkedinShareButton url={storefrontUrl} title={fullName} summary={bio}>
          <div className={shareIconStyles.wrapper}>
            <LinkedinIcon
              round
              size={24}
              iconFillColor={brandIconColors.linkedin}
              bgStyle={{ fill: 'white' }}
            />
          </div>
        </LinkedinShareButton>
        <TelegramShareButton url={storefrontUrl} title={fullName}>
          <div className={shareIconStyles.wrapper}>
            <TelegramIcon
              round
              size={24}
              iconFillColor={brandIconColors.telegram}
              bgStyle={{ fill: 'white' }}
            />
          </div>
        </TelegramShareButton>
      </div>

      {/* share link */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-white/60 bg-white/70 px-4 py-2 shadow-sm">
        <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-700">
          {storefrontUrl}
        </p>
        <button
          type="button"
          onClick={copyShareUrl}
          className={cn('text-sm font-semibold', {
            'text-blue-600': !isLinkCopied,
            'text-slate-400': isLinkCopied,
          })}
        >
          {isLinkCopied ? 'Link copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

type ShareSocialModalProps = {
  onClose: () => void
  fullName: string
  storefrontUrl: string
  bio?: string
  isOpen: boolean
  className?: string
}

export const ShareSocialModal = (props: ShareSocialModalProps) => {
  // -- state --

  // -- derived --
  const { fullName, storefrontUrl, bio, isOpen, className } = props

  // -- handlers --

  // -- render --
  if (!isOpen) {
    return null
  }

  return (
    <div
      className={cn(
        'w-96 max-w-[90vw] rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl',
        className,
        /**
         * ShareSocialModal - React component
         * @returns React element
         */
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* content */}
      <SocialShareButtons storefrontUrl={storefrontUrl} bio={bio} fullName={fullName} />
    </div>
  )
}
