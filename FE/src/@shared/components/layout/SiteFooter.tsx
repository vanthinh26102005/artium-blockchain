import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

const footerLinks = {
  Company: ['Pricing', 'About us', 'Contact us', 'Editorial'],
  'Join the Community': [
    'Onboarding Guide',
    'For Artists',
    'For Galleries',
    'Why Artium For Artists',
    'Why Artium For Galleries',
  ],
  'Policy & Guidelines': ['FAQs', 'Community Guidelines', 'Terms of Service', 'Privacy Policy'],
}

export const SiteFooter = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 240)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleBackToTop = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      className="relative"
      style={{
        fontFamily: '"ABC Monument Grotesk", "Segoe UI", Tahoma, sans-serif',
      }}
    >
      <svg
        className="absolute top-0 left-0 h-24 w-full sm:h-28"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="black" d="M0,0 C360,80 1080,80 1440,0 L1440,120 L0,120 Z" />
      </svg>

      <div className="mt-24 -translate-y-px bg-black text-white sm:mt-28">
        <div className="relative w-full px-10 pt-1 pb-8 sm:px-16 sm:pt-2 lg:px-24">
          <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="md:col-span-8">
              <div className="grid gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-14">
                <div>
                  <h4 className="mb-5 text-sm font-semibold text-white">Company</h4>
                  <ul className="space-y-3.5 text-[0.8rem] text-white/70">
                    {footerLinks.Company.map((item) => (
                      <li key={item}>
                        <Link href="#" className="transition hover:text-white">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-5 text-sm font-semibold text-white">Join the Community</h4>
                  <ul className="space-y-3.5 text-[0.8rem] text-white/70">
                    {footerLinks['Join the Community'].map((item) => (
                      <li key={item}>
                        <Link href="#" className="transition hover:text-white">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-5 text-sm font-semibold text-white">Policy & Guidelines</h4>
                  <ul className="space-y-3.5 text-[0.8rem] text-white/70">
                    {footerLinks['Policy & Guidelines'].map((item) => (
                      <li key={item}>
                        <Link href="#" className="transition hover:text-white">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-8 md:col-span-4">
              <div>
                <p className="mb-4 text-xs font-semibold tracking-widest text-white/50 uppercase">
                  Stay in touch
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href="#"
                    aria-label="Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                  >
                    <Image
                      src="/images/social/dark-instagram.svg"
                      alt="Instagram"
                      width={18}
                      height={18}
                      className="h-4 w-4"
                    />
                  </Link>
                  <Link
                    href="#"
                    aria-label="X"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                  >
                    <Image
                      src="/images/social/dark-x.svg"
                      alt="X"
                      width={18}
                      height={18}
                      className="h-4 w-4"
                    />
                  </Link>
                  <Link
                    href="#"
                    aria-label="TikTok"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                  >
                    <Image
                      src="/images/social/dark-tiktok.svg"
                      alt="TikTok"
                      width={18}
                      height={18}
                      className="h-4 w-4"
                    />
                  </Link>
                  <Link
                    href="#"
                    aria-label="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                  >
                    <Image
                      src="/images/social/dark-linkedin.svg"
                      alt="LinkedIn"
                      width={18}
                      height={18}
                      className="h-4 w-4"
                    />
                  </Link>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold tracking-widest text-white/50 uppercase">
                  Find us on
                </p>
                <div className="flex flex-wrap gap-3">
                  <Image
                    src="/images/app-store.png"
                    alt="Download on the App Store"
                    width={160}
                    height={52}
                    className="h-11 w-auto"
                  />
                  <Image
                    src="/images/google-play-store.png"
                    alt="Get it on Google Play"
                    width={170}
                    height={52}
                    className="h-11 w-auto"
                  />
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold tracking-widest text-white/50 uppercase">
                  Subscribe to our newsletter
                </p>
                <div className="flex flex-col gap-3.5">
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full border-0 border-b border-white/20 bg-transparent py-2.5 text-sm text-white/80 outline-none placeholder:text-white/30 focus:border-white/40"
                  />
                  <input
                    type="email"
                    placeholder="Email address *"
                    className="w-full border-0 border-b border-white/20 bg-transparent py-2.5 text-sm text-white/80 outline-none placeholder:text-white/30 focus:border-white/40"
                  />
                  <button
                    type="button"
                    className="mt-1 w-fit rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-7">
            <p className="text-xs text-white/50">&copy; 2026 Artium. All rights reserved.</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Back to top"
        onClick={handleBackToTop}
        className={`fixed right-6 bottom-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition ${
          showBackToTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </footer>
  )
}
