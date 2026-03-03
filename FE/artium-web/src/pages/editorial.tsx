// @shared - layout
import { MarketingLayout } from '@shared/components/layout/MarketingLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - editorial
import { EditorialPage } from '@domains/editorial/views/EditorialPage'

const EditorialRoute: NextPageWithLayout = () => {
  return <EditorialPage />
}

EditorialRoute.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>

export default EditorialRoute
