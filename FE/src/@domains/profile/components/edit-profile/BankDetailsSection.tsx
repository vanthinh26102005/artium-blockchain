// third-party
import { UseFormRegister } from 'react-hook-form'

// @domains - profile
import { getInputClasses } from '@domains/profile/components/edit-profile/editProfileStyles'
import { FormValues } from '@domains/profile/types/editProfile'

type BankDetailsSectionProps = {
  register: UseFormRegister<FormValues>
}

export const BankDetailsSection = ({ register }: BankDetailsSectionProps) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
        Bank Details
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Your bank info is only used for payouts and will never be shared.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="bankAccountNumber"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Bank account number
          </label>
          <input
            id="bankAccountNumber"
            {...register('bankAccountNumber')}
            placeholder="e.g. 0123456789012"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="bankAccountHolder"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Account holder name
          </label>
          <input
            id="bankAccountHolder"
            {...register('bankAccountHolder')}
            placeholder="e.g. Nguyen Van A"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="bankName"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Bank name
          </label>
          <input
            id="bankName"
            {...register('bankName')}
            placeholder="e.g. Vietcombank"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="bankBranch"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Branch
          </label>
          <input
            id="bankBranch"
            {...register('bankBranch')}
            placeholder="e.g. Ho Chi Minh City Branch"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="bankSwiftCode"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Swift/BIC (international)
          </label>
          <input
            id="bankSwiftCode"
            {...register('bankSwiftCode')}
            placeholder="e.g. BFTVVNVX"
            className={getInputClasses()}
          />
        </div>

        <div>
          <label
            htmlFor="bankAddress"
            className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase"
          >
            Bank address
          </label>
          <input
            id="bankAddress"
            {...register('bankAddress')}
            placeholder="e.g. 198 Tran Quang Khai, District 1, HCMC"
            className={getInputClasses()}
          />
        </div>
      </div>
    </section>
  )
}
