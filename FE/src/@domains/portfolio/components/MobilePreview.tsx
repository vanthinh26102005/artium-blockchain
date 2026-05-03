import { useState } from 'react'
import { Share2, QrCode, Copy, MapPin, ExternalLink, FileText, Quote, Check } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { usePortfolio } from '../context/PortfolioContext'
import { SharePortfolioModal } from './SharePortfolioModal'
import { QRCodeModal } from './QRCodeModal'

/**
 * MobilePreview - React component
 * @returns React element
 */
export const MobilePreview = () => {
  const { biography, statement, items, cvFileName, artistName, handle, location, avatar } =
    usePortfolio()

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Only show visible items
  const visibleItems = items.filter((item) => item.visible)

  const portfolioUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${handle.replace('@', '')}`
  /**
   * visibleItems - Utility function
   * @returns void
   */

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      setIsCopied(true)
      /**
       * portfolioUrl - Utility function
       * @returns void
       */
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }
  /**
   * copyUrl - Utility function
   * @returns void
   */

  return (
    <>
      <div className="flex flex-col items-center">
        {/* Action buttons */}
        <div className="mb-4 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-200"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-200"
            onClick={() => setIsQRModalOpen(true)}
          >
            <QrCode className="h-4 w-4" />
            QR code
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-200"
            onClick={copyUrl}
          >
            {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {isCopied ? 'Copied!' : 'Copy URL'}
          </Button>
        </div>

        {/* Phone Frame */}
        <div className="relative">
          {/* Phone Border */}
          <div className="border-12 relative h-[800px] w-[400px] overflow-hidden rounded-[44px] border-slate-800 bg-white shadow-xl">
            {/* Notch */}
            <div className="absolute left-1/2 top-0 z-10 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-800" />

            {/* Screen Content */}
            <div className="scrollbar-hide h-full overflow-y-auto">
              {/* Profile Section */}
              <div className="bg-linear-to-b flex flex-col items-center from-slate-50 to-white px-5 pb-5 pt-12">
                <img
                  src={avatar}
                  alt={artistName}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <h2 className="mt-4 text-lg font-bold text-slate-900">{artistName}</h2>
                <p className="text-sm text-slate-500">{handle}</p>
                <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </div>
              </div>

              {/* Biography Section */}
              {biography && (
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">About</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{biography}</p>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="px-5 py-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email to stay in the loop"
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400"
                    readOnly
                  />
                </div>
                <button className="mt-3 w-full rounded-full bg-slate-900 py-2.5 text-sm font-medium text-white">
                  Subscribe to Artist's updates
                </button>
              </div>

              {/* Main Portfolio Link */}
              <div className="px-5 py-2">
                <div className="flex items-center gap-3 rounded-xl bg-[#0066FF] p-4 text-white">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold">ARTIUM</p>
                    <p className="text-sm text-white/80">View my portfolio</p>
                  </div>
                  <ExternalLink className="h-5 w-5" />
                </div>
              </div>

              {/* Artworks/Links List */}
              <div className="space-y-2 px-5 py-3">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-sm"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                ))}

                {visibleItems.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400">No artworks to display</p>
                )}
              </div>

              {/* View CV Button */}
              {cvFileName && (
                <div className="px-5 py-3">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 p-4 text-slate-700 transition-colors hover:bg-slate-200">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">View CV</span>
                  </button>
                </div>
              )}

              {/* Statement Section */}
              {statement && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Quote className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-slate-700">
                        Artist Statement
                      </h3>
                      <p className="text-sm italic leading-relaxed text-slate-600">"{statement}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mb-4 mt-8 text-center">
                <p className="text-xs text-slate-400">
                  Powered by{' '}
                  <span className="ml-1 inline-block align-middle">
                    <img
                      src="/images/logo/logo-and-text-light-mode.png"
                      alt="Artium"
                      className="h-4 w-auto"
                    />
                  </span>
                </p>
              </div>

              {/* Bottom spacing */}
              <div className="h-8" />
            </div>
          </div>

          {/* Phone Side Buttons */}
          <div className="absolute right-[-3px] top-28 h-14 w-[4px] rounded-r-sm bg-slate-700" />
          <div className="absolute left-[-3px] top-24 h-10 w-[4px] rounded-l-sm bg-slate-700" />
          <div className="absolute left-[-3px] top-36 h-16 w-[4px] rounded-l-sm bg-slate-700" />
        </div>
      </div>

      {/* Modals */}
      <SharePortfolioModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artistName={artistName}
        handle={handle}
        bio={biography}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        artistName={artistName}
        handle={handle}
      />
    </>
  )
}
