import { useRouter } from 'next/router'
import { templates } from '@domains/custom-website/data'
import Head from 'next/head'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * TemplatePreview - React component
 * @returns React element
 */
const TemplatePreview: NextPageWithLayout = () => {
  const router = useRouter()
  const { id } = router.query

  /**
   * router - Utility function
   * @returns void
   */
  const template = templates.find((t) => t.id === id)

  if (!router.isReady) return <div className="p-8">Loading...</div>

  if (!template) {
    return (
      /**
       * template - Utility function
       * @returns void
       */
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Template Not Found</h1>
          <p className="mt-2 text-slate-500">The template "{id}" does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <Head>
        <title>Preview: {template.name} - Artium</title>
      </Head>

      {/* Simulated Template Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="text-xl font-bold tracking-tight">{template.name} Concept</div>
        <nav className="hidden space-x-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#" className="transition-colors hover:text-black">
            Works
          </a>
          <a href="#" className="transition-colors hover:text-black">
            Exhibitions
          </a>
          <a href="#" className="transition-colors hover:text-black">
            About
          </a>
          <a href="#" className="transition-colors hover:text-black">
            Contact
          </a>
        </nav>
        <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
          Inquire
        </button>
      </header>

      {/* Simulated Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:py-20">
        <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tighter md:text-7xl">
              {template.name}
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-slate-600 md:text-2xl">
              {template.description}
            </p>
            <div className="flex gap-4">
              <button className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white">
                View Collection
              </button>
              <button className="rounded-lg border border-slate-200 px-6 py-3 font-medium text-slate-900 hover:bg-slate-50">
                Read Biography
              </button>
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={template.previewImage}
              alt={template.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <section className="mb-24">
          <h2 className="mb-12 text-center text-3xl font-bold">Featured Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="mb-4 aspect-3/4 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={`https://source.unsplash.com/random/400x600?art,abstract&sig=${i}`}
                    alt={`Artwork ${i}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x600?text=Artwork'
                    }}
                  />
                </div>
                <h3 className="text-lg font-semibold">Untitled Artwork #{i}</h3>
                <p className="text-slate-500">$1,200</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Demo Notice Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-600 py-3 text-center text-sm font-medium text-white">
        You are viewing a live demo of the {template.name} template.
      </div>
    </div>
  )
}

TemplatePreview.getLayout = (page) => page

export default TemplatePreview
