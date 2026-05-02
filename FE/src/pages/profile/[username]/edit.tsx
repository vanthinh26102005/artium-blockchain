import { useRouter } from 'next/router'
import { ProfileEditPageView } from '@domains/profile/views/ProfileEditPage'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

const ProfileEditPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { username } = router.query

  return <ProfileEditPageView username={username} />
}

ProfileEditPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ProfileEditPage
