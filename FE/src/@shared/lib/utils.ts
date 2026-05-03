import classNames from 'classnames'

export type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray

type ClassDictionary = Record<string, boolean | null | undefined>
type ClassArray = ClassValue[]

/**
 * cn - Utility function
 * @returns void
 */
export const cn = (...inputs: ClassValue[]) => classNames(...inputs)
