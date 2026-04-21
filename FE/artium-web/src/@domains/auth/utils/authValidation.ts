const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export const getEmailValidationMessage = (email: string) => {
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    return 'Email is required.'
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return 'Enter a valid email address.'
  }

  return ''
}

export const getLoginPasswordValidationMessage = (password: string) => {
  if (!password) {
    return 'Password is required.'
  }

  return ''
}

export const getSignUpFirstNameValidationMessage = (firstName: string) => {
  if (!firstName.trim()) {
    return 'First name is required.'
  }

  return ''
}

export const getSignUpPasswordValidationMessage = (password: string) => {
  if (!password) {
    return 'Password is required.'
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return 'Use 8+ characters with uppercase, lowercase, and a number.'
  }

  return ''
}
