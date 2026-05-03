// react
import { ReactNode } from 'react'

type AuthFormCardProps = {
  children: ReactNode
}

/**
 * AuthFormCard - React component
 * @returns React element
 */
export const AuthFormCard = ({ children }: AuthFormCardProps) => {
  // -- render --
  return (
    <div className="shadow-artium-xl mx-auto flex w-full max-w-160 flex-col space-y-5 rounded-4xl bg-white px-10 py-10 text-black sm:px-12 lg:space-y-7 lg:px-14 lg:py-14">
      {children}
    </div>
  )
}
