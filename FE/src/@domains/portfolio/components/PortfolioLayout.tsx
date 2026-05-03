import { PortfolioContent } from './PortfolioContent'
import { MobilePreview } from './MobilePreview'
import { PortfolioProvider } from '../context/PortfolioContext'

/**
 * PortfolioLayout - React component
 * @returns React element
 */
export const PortfolioLayout = () => {
  return (
    <PortfolioProvider>
      <div className="grid min-h-[calc(100vh-160px)] grid-cols-1 gap-8 lg:grid-cols-[1fr_480px]">
        {/* Left: Content Management */}
        <div className="min-w-0">
          <PortfolioContent />
        </div>

        {/* Right: Mobile Preview - Sticky positioned */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <MobilePreview />
          </div>
        </div>
      </div>
    </PortfolioProvider>
  )
}
