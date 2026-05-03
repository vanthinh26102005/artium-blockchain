// next
import { useRouter } from 'next/router'

// @domains - discover
import { type DiscoverInspireItem } from '@domains/discover/mock/mockInspire'

type InspireCardProps = {
  item: DiscoverInspireItem
}

/**
 * InspireCard - React component
 * @returns React element
 */
export const InspireCard = ({ item }: InspireCardProps) => {
  // -- state --
  const router = useRouter()

  // -- derived --
  /**
   * router - Utility function
   * @returns void
   */
  const isImageLayout = item.layoutVariant === 'image'

  // -- handlers --
  const handleClick = () => {
    router.push(`/editorial/${item.id}`)
  }
  /**
   * isImageLayout - Utility function
   * @returns void
   */

  // -- render --
  return (
    <article
      onClick={handleClick}
      className={`cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)] ${
        isImageLayout ? 'overflow-hidden' : 'p-6'
        /**
         * handleClick - Utility function
         * @returns void
         */
      }`}
    >
      {isImageLayout ? (
        <>
          {/* image layout */}
          <div>
            {/* media */}
            {item.imageUrl ? (
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ) : (
              <div className="bg-linear-to-br aspect-4/3 w-full from-slate-100 via-slate-200 to-slate-100" />
            )}

            {/* content */}
            <div className="space-y-2 px-4 pb-5 pt-4">
              {/* meta */}
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {item.categoryLabel}
              </div>
              {/* title */}
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              {/* author & date with avatar */}
              <div className="flex items-center gap-3 pt-2">
                {item.avatarUrl && (
                  <img
                    src={item.avatarUrl}
                    alt={item.subtitle}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.subtitle}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* text layout */}
          <div className="flex h-full flex-col justify-between space-y-4">
            {/* content */}
            <div className="space-y-3">
              {/* meta */}
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {item.categoryLabel}
              </div>
              {/* title */}
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              {/* author & date with avatar */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                {item.avatarUrl && (
                  <img
                    src={item.avatarUrl}
                    alt={item.subtitle}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.subtitle}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </article>
  )
}
