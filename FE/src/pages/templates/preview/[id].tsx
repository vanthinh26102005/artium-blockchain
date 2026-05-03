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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Template Not Found</h1>
                    <p className="text-slate-500 mt-2">The template "{id}" does not exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Head>
                <title>Preview: {template.name} - Artium</title>
            </Head>

            {/* Simulated Template Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl tracking-tight">{template.name} Concept</div>
                <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">
                    <a href="#" className="hover:text-black transition-colors">Works</a>
                    <a href="#" className="hover:text-black transition-colors">Exhibitions</a>
                    <a href="#" className="hover:text-black transition-colors">About</a>
                    <a href="#" className="hover:text-black transition-colors">Contact</a>
                </nav>
                <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                    Inquire
                </button>
            </header>

            {/* Simulated Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter leading-tight">
                            {template.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
                            {template.description}
                        </p>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium">
                                View Collection
                            </button>
                            <button className="px-6 py-3 border border-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-50">
                                Read Biography
                            </button>
                        </div>
                    </div>
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                            src={template.previewImage}
                            alt={template.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>

                <section className="mb-24">
                    <h2 className="text-3xl font-bold mb-12 text-center">Featured Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-3/4 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                                    <img
                                        src={`https://source.unsplash.com/random/400x600?art,abstract&sig=${i}`}
                                        alt={`Artwork ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://placehold.co/400x600?text=Artwork'
                                        }}
                                    />
                                </div>
                                <h3 className="font-semibold text-lg">Untitled Artwork #{i}</h3>
                                <p className="text-slate-500">$1,200</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Demo Notice Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-3 text-sm font-medium z-50">
                You are viewing a live demo of the {template.name} template.
            </div>
        </div>
    )
}

TemplatePreview.getLayout = (page) => page

export default TemplatePreview
