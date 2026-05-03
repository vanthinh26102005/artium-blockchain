import { useState, useMemo } from 'react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'

interface SharePortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  artistName: string
  handle: string
  bio?: string
}

/**
 * brandIconColors - Utility function
 * @returns void
 */
const brandIconColors = {
  whatsapp: '#25D366',
  facebook: '#1877F2',
  twitter: '#111111',
  linkedin: '#0A66C2',
  telegram: '#2AABEE',
}

const shareIconStyles = {
  wrapper:
    'inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  /**
   * shareIconStyles - Utility function
   * @returns void
   */
}

export const SharePortfolioModal = ({
  isOpen,
  onClose,
  artistName,
  handle,
  bio,
  /**
   * SharePortfolioModal - React component
   * @returns React element
   */
}: SharePortfolioModalProps) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  // Generate the portfolio URL based on handle
  const portfolioUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const cleanHandle = handle.replace('@', '')
    return `${window.location.origin}/portfolio/${cleanHandle}`
  }, [handle])

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      /**
       * portfolioUrl - Utility function
       * @returns void
       */
      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 2000)
    } catch {
      setIsLinkCopied(false)
    }
    /**
     * cleanHandle - Utility function
     * @returns void
     */
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl bg-white p-6 sm:max-w-[440px]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-center text-2xl font-bold">Share My Portfolio</DialogTitle>
          /** * copyShareUrl - Utility function * @returns void */
        </DialogHeader>

        <p className="mb-6 text-center text-slate-600">
          Share your portfolio directly with your audience. Choose a platform below or copy your
          portfolio URL to spread the word.
        </p>

        {/* Social Share Buttons */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <WhatsappShareButton url={portfolioUrl} title={artistName}>
            <div className={shareIconStyles.wrapper}>
              <WhatsappIcon
                round
                size={28}
                iconFillColor={brandIconColors.whatsapp}
                bgStyle={{ fill: 'white' }}
              />
            </div>
          </WhatsappShareButton>

          <FacebookShareButton url={portfolioUrl} title={artistName}>
            <div className={shareIconStyles.wrapper}>
              <FacebookIcon
                round
                size={28}
                iconFillColor={brandIconColors.facebook}
                bgStyle={{ fill: 'white' }}
              />
            </div>
          </FacebookShareButton>

          <TwitterShareButton url={portfolioUrl} title={artistName}>
            <div className={shareIconStyles.wrapper}>
              <XIcon
                round
                size={28}
                iconFillColor={brandIconColors.twitter}
                bgStyle={{ fill: 'white' }}
              />
            </div>
          </TwitterShareButton>

          <LinkedinShareButton url={portfolioUrl} title={artistName} summary={bio}>
            <div className={shareIconStyles.wrapper}>
              <LinkedinIcon
                round
                size={28}
                iconFillColor={brandIconColors.linkedin}
                bgStyle={{ fill: 'white' }}
              />
            </div>
          </LinkedinShareButton>

          <TelegramShareButton url={portfolioUrl} title={artistName}>
            <div className={shareIconStyles.wrapper}>
              <TelegramIcon
                round
                size={28}
                iconFillColor={brandIconColors.telegram}
                bgStyle={{ fill: 'white' }}
              />
            </div>
          </TelegramShareButton>
        </div>

        {/* Copy Link Section */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 p-3">
          <p className="flex-1 truncate text-sm text-slate-700">{portfolioUrl}</p>
          <button
            onClick={copyShareUrl}
            className={`whitespace-nowrap text-sm font-semibold ${
              isLinkCopied ? 'text-green-600' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {isLinkCopied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
