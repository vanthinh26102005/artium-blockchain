type AuthDividerProps = {
  text: string
}

/**
 * AuthDivider - React component
 * @returns React element
 */
export const AuthDivider = ({ text }: AuthDividerProps) => {
  // -- render --
  return (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-kokushoku-black/50" />
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#868686]">
        {text}
      </span>
      <div className="h-px flex-1 bg-kokushoku-black/50" />
    </div>
  )
}
