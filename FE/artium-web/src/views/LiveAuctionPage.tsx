import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { ChevronDown, Grid2X2, LayoutList, ShieldCheck } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Metadata } from '@/components/SEO/Metadata'

type AuctionLot = {
  title: string
  bid: string
  status: string
  statusTone: 'live' | 'muted'
  imageSrc: string
  imageAlt: string
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: '"ABC Monument Grotesk", "Segoe UI", Tahoma, sans-serif',
} satisfies CSSProperties

const bodyFont = {
  fontFamily: 'Inter, "Segoe UI", Tahoma, sans-serif',
} satisfies CSSProperties

const filterGroups = [
  { label: 'Category', value: 'All Works' },
  { label: 'Status', value: 'Active Bidding' },
  { label: 'Price Range', value: '0.5 ETH - 50+ ETH' },
] as const

const lots: AuctionLot[] = [
  { title: 'Oblique Horizon I', bid: '12.40 ETH', status: '2h 45m remaining', statusTone: 'live', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4LUsBjOdeImAsFI1KCdzWOWCNiN9RdiTO9kZNn5WRRx7NbOcMR-sm6Z4L3hvLyoQLu_Zg-dz_fki4K4v0WJ49IZyfKB0YIWMYRqYgJAhIkr71fi38x5r5fcjyPVikYRMhovtEMNmoKmGL0JqgcVJD7fNTeXE7uZm1l2iyZA_IOFWYGQxUaUkTOeazmgoTVyp1acthU5gs6LJqblekH4hHLj82qCUz6LD5IH6kCjvlNdy--ssZ67Tv47EB-0ijv8EYXaArzUx3ya95', imageAlt: 'Abstract architectural rendering with flowing monochromatic white curves and deep dramatic shadows in a minimalist digital space' },
  { title: 'Monolith Study', bid: '8.15 ETH', status: 'Ending Soon', statusTone: 'live', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeXixWF66Us8MGeMQeRT9iEL3O015Au3KTSxVxv_z_SNHcl1yyQOCxTq5cCnbNPtN354N7lCSBDZJezyZrtJnr0jqED2a5BzC-edgEpCiOE1aXTIQsTnTz5k6zi-ad7q055W0BmXx5GjEoO-he7LJBF58NzUQDR41KUVeIObhUpKN6SV3BVVVKwuyCe2sRHS3275U4PxHDEQd1hnmlZ4A6VVBMHGL5qcNqrGYKVAygRhLbet_1tD4uUeytP35B02fS8A_hYdtsD_ol', imageAlt: 'Brutalist concrete sculpture floating in a void with sharp geometric angles and soft ambient lighting from top' },
  { title: 'Virtual Synthesis', bid: '45.00 ETH', status: '12h 10m remaining', statusTone: 'muted', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc9nIm6vN3Dfikh8FWImfOaOI2qoahNXwv_yBbU5_NlM0qjl-hSJKSTsUtVFarOlG7_AAjq5dGz2LMDuPSLnUNxOT0P61EqRyq__AoUA_Lr8-HOCTcktHDXq_TGCtODh68yUnLAECwKULlrDnZqgHMLy-en3DEI3nl-oi_Kaj3555r9tiizj0NMqpQ0dg__X3OBsMcZULbb-CyGjUSQPUAKHP4rWR5Fqrv5dAGlup7iHxNFaDhAZeIgeA6IQCkj9waonEChbWc5jUo', imageAlt: 'Digital landscape featuring iridescent crystalline structures in a dark misty environment with neon accents' },
  { title: 'Prism Lattice', bid: '2.30 ETH', status: '1d 04h remaining', statusTone: 'muted', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB2jDG1D1O4mYjmjtusMkXpJm9rQlQM3Sm6QeaIiYouNnqdVcp4lYf5EmHfY7ItpAJJ9TwyDEotVxPYH-Fo5HrGBLFe_xsztfR2TwE8PjFd4Sa1kWyT3cmidc2q9ETD0IuCRXj0g9TDPG7UuMAeryhPfY76jQfjJ6bXKwviXnnjVhBiVoglepYCR5HptyLutQibzNcjf-ehx8Zj0CRp1Ee0K2bg_e4qbGC3QtVwUy3k6vIoc5oWgp3uRFhEFX9isc1pRvrqlA9PYAq', imageAlt: 'Ethereal glass sculpture in a dark room with light refracting through it creating colorful caustic patterns on the ground' },
  { title: 'Void Ascension', bid: '19.20 ETH', status: 'Ending Soon', statusTone: 'live', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSl9w8w8gEjK9hRcXgi0S1hgC6JRckMCA1PqXCxFkF0_BTDFB345F4TNLGd8kfnotAVvBXk2VL3LeYdi62qWrprS9PLJdBbvxjONo4NLqQhAPik8WcCtd11W-FhnnFtjHlPhbBN0xPmcDBYXs-4yFP5avluQg5eu0E5DCLiKAbq4D8_WHL-h67oVbAI18pIpMH_zoDFDbv05GEJXgplvqbIJWXz6LMPokqHPljTJPXhSskKZvF70ZNPWkZzFmzGUurRim2fDksHhI4', imageAlt: 'Architectural detail of a minimalist staircase with sharp black and white contrast and dramatic long shadows' },
  { title: 'Static Equilibrium', bid: '5.50 ETH', status: '3d 12h remaining', statusTone: 'muted', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGhTZmgIha98yjZvCUb07F428ovbUplYWpAo9wx7CWVm2LeVGZp2Wgeb7l4aQPCEClfuawWUgJkSlqBYD0wMShZkq4AO3-zyZRkWTHwZSjZqpH_2vxLN0TRY4GEaCyVqv-nqWq4Bs04P-CdlezTAST5aftAXWERdc0KtzUNeZkUmkRRP7NarB9sHUPGtq_INXlnANVly4N9Nw9qZSiFdPWU6sJ2VMTu4y-wea3lSDZtVPjMXy3Mz7ga1nfcwk_6LGVN4Ftz26_ATZD', imageAlt: 'A singular black smooth stone balancing perfectly on top of a jagged white marble piece in a white studio setting' },
  { title: 'Aeolian Drift', bid: '14.75 ETH', status: '5d 1h remaining', statusTone: 'muted', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI883ZEyJpZhSo1T2TcfdHEyH5T66ULRiLGzfbTDkHLdWHQuNAKXVrOVFIeMOltaWtAaAg0b0ufm5Nfc8jgfTTAJgU2VIfSkxLLh6Oo-aul9XUH7j5njUa1ucu_pD3azBltgOgZjY8b6h5qSKPRi1neqom2hiQKWU4xrYUN4E_HiQpe4dqhxgXNnN_G-buWe06qjEb1Wo5yklUj3m_Za9_Ua7sDzYln9F-T9bCb_Ed0LHkyHfbmYUJGcjCPOehbJRlLJIard2bo0gN', imageAlt: 'Large scale installation with white fabric sheets floating in a dark industrial space caught in motion' },
  { title: 'Order Fragment', bid: '2.10 ETH', status: '15m remaining', statusTone: 'live', imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_MWjOy-6Bl-PbpoLht4XyW4NgdEYQocuUbIFnKgN6XrNDFk2PdnobFU4UXtXle3wfd5mrGpfecvlIQwGGyLDvwL06kJvBFXUMtBUdVYMS00PhRJDgczzJB2j-tFfGyc-QT56jW1ol5pJIaTnTRXNC8092WHetRhivlcYEv1davJgkcTBVzRTM1kvuAI9eLqoLXC2NKaC9Hc2Yb4TbPXFDEozApR8h2JWLyr746uHZ49zZw7DuZN3kvyc7bo58M6vjmMkbRzcU2zku', imageAlt: 'Detail of a modern museum facade with repeating white panels and deep shadow lines under a clear sky' },
]

const statusToneClass = { live: 'bg-[#ba1a1a]', muted: 'bg-[#747777]' } as const

const LiveAuctionPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <>
      <Metadata
        title="Live Auctions | Artium"
        description="A curated auction showcase for architectural masterworks and digital artifacts on Artium."
      />
      <div className="min-h-screen bg-white text-[#1a1c1c]" style={bodyFont}>
        <main className="mx-auto max-w-[1600px] px-6 pt-32 pb-20 md:px-12">
          <header className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1
                className={`${spaceGrotesk.className} mb-6 text-5xl leading-none font-bold tracking-[0.04em] text-black uppercase md:text-7xl`}
              >
                Live Auctions
              </h1>
              <p className="text-lg leading-8 font-light text-[#444747]">
                A curated selection of architectural masterworks and digital artifacts. Each piece
                is verified via blockchain provenance, ensuring institutional-grade collectible
                security.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] tracking-[0.22em] text-black/40 uppercase">
              <span className="h-2 w-2 animate-pulse bg-black" />
              <span>Live updating from on-chain data</span>
            </div>
          </header>

          <section className="mb-12 flex flex-wrap items-center justify-between gap-8 border-y border-[#c4c7c7]/30 py-8">
            <div className="flex flex-wrap items-center gap-10">
              {filterGroups.map((group) => (
                <button key={group.label} type="button" className="group text-left">
                  <span className="mb-2 block text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                    {group.label}
                  </span>
                  <span
                    className="flex items-center gap-2 text-sm font-medium text-black transition-colors group-hover:text-black/70"
                    style={headlineFont}
                  >
                    {group.value}
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex border border-[#c4c7c7]/30 bg-[#f7f7f7] p-1">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                  }`}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'list' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                className="border border-black px-6 py-2 text-xs tracking-[0.22em] text-black uppercase transition hover:bg-black hover:text-white"
                style={headlineFont}
              >
                Filter Results
              </button>
            </div>
          </section>

          <section
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid grid-cols-1 gap-6'
            }
          >
            {lots.map((lot) => (
              <article
                key={lot.title}
                className={`group border border-[#e5e7eb] bg-white p-4 transition-all duration-300 hover:border-black hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] ${
                  viewMode === 'list' ? 'md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-6' : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-[#f7f7f7] ${
                    viewMode === 'grid' ? 'mb-6 aspect-[3/4]' : 'mb-5 aspect-[4/3] md:mb-0 md:h-full'
                  }`}
                >
                  <Image
                    src={lot.imageSrc}
                    alt={lot.imageAlt}
                    fill
                    sizes={
                      viewMode === 'grid'
                        ? '(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 768px) 44vw, 92vw'
                        : '(min-width: 768px) 280px, 92vw'
                    }
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 border border-[#c4c7c7]/30 bg-white/90 px-3 py-1 backdrop-blur-md">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusToneClass[lot.statusTone]} ${
                        lot.statusTone === 'live' ? 'animate-pulse' : ''
                      }`}
                    />
                    <span className="text-[10px] tracking-[0.08em] text-black uppercase">
                      {lot.status}
                    </span>
                  </div>
                </div>
                <div
                  className={`space-y-4 ${
                    viewMode === 'list' ? 'flex flex-col justify-between md:py-2' : ''
                  }`}
                >
                  <div
                    className={`flex items-start justify-between gap-3 ${
                      viewMode === 'list' ? 'border-b border-[#c4c7c7]/30 pb-4' : ''
                    }`}
                  >
                    <div>
                      <h2
                        className={`font-bold uppercase text-black ${
                          viewMode === 'grid'
                            ? 'text-lg tracking-[-0.04em]'
                            : 'text-2xl tracking-[0.02em] md:text-3xl'
                        }`}
                        style={headlineFont}
                      >
                        {lot.title}
                      </h2>
                      {viewMode === 'list' ? (
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#747777]">
                          Verified collectible with on-chain provenance, active bidding, and a
                          curator-selected presentation format designed for quick comparison.
                        </p>
                      ) : null}
                    </div>
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#747777] transition-colors group-hover:text-black" />
                  </div>
                  <div
                    className={`flex gap-4 border-[#c4c7c7]/30 ${
                      viewMode === 'grid'
                        ? 'items-end justify-between border-t pt-4'
                        : 'flex-col pt-2 sm:flex-row sm:items-end sm:justify-between'
                    }`}
                  >
                    <div>
                      <p className="mb-1 text-[10px] tracking-[0.25em] text-[#747777] uppercase">
                        Current Bid
                      </p>
                      <p
                        className={`font-bold text-black uppercase ${
                          viewMode === 'grid' ? 'text-lg' : 'text-2xl md:text-3xl'
                        }`}
                        style={headlineFont}
                      >
                        {lot.bid}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-black px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-neutral-800"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-24 flex flex-col items-center gap-8">
            <button
              type="button"
              className="group flex items-center gap-6 text-sm tracking-[0.3em] text-black uppercase transition-all"
              style={headlineFont}
            >
              <span className="h-px w-12 bg-black transition-all group-hover:w-24" />
              <span>Load More Archives</span>
              <span className="h-px w-12 bg-black transition-all group-hover:w-24" />
            </button>
            <p className="text-[10px] tracking-[0.25em] text-[#747777] uppercase">
              Displaying 8 of 142 Active Auctions
            </p>
          </section>
        </main>

        <footer className="border-t border-[#c4c7c7]/30 bg-white px-6 py-10 md:px-12">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="text-lg font-bold text-black uppercase" style={headlineFont}>
              Artium
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['Privacy', 'Terms', 'Provenance', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs tracking-[0.22em] text-[#747777] uppercase transition-colors hover:text-black"
                >
                  {item}
                </Link>
              ))}
            </div>
            <p className="text-center text-[10px] tracking-[0.22em] text-[#747777] uppercase">
              © 2026 Artium. Architectural curation on-chain.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

export { LiveAuctionPage }

export default LiveAuctionPage
