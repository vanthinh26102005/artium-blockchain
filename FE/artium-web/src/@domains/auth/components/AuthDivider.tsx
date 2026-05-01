type AuthDividerProps = {
  text: string
}

export const AuthDivider = ({ text }: AuthDividerProps) => {
  // -- render --
  return (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-kokushoku-black/50" />
      <span className="text-sm font-semibold tracking-[0.2em] text-[#868686] uppercase">
        {text}
      </span>
      <div className="h-px flex-1 bg-kokushoku-black/50" />
    </div>
  )
}
