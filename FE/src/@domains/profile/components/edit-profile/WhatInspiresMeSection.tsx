// third-party
import { useController, Control } from 'react-hook-form'

// @domains - profile
import { getChipClasses } from '@domains/profile/components/edit-profile/editProfileStyles'
import { FormValues } from '@domains/profile/types/editProfile'

/**
 * INSPIRE_VIBES_OPTIONS - React component
 * @returns React element
 */
const INSPIRE_VIBES_OPTIONS = [
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
const INSPIRE_VALUES_OPTIONS = [
  'Pride',
  'Cultural Heritage',
/**
 * INSPIRE_VALUES_OPTIONS - React component
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
const INSPIRE_MEDIUM_OPTIONS = [
  'Painting',
  'Drawing',
  'Illustration',
  'Immersive',
  'Digital',
/**
 * INSPIRE_MEDIUM_OPTIONS - React component
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

type WhatInspiresMeSectionProps = {
  control: Control<FormValues>
}

export const WhatInspiresMeSection = ({ control }: WhatInspiresMeSectionProps) => {
  const { field: inspireVibesField } = useController({ control, name: 'inspireVibes' })
  const { field: inspireValuesField } = useController({ control, name: 'inspireValues' })
  const { field: inspireMediumsField } = useController({ control, name: 'inspireMediums' })
  const inspireVibes = inspireVibesField.value ?? []
  const inspireValues = inspireValuesField.value ?? []
  const inspireMediums = inspireMediumsField.value ?? []
  const toggleSelection = (current: string[] | undefined, value: string) => {
    const safeCurrent = current ?? []
/**
 * WhatInspiresMeSection - React component
 * @returns React element
 */
    return safeCurrent.includes(value)
      ? safeCurrent.filter((item) => item !== value)
      : [...safeCurrent, value]
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
/**
 * inspireVibes - Utility function
 * @returns void
 */
      <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
        What Inspires Me
      </h2>

/**
 * inspireValues - Utility function
 * @returns void
 */
      <div className="mt-6 space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">Vibes</p>
          <div className="mt-3 flex flex-wrap gap-2">
/**
 * inspireMediums - Utility function
 * @returns void
 */
            {INSPIRE_VIBES_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
/**
 * toggleSelection - Utility function
 * @returns void
 */
                onClick={() => inspireVibesField.onChange(toggleSelection(inspireVibes, option))}
                className={getChipClasses(inspireVibes.includes(option))}
              >
                {option}
/**
 * safeCurrent - Utility function
 * @returns void
 */
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">Values</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INSPIRE_VALUES_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => inspireValuesField.onChange(toggleSelection(inspireValues, option))}
                className={getChipClasses(inspireValues.includes(option))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">Medium</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INSPIRE_MEDIUM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  inspireMediumsField.onChange(toggleSelection(inspireMediums, option))
                }
                className={getChipClasses(inspireMediums.includes(option))}
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
