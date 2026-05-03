// third-party
import { useController, Control } from 'react-hook-form'

// @domains - profile
import { getChipClasses } from '@domains/profile/components/edit-profile/editProfileStyles'
import { FormValues } from '@domains/profile/types/editProfile'

/**
 * ARTISTIC_VIBES_OPTIONS - React component
 * @returns React element
 */
const ARTISTIC_VIBES_OPTIONS = [
  'Joyful',
  'Vibrant',
  'Dreamy',
  'Peaceful',
  'Expressive',
  'Romantic',
  'Moody',
  'Vintage',
  'Natural',
  'Bold',
  'Avant Garde',
  'Minimalist',
  'Classic',
]
const ARTISTIC_VALUES_OPTIONS = [
  'Pride',
  'Cultural Heritage',
  /**
   * ARTISTIC_VALUES_OPTIONS - React component
   * @returns React element
   */
  'Equity',
  'Futurism',
  'Environment',
  'Feminism',
  'Human Experiences',
  'Escapism',
  'Social Awareness',
]
const ARTISTIC_MEDIUM_OPTIONS = [
  'Painting',
  'Drawing',
  'Illustration',
  'Immersive',
  'Digital',
  /**
   * ARTISTIC_MEDIUM_OPTIONS - React component
   * @returns React element
   */
  'Prints',
  'Video',
  'Photography',
  'Sculpture',
  'Installation',
  'Public Art',
  'Collage',
  'Mixed Media',
  'Performance Art',
]

type ArtisticDirectionSectionProps = {
  control: Control<FormValues>
}

export const ArtisticDirectionSection = ({ control }: ArtisticDirectionSectionProps) => {
  const { field: artisticVibesField } = useController({ control, name: 'artisticVibes' })
  const { field: artisticValuesField } = useController({ control, name: 'artisticValues' })
  const { field: artisticMediumsField } = useController({ control, name: 'artisticMediums' })
  const artisticVibes = artisticVibesField.value ?? []
  const artisticValues = artisticValuesField.value ?? []
  const artisticMediums = artisticMediumsField.value ?? []
  const toggleSelection = (current: string[], value: string) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  /**
   * ArtisticDirectionSection - React component
   * @returns React element
   */

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
        Artistic Direction
      </h2>
      /** * artisticVibes - Utility function * @returns void */
      <div className="mt-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Vibes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            /** * artisticValues - Utility function * @returns void */
            {ARTISTIC_VIBES_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                /**
                 * artisticMediums - Utility function
                 * @returns void
                 */
                onClick={() => artisticVibesField.onChange(toggleSelection(artisticVibes, option))}
                className={getChipClasses(artisticVibes.includes(option))}
              >
                {option}
                /** * toggleSelection - Utility function * @returns void */
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Values</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ARTISTIC_VALUES_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  artisticValuesField.onChange(toggleSelection(artisticValues, option))
                }
                className={getChipClasses(artisticValues.includes(option))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Medium</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ARTISTIC_MEDIUM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  artisticMediumsField.onChange(toggleSelection(artisticMediums, option))
                }
                className={getChipClasses(artisticMediums.includes(option))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
