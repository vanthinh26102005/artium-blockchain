import type { ReactNode } from 'react'
import { SideBar } from '@shared/components/display/SideBar'
import { AppLayout } from '@shared/components/layout/AppLayout'

interface SidebarLayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

/**
 * SidebarLayout - React component
 * @returns React element
 */
export const SidebarLayout = ({ children, hideFooter = false }: SidebarLayoutProps) => {
  return (
    <div className="relative">
      <SideBar />
      <div className="sidebar-layout">
        <AppLayout hideFooter={hideFooter}>{children}</AppLayout>
      </div>
      <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar-layout
            .app-layout
            > main${hideFooter ? '' : ',\n          .sidebar-layout .app-layout > footer'} {
            margin-left: 300px;
            width: calc(100% - 300px);
            transform: translateZ(0);
          }
        }
      `}</style>
    </div>
  )
}
