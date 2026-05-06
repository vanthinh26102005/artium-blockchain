// react
import { useMemo, CSSProperties, ChangeEvent, RefObject } from 'react'

// third-party
import { Wallet } from 'lucide-react'
import { Controller, useWatch, Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import { PhoneInput } from 'react-international-phone'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { AvatarUpload } from '@domains/profile/components/edit-profile/AvatarUpload'
import { getInputClasses } from '@domains/profile/components/edit-profile/editProfileStyles'
import { FormValues } from '@domains/profile/types/editProfile'
import { normalizeProfileSlug } from '@domains/profile/validations/editProfile.schema'

type CountryOption = {
  value: string
  label: string
}

type BasicInformationSectionProps = {
  register: UseFormRegister<FormValues>
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  showErrors: boolean
  avatarSrc: string
  avatarInputRef: RefObject<HTMLInputElement | null>
  onAvatarPick: () => void
  onAvatarRemove: () => void
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
  currentWalletAddress?: string | null
  isWalletLoading?: boolean
  onManageWallet?: () => void
  showSellerContactFields?: boolean
}

export const BasicInformationSection = ({
  register,
  control,
  errors,
  showErrors,
  avatarSrc,
  avatarInputRef,
  onAvatarPick,
  onAvatarRemove,
  onAvatarChange,
  currentWalletAddress,
  isWalletLoading = false,
  onManageWallet,
  showSellerContactFields = false,
}: BasicInformationSectionProps) => {
  const username = useWatch({ control, name: 'username' }) ?? ''
  const firstName = useWatch({ control, name: 'firstName' }) ?? ''
  const lastName = useWatch({ control, name: 'lastName' }) ?? ''
  const countryValue = useWatch({ control, name: 'country' }) ?? ''
  const countryOptions = useMemo<CountryOption[]>(
    () => countryList().setLabel('VN', 'Viet Nam').getData(),
    [],
  )
  const selectedCountry = useMemo(
    () => countryOptions.find((option) => option.value === countryValue) || null,
    [countryOptions, countryValue],
  )
  const phoneInputStyle = useMemo(
    () =>
      ({
        '--react-international-phone-border-radius': '16px',
        '--react-international-phone-border-color': '#e2e8f0',
        '--react-international-phone-height': '48px',
        '--react-international-phone-font-size': '14px',
        '--react-international-phone-background-color': '#ffffff',
        '--react-international-phone-text-color': '#0f172a',
        '--react-international-phone-selected-dropdown-item-background-color': '#f1f5f9',
        '--react-international-phone-dropdown-shadow': '0 18px 32px rgba(15, 23, 42, 0.12)',
      }) as CSSProperties,
    [],
  )

  const avatarError =
    typeof errors.avatarUrl?.message === 'string' ? errors.avatarUrl.message : undefined
  const shortenedWallet = currentWalletAddress
    ? `${currentWalletAddress.slice(0, 6)}...${currentWalletAddress.slice(-4)}`
    : null

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
        Basic Information
      </h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <AvatarUpload
          avatarSrc={avatarSrc}
          inputRef={avatarInputRef}
          onPick={onAvatarPick}
          onRemove={onAvatarRemove}
          onChange={onAvatarChange}
          showError={showErrors}
          error={avatarError}
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
            >
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              id="username"
              {...register('username', { setValueAs: normalizeProfileSlug })}
              maxLength={75}
              className={getInputClasses(showErrors && !!errors.username)}
            />
            <div className="mt-1 flex min-h-[16px] items-center justify-between text-xs text-slate-400">
              <span className={errors.username && showErrors ? 'text-rose-500' : ''}>
                {showErrors && typeof errors.username?.message === 'string'
                  ? errors.username.message
                  : ''}
              </span>
              <span>{username.length}/75 characters</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Wallet
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 sm:truncate">
                  {shortenedWallet ?? 'No wallet connected'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add, change, or remove the wallet used for account login and auction bidding.
                </p>
              </div>
              <div className="flex min-w-0 shrink-0">
                <button
                  type="button"
                  onClick={onManageWallet}
                  disabled={isWalletLoading || !onManageWallet}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Wallet className="h-4 w-4" />
                  Manage Wallet
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
            >
              First name / Brand name <span className="text-rose-500">*</span>
            </label>
            <input
              id="firstName"
              {...register('firstName')}
              maxLength={30}
              className={getInputClasses(showErrors && !!errors.firstName)}
            />
            <div className="mt-1 flex min-h-[16px] items-center justify-between text-xs text-slate-400">
              <span className={errors.firstName && showErrors ? 'text-rose-500' : ''}>
                {showErrors && typeof errors.firstName?.message === 'string'
                  ? errors.firstName.message
                  : ''}
              </span>
              <span>{firstName.length}/30 characters</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
            >
              Last name (optional)
            </label>
            <input
              id="lastName"
              {...register('lastName')}
              maxLength={30}
              className={getInputClasses()}
            />
            <div className="mt-1 flex min-h-[16px] items-center justify-end text-xs text-slate-400">
              <span>{lastName.length}/30 characters</span>
            </div>
          </div>
        </div>
      </div>

      {showSellerContactFields ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Phone number
            </label>
            <div className="mt-2">
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    defaultCountry="vn"
                    preferredCountries={['vn', 'us', 'jp', 'kr', 'sg']}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="901234567"
                    className="w-full"
                    inputClassName="w-full text-sm text-slate-900 placeholder:text-slate-400"
                    countrySelectorStyleProps={{
                      buttonClassName: 'rounded-l-2xl',
                      buttonContentWrapperClassName: 'px-3',
                      dropdownStyleProps: {
                        className:
                          'rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden',
                      },
                    }}
                    inputProps={{
                      name: field.name,
                    }}
                    style={phoneInputStyle}
                  />
                )}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              We only use this number for delivery updates.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Address
            </label>
            <input
              {...register('addressLine1')}
              placeholder="Street, Ward/Commune"
              className={cn(getInputClasses(), 'mt-2')}
            />
            <input
              {...register('addressLine2')}
              placeholder="Apartment, suite, building (optional)"
              className={cn(getInputClasses(), 'mt-3')}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                {...register('district')}
                placeholder="District"
                className={getInputClasses()}
              />
              <input
                {...register('province')}
                placeholder="Province / City"
                className={getInputClasses()}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select<CountryOption, false>
                    instanceId="country-select"
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={(option) => field.onChange(option?.value ?? '')}
                    placeholder="Select country"
                    unstyled
                    className="w-full"
                    classNames={{
                      control: (state) =>
                        [
                          'flex min-h-12 w-full items-center rounded-2xl border bg-white px-4 py-3 shadow-sm transition',
                          state.isFocused
                            ? 'border-slate-300 ring-2 ring-slate-200'
                            : 'border-slate-200',
                        ].join(' '),
                      valueContainer: () => 'flex h-full flex-1 items-center p-0',
                      input: () => 'text-sm text-slate-900',
                      placeholder: () => 'text-sm text-slate-400',
                      singleValue: () => 'text-sm text-slate-900',
                      menu: () =>
                        'mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden',
                      option: (state) =>
                        [
                          'px-3 py-2 text-sm',
                          state.isSelected
                            ? 'bg-slate-100 font-semibold text-slate-900'
                            : state.isFocused
                              ? 'bg-slate-50 text-slate-800'
                              : 'text-slate-700',
                        ].join(' '),
                    }}
                  />
                )}
              />
              <input
                {...register('postalCode')}
                placeholder="Postal code"
                className={getInputClasses()}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Your exact address will not be displayed publicly.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
