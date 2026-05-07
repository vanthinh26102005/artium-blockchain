import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { SideBar } from '@shared/components/display/SideBar'
import { AppLayout } from '@shared/components/layout/AppLayout'

interface SidebarLayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

export const SidebarLayout = ({ children, hideFooter = false }: SidebarLayoutProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  return (
    <div
      className="relative"
      style={
        {
          '--sidebar-width': isSidebarExpanded ? '300px' : '84px',
        } as CSSProperties
      }
    >
      <SideBar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded((expanded) => !expanded)}
      />
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
            transition:
              margin-left 240ms ease,
              width 240ms ease;
          }
        }
      `}</style>
    </div>
  )
}
