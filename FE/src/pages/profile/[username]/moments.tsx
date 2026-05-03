import { useRouter } from 'next/router'
import { ProfileMomentsPageView } from '@domains/profile/views/ProfileMomentsPage'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * ProfileMomentsPage - React component
 * @returns React element
 */
const ProfileMomentsPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { username } = router.query

  /**
   * router - Utility function
   * @returns void
   */
  return <ProfileMomentsPageView username={username} />
}

ProfileMomentsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ProfileMomentsPage
