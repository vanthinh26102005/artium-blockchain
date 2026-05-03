// react
import { useState } from 'react'

// third-party
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
} from 'react-share'

// @shared - components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'

// @domains - events
import { type HostingEvent } from '@domains/events/state/useHostingEventsStore'

// icons
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaLinkedinIn, FaTelegram } from 'react-icons/fa6'
import { Check, Copy } from 'lucide-react'

type ShareEventModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: HostingEvent
}

/**
 * ShareEventModal - React component
 * @returns React element
 */
export const ShareEventModal = ({ open, onOpenChange, event }: ShareEventModalProps) => {
  const [copied, setCopied] = useState(false)

  const eventUrl = `https://www.artium.com/event/${event.id}`
  const shareTitle = `Check out this event: ${event.title}`

  /**
   * eventUrl - Utility function
   * @returns void
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      /**
       * shareTitle - Utility function
       * @returns void
       */
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }
  /**
   * handleCopyLink - Utility function
   * @returns void
   */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-3xl border-slate-200 bg-white p-0 font-inter [&>button:hover]:bg-white [&>button]:bg-white [&>button]:text-slate-600 [&>button]:opacity-100">
        <DialogHeader className="px-8 pt-8">
          <DialogTitle className="text-center text-xl font-semibold text-slate-900">
            Share Event
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-8 pb-8 pt-4">
          {/* Social Media Share Buttons */}
          <div className="flex items-center justify-center gap-4">
            <WhatsappShareButton url={eventUrl} title={shareTitle}>
              <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110">
                <FaWhatsapp className="h-6 w-6" />
              </div>
            </WhatsappShareButton>

            <FacebookShareButton url={eventUrl} hashtag="#artium">
              <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-110">
                <FaFacebookF className="h-6 w-6" />
              </div>
            </FacebookShareButton>

            <TwitterShareButton url={eventUrl} title={shareTitle}>
              <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110">
                <FaXTwitter className="h-6 w-6" />
              </div>
            </TwitterShareButton>

            <LinkedinShareButton url={eventUrl} title={shareTitle}>
              <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#0A66C2] text-white transition-transform hover:scale-110">
                <FaLinkedinIn className="h-6 w-6" />
              </div>
            </LinkedinShareButton>

            <TelegramShareButton url={eventUrl} title={shareTitle}>
              <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#229ED9] text-white transition-transform hover:scale-110">
                <FaTelegram className="h-6 w-6" />
              </div>
            </TelegramShareButton>
          </div>

          {/* Copy Link Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-600 outline-none"
              />
            </div>
            <Button
              type="button"
              onClick={handleCopyLink}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
