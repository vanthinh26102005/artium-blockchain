import { useRouter } from 'next/router'
import { ProfilePageView } from '@domains/profile/views/ProfilePage'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * ProfilePage - React component
 * @returns React element
 */
const ProfilePage: NextPageWithLayout = () => {
  const router = useRouter()
  const { username } = router.query

  /**
   * router - Utility function
   * @returns void
   */
  // Wait for router to be ready before rendering
  if (!router.isReady) {
    return null
  }

  return <ProfilePageView username={username} />
}

ProfilePage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ProfilePage
