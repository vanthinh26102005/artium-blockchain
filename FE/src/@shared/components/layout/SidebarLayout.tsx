import type { CSSProperties, ReactNode } from 'react'
import { SideBar } from '@shared/components/display/SideBar'
import { AppLayout } from '@shared/components/layout/AppLayout'

interface SidebarLayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

export const SidebarLayout = ({ children, hideFooter = false }: SidebarLayoutProps) => {
  return (
    <div
      className="relative"
      style={
        {
          '--sidebar-width': '84px',
        } as CSSProperties
      }
    >
      <SideBar />
      <div className="sidebar-layout">
        <AppLayout hideFooter={hideFooter}>{children}</AppLayout>
      </div>
      <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar-layout
            .app-layout
            > main${hideFooter ? '' : ',\n          .sidebar-layout .app-layout > footer'} {
            margin-left: var(--sidebar-width);
            width: calc(100% - var(--sidebar-width));
            transform: translateZ(0);
          }
        }
      `}</style>
    </div>
  )
}
