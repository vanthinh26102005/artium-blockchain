import React, { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { SiteFooter } from '@shared/components/layout/SiteFooter'
import { SiteHeader } from '@shared/components/layout/SiteHeader'

interface AppLayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, hideFooter = false }) => {
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)

  return (
    <div className="app-layout flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="w-full flex-1">
        <div className="w-full px-6 py-4 sm:px-8 lg:px-12">{children}</div>
      </main>
      {hideFooter ? null : <SiteFooter />}
      {isLoggingOut ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-white/80 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-sm items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Signing out</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Clearing your session and returning to login.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
