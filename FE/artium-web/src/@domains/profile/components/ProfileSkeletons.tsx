import { Skeleton } from '@shared/components/ui/skeleton'
import { cn } from '@shared/lib/utils'

type CountProps = {
  count?: number
}

export const ProfileHeroSkeleton = () => (
  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <Skeleton className="h-40 w-full rounded-none sm:h-52" />
    <div className="px-6 pb-6 sm:px-8">
      <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
        <Skeleton className="h-24 w-24 rounded-full border-4 border-white sm:h-28 sm:w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const ProfileTabsSkeleton = () => (
  <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-10 w-28 shrink-0 rounded-full" />
    ))}
  </div>
)

const SectionHeaderSkeleton = () => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <div className="space-y-2">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-4 w-44" />
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
)

const ArtworkCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'w-[260px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
      className,
    )}
  >
    <Skeleton className="h-[320px] w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-9 w-full rounded-full" />
    </div>
  </div>
)

export const ProfileArtworksSectionSkeleton = ({
  count = 5,
  layout = 'row',
}: CountProps & { layout?: 'row' | 'grid' }) => (
  <section>
    <SectionHeaderSkeleton />
    <div
      className={cn(
        layout === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'flex gap-4 overflow-x-auto pb-2',
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ArtworkCardSkeleton
          key={index}
          className={layout === 'grid' ? 'w-full shrink' : undefined}
        />
      ))}
    </div>
  </section>
)

export const ProfileMomentsSectionSkeleton = ({
  count = 6,
  layout = 'row',
}: CountProps & { layout?: 'row' | 'masonry' }) => (
  <section>
    <SectionHeaderSkeleton />
    <div
      className={cn(
        layout === 'masonry'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'flex gap-4 overflow-x-auto pb-5',
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'overflow-hidden rounded-xl border border-slate-200 bg-white',
            layout === 'row' ? 'max-w-[220px] min-w-[200px] shrink-0' : 'w-full',
          )}
        >
          <Skeleton
            className={cn(
              'w-full rounded-none',
              layout === 'masonry' && index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square',
            )}
          />
          <div className="space-y-3 p-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </section>
)

export const ProfileMoodboardsSectionSkeleton = ({
  count = 4,
  size = 'compact',
}: CountProps & { size?: 'compact' | 'large' }) => (
  <section>
    <SectionHeaderSkeleton />
    <div
      className={cn(
        size === 'large'
          ? 'grid [grid-template-columns:repeat(auto-fit,minmax(200px,220px))] justify-start gap-5'
          : 'flex gap-4 overflow-x-auto pb-2',
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm',
            size === 'large' ? 'w-[220px]' : 'w-[200px] shrink-0',
          )}
        >
          <Skeleton className={cn('w-full rounded-none', size === 'large' ? 'h-48' : 'h-40')} />
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </section>
)

export const ProfileOverviewSkeleton = () => (
  <div className="space-y-8">
    <ProfileArtworksSectionSkeleton />
    <ProfileMomentsSectionSkeleton />
    <ProfileMoodboardsSectionSkeleton />
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <Skeleton className="h-7 w-32" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </section>
  </div>
)
