'use client'

type AboutArtworkProps = {
  description?: string
}

/**
 * AboutArtwork - React component
 * @returns React element
 */
export const AboutArtwork = ({ description }: AboutArtworkProps) => {
  return (
    <div className="max-w-3xl">
      <h3
        className="mb-4 uppercase text-slate-500"
        style={{
          fontFamily: 'Inter',
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 500,
          letterSpacing: '0%',
        }}
      >
        About the Artwork
      </h3>
      {description ? (
        <div
          className="space-y-4 whitespace-pre-line text-slate-700"
          style={{
            fontFamily: 'Inter',
            fontSize: '16px',
            lineHeight: '100%',
            fontWeight: 400,
            letterSpacing: '0%',
          }}
        >
          {description}
        </div>
      ) : (
        <p
          className="italic text-slate-500"
          style={{
            fontFamily: 'Inter',
            fontSize: '16px',
            lineHeight: '100%',
            fontWeight: 400,
            letterSpacing: '0%',
          }}
        >
          No description available for this artwork.
        </p>
      )}
    </div>
  )
}
