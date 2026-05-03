import { Skeleton } from '@shared/components/ui/skeleton'

/**
 * TopPickSkeleton - React component
 * @returns React element
 */
export const TopPickSkeleton = () => (
    <div className="mb-4 break-inside-avoid">
        <Skeleton className="h-60 w-full rounded-2xl" />
        <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
)

export const ArtworkSkeleton = () => (
    <div className="mb-4 break-inside-avoid rounded-2xl border border-slate-100 p-3">
        <Skeleton className="h-64 w-full rounded-xl" />
/**
 * ArtworkSkeleton - React component
 * @returns React element
 */
        <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    </div>
)

export const ProfileSkeleton = () => (
    <div className="relative flex flex-col items-center rounded-2xl border border-slate-200 p-6 pt-16">
        <div className="absolute left-0 top-0 h-24 w-full rounded-t-2xl bg-slate-50" />
        <Skeleton className="z-10 h-20 w-20 rounded-full border-4 border-white" />
        <div className="mt-3 w-full space-y-2 text-center">
            <Skeleton className="mx-auto h-5 w-3/4" />
/**
 * ProfileSkeleton - React component
 * @returns React element
 */
            <Skeleton className="mx-auto h-4 w-1/2" />
        </div>
        <div className="mt-4 w-full">
            <Skeleton className="h-10 w-full rounded-full" />
        </div>
    </div>
)

export const MomentSkeleton = () => (
    <div className="relative aspect-9/16 w-full overflow-hidden rounded-2xl bg-slate-100">
        <Skeleton className="h-full w-full" />
    </div>
)

export const EventSkeleton = () => (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl">
/**
 * MomentSkeleton - React component
 * @returns React element
 */
            <Skeleton className="h-full w-full" />
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4">
            <Skeleton className="h-10 w-full rounded-full" />
/**
 * EventSkeleton - React component
 * @returns React element
 */
        </div>
    </div>
)

export const InspireSkeleton = () => (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
        <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100">
            <Skeleton className="h-full w-full" />
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-12" />
                </div>
            </div>
/**
 * InspireSkeleton - React component
 * @returns React element
 */
        </div>
    </div>
)
