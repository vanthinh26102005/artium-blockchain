import React from 'react'
import { ArtistCard } from './TestimonialCards'

export const ARTIST_DATA: ArtistCard[] = [
  {
    type: 'quote',
    name: 'Archana Karunakaran',
    location: 'Chennai, India',
    quote: (
      <>
        &ldquo;As an international artist showcasing at Superfine Art Fair,{' '}
        <span className="font-bold">Artium made a fantastic sales partner.</span> Handled
        transactions seamlessly, saving me the hassle of POS machines and transfers. They were also
        super prompt and efficient with payouts&mdash;absolutely trustworthy!&rdquo;
      </>
    ),
    avatarSrc: '/images/homepage-v2/list-artists/Archana.png',
    backgroundColor: '#F5FF6B',
  },
  {
    type: 'video',
    name: 'Susan Washington',
    location: 'Baltimore',
    videoSrc: '/videos/homepage/v2/list-artists/video.mp4',
    backgroundColor: '#0F6BFF',
  },
  {
    type: 'quote',
    name: 'Vincenzo Cohen',
    location: 'Rome, Italy',
    quote: (
      <>
        &ldquo;<span className="font-bold">Working with the Artium team was wonderful.</span> They
        were very helpful to each of my needs, cleared up all my doubts, and were a great support
        during the fair, especially when I had problems during the sales process. I felt a great
        human connection and support!&rdquo;
      </>
    ),
    avatarSrc: '/images/homepage-v2/list-artists/Vincenso.png',
    backgroundColor: '#FFD0D2',
  },
  {
    type: 'video',
    name: 'Tommy Lei',
    location: 'Los Angeles',
    videoSrc: '/videos/homepage/v2/list-artists/video-1.mp4',
    backgroundColor: '#FD6821',
  },
]
