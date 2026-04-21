'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Users, Tag, MessageSquare } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { ArtworkDetailCreator } from '../../types'

type AboutCreatorProps = {
    creator: ArtworkDetailCreator
}

export const AboutCreator = ({ creator }: AboutCreatorProps) => {
    const profileHref = creator.slug ? `/profile/${creator.slug}` : '#'

    const handleFollow = () => {
        // TODO: Implement follow functionality
        console.log('Follow clicked')
    }

    return (
        <div className="flex items-start gap-4">
            {/* Avatar */}
            <Link
                href={profileHref}
                className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full"
            >
                <Image
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    fill
                    sizes="48px"
                    className="object-cover"
                />
            </Link>

            {/* Creator Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Link
                        href={profileHref}
                        className="flex cursor-pointer items-center gap-1 text-slate-900 hover:underline"
                        style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}
                    >
                        {creator.displayName}
                        {creator.verified && (
                            <BadgeCheck className="h-5 w-5 text-amber-500" />
                        )}
                    </Link>
                    <Button
                        variant="default"
                        size="sm"
                        className="ml-2 rounded-full border border-black bg-[#060f2a] px-5 py-1.5 text-white transition hover:bg-[#050b1f] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#060f2a]"
                        onClick={handleFollow}
                    >
                        Follow
                    </Button>
                </div>

                {/* Stats */}
                <div className="mt-2 flex items-center gap-4 text-slate-500" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}>
                    {creator.buyers !== undefined && (
                        <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {creator.buyers} buyers
                        </span>
                    )}
                    {creator.worksSold !== undefined && (
                        <span className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            {creator.worksSold} works sold
                        </span>
                    )}
                    {creator.testimonials !== undefined && (
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {creator.testimonials} testimonials
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
