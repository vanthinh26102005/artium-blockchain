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
    <div className="max-w-160 rounded-4xl mx-auto flex w-full flex-col space-y-5 bg-white px-10 py-10 text-black shadow-artium-xl sm:px-12 lg:space-y-7 lg:px-14 lg:py-14">
      {children}
    </div>
  )
}
