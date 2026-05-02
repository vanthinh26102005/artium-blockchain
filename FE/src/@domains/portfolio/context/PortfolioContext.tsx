import { createContext, useContext, useState, ReactNode } from 'react'

export interface PortfolioItem {
    id: string
    type: 'link' | 'carousel' | 'collection'
    title: string
    url: string
    thumbnail?: string
    visible: boolean
}

interface PortfolioContextType {
    // Biography
    biography: string
    setBiography: (value: string) => void

    // Statement
    statement: string
    setStatement: (value: string) => void

    // Portfolio Items
    items: PortfolioItem[]
    setItems: (items: PortfolioItem[]) => void

    // CV
    cvFileName: string | null
    setCvFileName: (name: string | null) => void

    // Visibility toggles
    salesGraphVisible: boolean
    setSalesGraphVisible: (visible: boolean) => void

    // Artist info
    artistName: string
    handle: string
    location: string
    avatar: string
}

const defaultItems: PortfolioItem[] = [
    {
        id: '1',
        type: 'link',
        title: 'Abstract Dreams Collection',
        url: 'https://artium.com/artist/artworks/abstract-dreams',
        thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
        visible: true,
    },
    {
        id: '2',
        type: 'carousel',
        title: 'Nature Photography Series',
        url: 'https://artium.com/artist/artworks/nature-series',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
        visible: true,
    },
    {
        id: '3',
        type: 'collection',
        title: 'Modern Art Showcase',
        url: 'https://artium.com/artist/collections/modern-art',
        thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=100&h=100&fit=crop',
        visible: false,
    },
    {
        id: '4',
        type: 'link',
        title: 'Commission Information',
        url: 'https://artium.com/artist/commissions',
        thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
        visible: true,
    },
]

const PortfolioContext = createContext<PortfolioContextType | null>(null)

export const usePortfolio = () => {
    const context = useContext(PortfolioContext)
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider')
    }
    return context
}

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
    const [biography, setBiography] = useState('')
    const [statement, setStatement] = useState('')
    const [items, setItems] = useState<PortfolioItem[]>(defaultItems)
    const [cvFileName, setCvFileName] = useState<string | null>(null)
    const [salesGraphVisible, setSalesGraphVisible] = useState(false)

    // Artist info (would come from user profile in real app)
    const artistName = 'Artium Artist'
    const handle = '@artiumartist'
    const location = 'Ho Chi Minh City, Vietnam'
    const avatar = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'

    return (
        <PortfolioContext.Provider
            value={{
                biography,
                setBiography,
                statement,
                setStatement,
                items,
                setItems,
                cvFileName,
                setCvFileName,
                salesGraphVisible,
                setSalesGraphVisible,
                artistName,
                handle,
                location,
                avatar,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    )
}
