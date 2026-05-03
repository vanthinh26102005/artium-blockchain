import { useRouter } from 'next/router'
import { ProfileMoodboardsPageView } from '@domains/profile/views/ProfileMoodboardsPage'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * ProfileMoodboardsPage - React component
 * @returns React element
 */
const ProfileMoodboardsPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { username } = router.query

/**
 * router - Utility function
 * @returns void
 */
  return <ProfileMoodboardsPageView username={username} />
}

ProfileMoodboardsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ProfileMoodboardsPage
