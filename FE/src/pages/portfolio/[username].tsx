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
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        biography: 'A passionate artist exploring the boundaries between digital and traditional art forms.',
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
                thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
                visible: true,
            },
            {
                id: '2',
                type: 'carousel',
                title: 'Nature Photography Series',
                url: 'https://artium.com/artist/artworks/nature-series',
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
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
                thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        )
    }

/**
 * portfolioData - Utility function
 * @returns void
 */
    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Portfolio not found</h1>
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
                <div className="flex flex-col items-center pt-12 pb-6 px-4">
                    <img
                        src={data.avatar}
/**
 * visibleItems - Utility function
 * @returns void
 */
                        alt={data.artistName}
                        className="h-24 w-24 md:h-28 md:w-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <h1 className="mt-4 text-xl md:text-2xl font-bold text-slate-900">{data.artistName}</h1>
                    <p className="text-sm text-slate-500">{data.handle}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
                        <MapPin className="h-4 w-4" />
                        {data.location}
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-lg mx-auto px-4 pb-12">
                    {/* Newsletter Signup */}
                    <div className="mb-6">
                        <div className="flex gap-2 mb-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email to stay in the loop"
                                className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-black"
                            />
                        </div>
                        <button className="w-full rounded-full bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
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
                                className="block group"
                            >
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                                    {item.thumbnail && (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4 flex items-center justify-between">
                                        <span className="text-blue-600 font-medium text-sm">{item.title}</span>
                                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
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
                                className="w-full flex items-center justify-center gap-2 rounded-xl p-4 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                <FileText className="h-5 w-5" />
                                <span className="font-medium">View CV</span>
                            </a>
                        </div>
                    )}

                    {/* Statement Section */}
                    {data.statement && (
                        <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <Quote className="h-6 w-6 text-slate-300 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Artist Statement</h3>
                                    <p className="text-slate-600 leading-relaxed italic">"{data.statement}"</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-xs text-slate-400">
                            Powered by{' '}
                            <a href="/" className="inline-block align-middle ml-1">
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
