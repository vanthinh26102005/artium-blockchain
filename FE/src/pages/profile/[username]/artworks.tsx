import { useRouter } from 'next/router'
import { ProfileArtworksPageView } from '@domains/profile/views/ProfileArtworksPage'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'

const ProfileArtworksPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { username } = router.query

  return <ProfileArtworksPageView username={username} />
}

ProfileArtworksPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default ProfileArtworksPage
