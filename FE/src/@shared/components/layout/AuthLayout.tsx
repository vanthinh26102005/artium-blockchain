import React, { ReactNode } from 'react'

import { SiteHeader } from '@shared/components/layout/SiteHeader'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * AuthLayout - React component
 * @returns React element
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-900">
      <SiteHeader />
      <main className="w-full flex-1">{children}</main>
    </div>
  )
}
