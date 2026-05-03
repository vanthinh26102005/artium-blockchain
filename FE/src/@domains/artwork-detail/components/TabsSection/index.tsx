'use client'

import { useState } from 'react'
import { cn } from '@shared/lib/utils'
import { ArtworkDetail, ArtworkDetailTab } from '../../types'
import { AboutArtwork } from './AboutArtwork'
import { AboutCreator } from './AboutCreator'

type TabsSectionProps = {
  artwork: ArtworkDetail
}

/**
 * TabsSection - React component
 * @returns React element
 */
export const TabsSection = ({ artwork }: TabsSectionProps) => {
  const [activeTab, setActiveTab] = useState<ArtworkDetailTab>('about-artwork')

  const tabs = [
    { key: 'about-artwork' as const, label: 'About the Artwork' },
    { key: 'about-creator' as const, label: 'About the Creator' },
    /**
     * tabs - Utility function
     * @returns void
     */
  ]

  return (
    <section className="mb-12">
      {/* Tabs Header */}
      <div className="flex items-center justify-center border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative cursor-pointer px-6 py-4 transition-colors',
              activeTab === tab.key ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
            )}
            style={{
              fontFamily: 'Inter',
              fontSize: '16px',
              lineHeight: '24px',
              fontWeight: 500,
              letterSpacing: '0%',
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="pt-6">
        {activeTab === 'about-artwork' && <AboutArtwork description={artwork.description} />}
        {activeTab === 'about-creator' && <AboutCreator creator={artwork.creator} />}
      </div>
    </section>
  )
}

export { AboutArtwork, AboutCreator }
