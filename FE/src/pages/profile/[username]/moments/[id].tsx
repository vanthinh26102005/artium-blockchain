import { useRouter } from 'next/router'
import { MomentDetailPage } from '@domains/profile/views/MomentDetailPage'
import type { NextPageWithLayout } from '@shared/types/next'

const ProfileMomentDetailPageRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { username, id } = router.query

  return <MomentDetailPage username={username as string} momentId={id as string} />
}

// No layout wrapper - moment detail has its own full-screen layout
ProfileMomentDetailPageRoute.getLayout = (page) => page

export default ProfileMomentDetailPageRoute
