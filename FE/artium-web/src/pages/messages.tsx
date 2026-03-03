import dynamic from 'next/dynamic'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

const MessagingView = dynamic(
  () => import('@domains/messaging/views/MessagingView').then((module) => module.MessagingView),
  { ssr: false },
)

const MessagesPage: NextPageWithLayout = () => {
  useRequireAuth()

  return <MessagingView />
}

MessagesPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default MessagesPage
