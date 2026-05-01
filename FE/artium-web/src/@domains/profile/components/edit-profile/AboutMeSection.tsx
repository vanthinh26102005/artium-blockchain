// third-party
import { useController, useWatch, Control, FieldErrors, UseFormRegister } from 'react-hook-form'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import {
  getChipClasses,
  getInputClasses,
} from '@domains/profile/components/edit-profile/editProfileStyles'
import { FormValues } from '@domains/profile/types/editProfile'

const PROFILE_CATEGORY_OPTIONS = ['Artist', 'Advisor', 'Collector', 'Gallery', 'Art Lover']
const ROLE_OPTIONS = [
  'Curator',
  'Designer',
  'Musician',
  'Collector',
  'Newbie',
  'Photographer',
  'Craftsman',
  'Jeweler',
  'Explorer',
  'Buyer',
]

type AboutMeSectionProps = {
  register: UseFormRegister<FormValues>
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  showErrors: boolean
}

export const AboutMeSection = ({ register, control, errors, showErrors }: AboutMeSectionProps) => {
  const headline = useWatch({ control, name: 'headline' }) ?? ''
  const biography = useWatch({ control, name: 'biography' }) ?? ''
  const { field: profileCategoriesField } = useController({
    control,
    name: 'profileCategories',
  })
  const { field: rolesField } = useController({ control, name: 'roles' })
  const profileCategories = profileCategoriesField.value ?? []
  const roles = rolesField.value ?? []
  const toggleSelection = (current: string[], value: string) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">About Me</h2>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="headline"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Headline
          </label>
          <input
            id="headline"
            {...register('headline')}
            maxLength={100}
            placeholder="Exploring art and building communities"
            className={getInputClasses()}
          />
          <div className="mt-1 flex min-h-[16px] items-center justify-end text-xs text-slate-400">
            <span>{headline.length}/100 characters</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="biography"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Biography
          </label>
          <textarea
            id="biography"
            {...register('biography')}
            maxLength={1000}
            placeholder="Share a bit about yourself"
            rows={4}
            className={cn(getInputClasses(), 'resize-none')}
          />
          <div className="mt-1 flex min-h-[16px] items-center justify-end text-xs text-slate-400">
            <span>{biography.length}/1000 characters</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="websiteUrl"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Website URL
          </label>
          <input
            id="websiteUrl"
            {...register('websiteUrl')}
            placeholder="https://"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="instagram"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Instagram
          </label>
          <input
            id="instagram"
            {...register('instagram')}
            placeholder="instagram.com/"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="twitter"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Twitter
          </label>
          <input
            id="twitter"
            {...register('twitter')}
            placeholder="x.com/"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Choose what best describes you <span className="text-rose-500">*</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROFILE_CATEGORY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  profileCategoriesField.onChange(toggleSelection(profileCategories, option))
                }
                className={getChipClasses(profileCategories.includes(option))}
              >
                {option}
              </button>
            ))}
          </div>
          {showErrors && errors.profileCategories?.message ? (
            <p className="mt-2 text-xs text-rose-500">
              {typeof errors.profileCategories.message === 'string'
                ? errors.profileCategories.message
                : ''}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            My roles
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((option) => {
              const selected = roles.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => rolesField.onChange(toggleSelection(roles, option))}
                  className={getChipClasses(selected)}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
