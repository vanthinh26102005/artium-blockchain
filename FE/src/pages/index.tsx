import type { ReactElement } from 'react'
import { Metadata } from '@/components/SEO/Metadata'
import { LandingPage } from '@shared/components/LandingPage'
import { SiteFooter } from '@shared/components/layout/SiteFooter'
import { SiteHeader } from '@shared/components/layout/SiteHeader'
import type { NextPageWithLayout } from '@shared/types/next'

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Metadata
        title="Artium | Digital Art Marketplace"
        description="Discover art, manage your business, and grow with the Artium platform."
      />
      <div className="min-h-screen bg-black text-white">
        <LandingPage />
      </div>
    </>
  )
}

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col">
        <SiteHeader variant="landing" />
        <main className="w-full flex-1">{page}</main>
        <SiteFooter />
      </div>
    </div>
  )
}

export default Home
