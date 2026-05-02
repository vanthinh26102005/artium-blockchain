import { GetStaticPaths, GetStaticProps } from 'next'

// @shared - layout
import { MarketingLayout } from '@shared/components/layout/MarketingLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - editorial
import { EditorialDetailView } from '@domains/editorial/views/EditorialDetailView'
import { EDITORIAL_ITEMS } from '@domains/editorial/data/editorials'
import type { EditorialItem } from '@domains/editorial/types'

type EditorialDetailProps = {
  article: EditorialItem
}

const EditorialDetailPage: NextPageWithLayout<EditorialDetailProps> = ({ article }) => {
  return <EditorialDetailView article={article} />
}

EditorialDetailPage.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = EDITORIAL_ITEMS.map((item) => ({
    params: { id: item.id },
  }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<EditorialDetailProps> = async (context) => {
  const id = context.params?.id as string
  const article = EDITORIAL_ITEMS.find((item) => item.id === id)

  if (!article) {
    return { notFound: true }
  }

  return {
    props: {
      article,
    },
  }
}

export default EditorialDetailPage
