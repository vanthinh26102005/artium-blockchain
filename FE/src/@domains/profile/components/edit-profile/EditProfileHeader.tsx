type EditProfileHeaderProps = {
  isDirty: boolean
  isSaving: boolean
}

export const EditProfileHeader = ({ isDirty, isSaving }: EditProfileHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Profile</h1>
      <button
        type="submit"
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!isDirty || isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
