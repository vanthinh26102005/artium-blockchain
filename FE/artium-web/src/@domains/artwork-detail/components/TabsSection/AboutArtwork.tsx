'use client'

type AboutArtworkProps = {
    description?: string
}

export const AboutArtwork = ({ description }: AboutArtworkProps) => {
    return (
        <div className="max-w-3xl">
            <h3 className="mb-4 text-slate-500 uppercase" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}>
                About the Artwork
            </h3>
            {description ? (
                <div className="space-y-4 text-slate-700 whitespace-pre-line" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '100%', fontWeight: 400, letterSpacing: '0%' }}>
                    {description}
                </div>
            ) : (
                <p className="text-slate-500 italic" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '100%', fontWeight: 400, letterSpacing: '0%' }}>
                    No description available for this artwork.
                </p>
            )}
        </div>
    )
}
