import Head from 'next/head'

interface MetadataProps {
  title: string
  description?: string
}

/**
 * Metadata - React component
 * @returns React element
 */
export const Metadata = ({ title, description }: MetadataProps) => {
  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/images/logo/logo-dark-mode.png" />
    </Head>
  )
}
