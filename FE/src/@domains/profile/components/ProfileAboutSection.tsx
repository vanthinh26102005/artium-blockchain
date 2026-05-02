// next
import Link from 'next/link'

// third-party
import { Globe, Instagram, Pencil, Twitter } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileAbout } from '@domains/profile/types'

type ProfileAboutSectionProps = {
  about: ProfileAbout
  editHref: string
  className?: string
}

const buildHref = (value: string, prefix: string) => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${prefix}${value}`
}

const splitEntries = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const uniqueTags = (tags: string[]) => Array.from(new Set(tags.filter(Boolean)))

export const ProfileAboutSection = ({ about, editHref, className }: ProfileAboutSectionProps) => {
  const identityTags = uniqueTags([...about.profileCategories, ...about.roles])
  const aboutWorkTags = uniqueTags([
    ...about.artisticVibes,
    ...about.artisticValues,
    ...about.artisticMediums,
  ])
  const interestedTags = uniqueTags([
    ...about.inspireVibes,
    ...about.inspireValues,
    ...about.inspireMediums,
  ])
  const affiliations = splitEntries(about.connectionAffiliations)
  const seenAt = splitEntries(about.connectionSeenAt)

  const socialLinks = [
    {
      label: 'Website',
      value: about.websiteUrl,
      href: buildHref(about.websiteUrl, 'https://'),
      Icon: Globe,
    },
    {
      label: 'Instagram',
      value: about.instagram,
      href: buildHref(about.instagram, 'https://'),
      Icon: Instagram,
    },
    {
      label: 'X',
      value: about.twitter,
      href: buildHref(about.twitter, 'https://'),
      Icon: Twitter,
    },
  ].filter((item) => item.value)

  return (
    <section className={cn(className)}>
      <div className="flex items-center gap-3">
        <h3 className="text-kokushoku-black text-[20px] leading-[1.2] font-semibold lg:text-[28px]">
          About Me
        </h3>
        <Link
          href={editHref}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
          aria-label="Edit About Me"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div>
            <p className="text-[18px] leading-none font-semibold text-black uppercase">Bio</p>
            <p className="text-sx mt-3 leading-6 text-slate-700">{about.biography}</p>
          </div>

          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          ) : null}

          {identityTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {identityTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold tracking-wide text-slate-700 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div>
            <p className="text-[18px] leading-none font-semibold text-black uppercase">
              About My Work
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {aboutWorkTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold tracking-wide text-slate-700 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[18px] leading-none font-semibold text-black uppercase">
              Interested In
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {interestedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold tracking-wide text-slate-700 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-[18px] leading-none font-semibold text-black uppercase">
              Affiliations
            </p>
            <p className="mt-3 text-sm text-slate-700">
              {affiliations.length > 0 ? affiliations.join(' / ') : '-'}
            </p>
          </div>

          <div className="border-b border-slate-200 pb-6">
            <p className="text-[18px] leading-none font-semibold text-black uppercase">
              You Might Have Seen Me At
            </p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              {seenAt.length > 0 ? seenAt.map((item) => <p key={item}>{item}</p>) : '-'}
            </div>
          </div>

          <div className="border-b border-slate-200 pb-6">
            <p className="text-[18px] leading-none font-semibold text-black uppercase">Currently</p>
            <p className="mt-3 text-sm text-slate-700">{about.connectionCurrently || '-'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
