// react
import { useCallback, useEffect, useMemo, useState } from 'react'

// next
import { useRouter } from 'next/router'

// icons
import { Search, X } from 'lucide-react'

// @shared - components
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'

// @shared - apis
import artworkApis from '@shared/apis/artworkApis'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export type QuickSellArtworkOption = {
    id: string
    name: string
    imageUrl?: string
    artistName?: string
    year?: string
    dimensions?: string
    materials?: string
    price: number
}

type QuickSellArtworkPickerModalProps = {
    isOpen: boolean
    onClose: () => void
    onSelect: (artwork: QuickSellArtworkOption) => void
}

export const QuickSellArtworkPickerModal = ({
    isOpen,
    onClose,
    onSelect,
}: QuickSellArtworkPickerModalProps) => {
    // -- router --
    const router = useRouter()

    // -- state --
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
    const [artworks, setArtworks] = useState<QuickSellArtworkOption[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const user = useAuthStore((state) => state.user)

    // -- effects --
    useEffect(() => {
        if (!isOpen) return
        if (!user?.id) {
            setArtworks([])
            setError('Please log in to load your artworks.')
            return
        }

        let isMounted = true
        setIsLoading(true)
        setError(null)

        const loadArtworks = async () => {
            try {
                const response = await artworkApis.listArtworks({
                    sellerId: user.id,
                    q: searchQuery.trim() || undefined,
                })

                if (!isMounted) return

                const mapped = response.map((artwork) => {
                    const rawPrice = typeof artwork.price === 'string'
                        ? parseFloat(artwork.price)
                        : artwork.price
                    const price = typeof rawPrice === 'number' && !Number.isNaN(rawPrice)
                        ? rawPrice
                        : 0

                    return {
                        id: artwork.id,
                        name: artwork.title,
                        artistName: artwork.creatorName || undefined,
                        price,
                        imageUrl:
                            artwork.thumbnailUrl ||
                            artwork.images?.[0]?.secureUrl ||
                            artwork.images?.[0]?.url,
                    }
                })

                setArtworks(mapped)
            } catch (err) {
                if (!isMounted) return
                setArtworks([])
                setError(err instanceof Error ? err.message : 'Failed to load artworks.')
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadArtworks()

        return () => {
            isMounted = false
        }
    }, [isOpen, user?.id, searchQuery])

    // -- derived --
    const filteredArtworks = useMemo(() => {
        if (!searchQuery.trim()) return artworks
        const query = searchQuery.toLowerCase()
        return artworks.filter((artwork) =>
            artwork.name.toLowerCase().includes(query)
        )
    }, [searchQuery, artworks])

    const selectedArtwork = useMemo(() => {
        return artworks.find((a) => a.id === selectedArtworkId) || null
    }, [selectedArtworkId, artworks])

    // -- handlers --
    const resetPicker = useCallback(() => {
        setSelectedArtworkId(null)
        setSearchQuery('')
    }, [])

    const handleDone = useCallback(() => {
        if (selectedArtwork) {
            onSelect(selectedArtwork)
            onClose()
            resetPicker()
        }
    }, [selectedArtwork, onSelect, onClose, resetPicker])

    const handleBack = useCallback(() => {
        onClose()
        resetPicker()
    }, [onClose, resetPicker])

    const handleUploadArtwork = useCallback(() => {
        onClose()
        resetPicker()
        void router.push('/artworks/upload')
    }, [onClose, resetPicker, router])

    // -- render --
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] max-w-[900px] min-w-[600px] p-0 gap-0 overflow-hidden bg-white rounded-2xl">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-4">
                    <h2 className="text-center text-[22px] font-bold text-[#191414]">
                        Select Artwork
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 text-[#989898] hover:text-[#191414] transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <p className="mt-3 text-center text-[13px] text-[#595959]">
                        Choose the artwork available from your inventory below.<br />
                        You can only select single quantity artworks that are listed as For Sale or Inquire to Purchase.
                    </p>
                </div>

                {/* Search */}
                <div className="px-8 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#989898]" />
                        <Input
                            type="text"
                            placeholder="Search by artwork title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 pl-12 pr-4 rounded-full border-[#E5E5E5] bg-white text-[14px] placeholder:text-[#989898] focus:border-[#191414] focus:ring-0"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="px-6 max-h-[400px] overflow-auto">
                    <table className="w-full border-collapse">
                        {/* Table Header */}
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#F5F5F5]">
                                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#989898] rounded-tl-lg" style={{ width: '40%' }}>
                                    Artwork title
                                </th>
                                <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-[#989898]" style={{ width: '12%' }}>
                                    Year
                                </th>
                                <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-[#989898]" style={{ width: '15%' }}>
                                    Materials
                                </th>
                                <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-[#989898]" style={{ width: '25%' }}>
                                    Dimensions
                                </th>
                                <th className="px-3 py-3 rounded-tr-lg" style={{ width: '8%' }}></th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#595959]">
                                        Loading artworks...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredArtworks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#595959]">
                                        No artworks found.
                                    </td>
                                </tr>
                            ) : filteredArtworks.map((artwork) => (
                                <tr
                                    key={artwork.id}
                                    onClick={() => setSelectedArtworkId(artwork.id)}
                                    className={`cursor-pointer hover:bg-[#FAFAFA] transition ${selectedArtworkId === artwork.id ? 'bg-blue-50' : ''}`}
                                >
                                    {/* Artwork Title with Image */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                                                <img
                                                    src={artwork.imageUrl || '/images/placeholder-artwork.jpg'}
                                                    alt={artwork.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.style.display = 'none'
                                                        target.parentElement!.innerHTML = '<span class="text-[8px] text-[#989898]">🖼</span>'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[13px] font-medium text-[#191414] truncate max-w-[180px]">
                                                {artwork.name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Year */}
                                    <td className="px-3 py-3 text-center text-[13px] text-[#595959]">
                                        {artwork.year || '-'}
                                    </td>

                                    {/* Materials */}
                                    <td className="px-3 py-3 text-center text-[13px] text-[#595959]">
                                        {artwork.materials || '-'}
                                    </td>

                                    {/* Dimensions */}
                                    <td className="px-3 py-3 text-center text-[13px] text-[#595959] whitespace-nowrap">
                                        {artwork.dimensions || '-'} <span className="ml-1 text-[#989898]">ⓘ</span>
                                    </td>

                                    {/* Radio Button */}
                                    <td className="px-3 py-3 text-center">
                                        <input
                                            type="radio"
                                            name="artwork"
                                            checked={selectedArtworkId === artwork.id}
                                            onChange={() => setSelectedArtworkId(artwork.id)}
                                            className="h-5 w-5 border-2 border-[#E5E5E5] text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-[#E5E5E5]">
                    <p className="mb-5 text-center text-[13px] text-[#595959]">
                        Can&apos;t find the artwork you are looking for?{' '}
                        <button
                            type="button"
                            onClick={handleUploadArtwork}
                            className="text-blue-600 underline hover:text-blue-700"
                        >
                            Upload a new artwork
                        </button>
                        .
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="h-12 min-w-[140px] rounded-full border-[#E5E5E5] px-8 text-[14px] font-semibold text-[#191414] hover:bg-[#F5F5F5]"
                        >
                            Back
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDone}
                            disabled={!selectedArtworkId}
                            className="h-12 min-w-[140px] rounded-full bg-blue-400 px-8 text-[14px] font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
