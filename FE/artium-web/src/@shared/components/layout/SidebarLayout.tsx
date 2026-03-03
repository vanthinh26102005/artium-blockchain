import type { ReactNode } from 'react'
import { SideBar } from '@shared/components/display/SideBar'
import { AppLayout } from '@shared/components/layout/AppLayout'

interface SidebarLayoutProps {
  children: ReactNode
}

export const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <div className="relative">
      <SideBar />
      <div className="sidebar-layout">
        <AppLayout>{children}</AppLayout>
      </div>
      <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar-layout main,
          .sidebar-layout footer {
            margin-left: 300px;
            width: calc(100% - 300px);
            transform: translateZ(0);
          }
        }
      `}</style>
    </div>
  )
}
