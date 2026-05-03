import React, { ReactNode } from 'react'
import { SiteFooter } from '@shared/components/layout/SiteFooter'
import { SiteHeader } from '@shared/components/layout/SiteHeader'

interface MarketingLayoutProps {
  children: ReactNode
  preFooter?: ReactNode
}

/**
 * MarketingLayout - React component
 * @returns React element
 */
export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children, preFooter }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />
      <main className="w-full flex-1">
        <div className="max-w-480 mx-auto w-full px-6 sm:px-8 lg:px-12">{children}</div>
      </main>
      {preFooter}
      <SiteFooter />
    </div>
  )
}
