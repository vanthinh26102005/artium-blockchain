import { User, Artwork } from '@shared/types'

// === ARTWORK DETAIL ===
export type ArtworkDetailImage = {
    id: string
    url: string
    alt?: string
}

export type ArtworkDetailCreator = User & {
    verified?: boolean
    buyers?: number
    worksSold?: number
    testimonials?: number
}

export type ArtworkDetail = Artwork & {
    year?: number
    medium?: string
    dimensions?: string
    weight?: string
    frame?: string
    isUnique?: boolean
    hasCertificate?: boolean
    description?: string
    images: ArtworkDetailImage[]
    creator: ArtworkDetailCreator
    likedByUser?: boolean
    savedByUser?: boolean
}

// === TAB ===
export type ArtworkDetailTab = 'about-artwork' | 'about-creator'
