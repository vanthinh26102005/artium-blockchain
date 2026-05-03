import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { MapPin, ExternalLink, FileText, Quote, Mail } from 'lucide-react'

// Mock data - In real app, this would come from API based on username
interface PortfolioItem {
  id: string
  type: 'link' | 'carousel' | 'collection'
  title: string
  url: string
  thumbnail?: string
  visible: boolean
}

interface PublicPortfolioData {
  artistName: string
  handle: string
  location: string
  avatar: string
  biography: string
  statement: string
  cvUrl: string | null
  items: PortfolioItem[]
}

/**
 * to - Utility function
 * @returns void
 */
// Mock function to fetch portfolio data
const fetchPortfolioData = (username: string): PublicPortfolioData | null => {
  // In real app, this would be an API call
  // For now, return mock data for "artiumartist"
  /**
   * fetchPortfolioData - Utility function
   * @returns void
   */
  const mockData: PublicPortfolioData = {
    artistName: 'Artium Artist',
    handle: `@${username}`,
    location: 'Ho Chi Minh City, Vietnam',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    biography:
      'A passionate artist exploring the boundaries between digital and traditional art forms.',
    /**
     * mockData - Utility function
     * @returns void
     */
    statement:
      'My work reflects the intersection of technology and human emotion, creating pieces that resonate with the modern soul.',
    cvUrl: null,
    items: [
      {
        id: '1',
        type: 'link',
        title: 'Abstract Dreams Collection',
        url: 'https://artium.com/artist/artworks/abstract-dreams',
        thumbnail:
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
        visible: true,
      },
      {
        id: '2',
        type: 'carousel',
        title: 'Nature Photography Series',
        url: 'https://artium.com/artist/artworks/nature-series',
        thumbnail:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        visible: true,
      },
      {
        id: '3',
        type: 'collection',
        title: 'Modern Art Showcase',
        url: 'https://artium.com/artist/collections/modern-art',
        thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop',
        visible: true,
      },
      {
        id: '4',
        type: 'link',
        title: 'Commission Information',
        url: 'https://artium.com/artist/commissions',
        thumbnail:
          'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
        visible: true,
      },
    ],
  }

  return mockData
}

import type { NextPageWithLayout } from '@shared/types/next'

const PublicPortfolioPage: NextPageWithLayout = () => {
  const router = useRouter()
  // ... code giữ nguyên
  const { username } = router.query
  const [data, setData] = useState<PublicPortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    /**
     * PublicPortfolioPage - React component
     * @returns React element
     */
    if (username && typeof username === 'string') {
      // Simulate API call
      setTimeout(() => {
        const portfolioData = fetchPortfolioData(username)
        /**
         * router - Utility function
         * @returns void
         */
        setData(portfolioData)
        setIsLoading(false)
      }, 500)
    }
  }, [username])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  /**
   * portfolioData - Utility function
   * @returns void
   */
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Portfolio not found</h1>
        <p className="text-slate-500">The portfolio you're looking for doesn't exist.</p>
      </div>
    )
  }

  const visibleItems = data.items.filter((item) => item.visible)

  return (
    <>
      <Head>
        <title>{data.artistName} | Artium</title>
        <meta name="description" content={data.biography} />
        <meta property="og:title" content={`${data.artistName} | Artium`} />
        <meta property="og:description" content={data.biography} />
        <meta property="og:image" content={data.avatar} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Profile Header */}
        <div className="flex flex-col items-center px-4 pb-6 pt-12">
          <img
            src={data.avatar}
            /**
             * visibleItems - Utility function
             * @returns void
             */
            alt={data.artistName}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg md:h-28 md:w-28"
          />
          <h1 className="mt-4 text-xl font-bold text-slate-900 md:text-2xl">{data.artistName}</h1>
          <p className="text-sm text-slate-500">{data.handle}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
            <MapPin className="h-4 w-4" />
            {data.location}
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-lg px-4 pb-12">
          {/* Newsletter Signup */}
          <div className="mb-6">
            <div className="mb-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to stay in the loop"
                className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="w-full rounded-full bg-slate-900 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800">
              Subscribe to {data.artistName.split(' ')[0]}'s updates
            </button>
          </div>

          {/* Artworks/Links List */}
          <div className="space-y-4">
            {visibleItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  {item.thumbnail && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-medium text-blue-600">{item.title}</span>
                    <ExternalLink className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* View CV Button */}
          {data.cvUrl && (
            <div className="mt-6">
              <a
                href={data.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 p-4 text-slate-700 transition-colors hover:bg-slate-200"
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">View CV</span>
              </a>
            </div>
          )}

          {/* Statement Section */}
          {data.statement && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6">
              <div className="flex items-start gap-3">
                <Quote className="mt-0.5 h-6 w-6 shrink-0 text-slate-300" />
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Artist Statement</h3>
                  <p className="italic leading-relaxed text-slate-600">"{data.statement}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400">
              Powered by{' '}
              <a href="/" className="ml-1 inline-block align-middle">
                <img
                  src="/images/logo/logo-and-text-light-mode.png"
                  alt="Artium"
                  className="h-5 w-auto" // Điều chỉnh kích thước logo cho phù hợp
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

PublicPortfolioPage.getLayout = (page) => page

export default PublicPortfolioPage
