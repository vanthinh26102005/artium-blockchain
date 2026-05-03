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

/**
 * EditorialDetailPage - React component
 * @returns React element
 */
const EditorialDetailPage: NextPageWithLayout<EditorialDetailProps> = ({ article }) => {
  return <EditorialDetailView article={article} />
}

EditorialDetailPage.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = EDITORIAL_ITEMS.map((item) => ({
    params: { id: item.id },
    /**
     * getStaticPaths - Utility function
     * @returns void
     */
  }))
  return { paths, fallback: false }
}

/**
 * paths - Utility function
 * @returns void
 */
export const getStaticProps: GetStaticProps<EditorialDetailProps> = async (context) => {
  const id = context.params?.id as string
  const article = EDITORIAL_ITEMS.find((item) => item.id === id)

  if (!article) {
    return { notFound: true }
  }

  return {
    /**
     * getStaticProps - Utility function
     * @returns void
     */
    props: {
      article,
    },
  }
  /**
   * id - Utility function
   * @returns void
   */
}

export default EditorialDetailPage

/**
 * article - Utility function
 * @returns void
 */
