// third-party
import { useWatch, Control, UseFormRegister } from 'react-hook-form'

// @domains - profile
import { getInputClasses } from '@domains/profile/components/edit-profile/editProfileStyles'
import { FormValues } from '@domains/profile/types/editProfile'

type ArtWorldConnectionSectionProps = {
  register: UseFormRegister<FormValues>
  control: Control<FormValues>
}

/**
 * ArtWorldConnectionSection - React component
 * @returns React element
 */
export const ArtWorldConnectionSection = ({
  register,
  control,
}: ArtWorldConnectionSectionProps) => {
  const connectionAffiliations = useWatch({ control, name: 'connectionAffiliations' }) ?? ''
  const connectionSeenAt = useWatch({ control, name: 'connectionSeenAt' }) ?? ''
  const connectionCurrently = useWatch({ control, name: 'connectionCurrently' }) ?? ''
  /**
   * connectionAffiliations - Utility function
   * @returns void
   */
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
        My Connection to the Art World /** * connectionSeenAt - Utility function * @returns void */
      </h2>

      <div className="mt-6 space-y-4">
        <div>
          /** * connectionCurrently - Utility function * @returns void */
          <label
            htmlFor="connectionAffiliations"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
          >
            Affiliations
          </label>
          <input
            id="connectionAffiliations"
            {...register('connectionAffiliations')}
            maxLength={50}
            placeholder="e.g. Artium"
            className={getInputClasses()}
          />
          <div className="mt-1 flex min-h-[16px] items-center justify-end text-xs text-slate-400">
            <span>{connectionAffiliations.length}/50 characters</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="connectionSeenAt"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
          >
            You might have seen me at
          </label>
          <input
            id="connectionSeenAt"
            {...register('connectionSeenAt')}
            maxLength={50}
            placeholder="e.g. Artium NFT Art Show"
            className={getInputClasses()}
          />
          <div className="mt-1 flex min-h-[16px] items-center justify-end text-xs text-slate-400">
            <span>{connectionSeenAt.length}/50 characters</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="connectionCurrently"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
          >
            Currently
          </label>
          <input
            id="connectionCurrently"
            {...register('connectionCurrently')}
            maxLength={100}
            placeholder="e.g. Exploring my Artium community"
            className={getInputClasses()}
          />
          <div className="mt-1 flex min-h-[16px] items-center justify-end text-xs text-slate-400">
            <span>{connectionCurrently.length}/100 characters</span>
          </div>
        </div>
      </div>
    </section>
  )
}
