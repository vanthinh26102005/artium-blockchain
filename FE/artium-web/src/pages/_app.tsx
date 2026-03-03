import '../styles/globals.css'
import '@shared/styles/container.css'
import 'react-international-phone/style.css'
import 'photoswipe/style.css'
import type { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { AuthBootstrap } from '@shared/components/auth/AuthBootstrap'
import { AppLayout } from '@shared/components/layout/AppLayout'
import type { NextPageWithLayout } from '@shared/types/next'

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => <AppLayout>{page}</AppLayout>)

  const page = getLayout(<Component {...pageProps} />)

  return (
    <SessionProvider session={pageProps.session}>
      <AuthBootstrap />
      {page}
    </SessionProvider>
  )
}
