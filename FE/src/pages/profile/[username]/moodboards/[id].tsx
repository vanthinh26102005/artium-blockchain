import { useRouter } from 'next/router'
import { ProfileMoodboardDetailPageView } from '@domains/profile/views/ProfileMoodboardDetailPage'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * ProfileMoodboardDetailPage - React component
 * @returns React element
 */
const ProfileMoodboardDetailPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { username, id } = router.query

  /**
   * router - Utility function
   * @returns void
   */
  return <ProfileMoodboardDetailPageView username={username} moodboardId={id} />
}

ProfileMoodboardDetailPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ProfileMoodboardDetailPage
