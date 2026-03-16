export function getAuthModeTitle(mode) {
  if (mode === "signup") {
    return "Create account"
  }

  if (mode === "confirm") {
    return "Confirm account"
  }

  return "Sign in"
}

export function getAuthSubmitLabel(mode) {
  if (mode === "signup") {
    return "Create account"
  }

  if (mode === "confirm") {
    return "Confirm account"
  }

  return "Sign in"
}

export function shouldOpenConfirmModeFromPath(pathname) {
  return pathname === "/confirm-registration"
}

export function getLinkConfirmationPayload(search) {
  const params = new URLSearchParams(search)
  const username = params.get("user_name") || params.get("username")
  const code = params.get("confirmation_code") || params.get("code")

  if (!username || !code) {
    return null
  }

  return { username, code }
}

export function formatAuthError(error, fallbackMessage) {
  return error?.name ? `${error.name}: ${error.message}` : fallbackMessage
}

export function getSignupValidationError({ username, email, password, confirmPassword }) {
  if (!username.trim() || !email.trim() || !password.trim()) {
    return "Username, email, and password are required"
  }

  if (password !== confirmPassword) {
    return "Passwords do not match"
  }

  return ""
}

export function getConfirmValidationError({ username, confirmationCode }) {
  if (!username.trim() || !confirmationCode.trim()) {
    return "Username and confirmation code are required"
  }

  return ""
}

export function getSigninValidationError({ username, password }) {
  if (!username.trim() || !password.trim()) {
    return "Username and password are required"
  }

  return ""
}

export function getSignupSuccessMessage(response) {
  const destination = response?.CodeDeliveryDetails?.Destination

  if (response?.UserConfirmed) {
    return "Account created. You can sign in now."
  }

  if (destination) {
    return `Account created. Check your email for a confirmation code sent to ${destination}.`
  }

  return "Account created. Please confirm your account before signing in."
}

export function getResendSuccessMessage(response) {
  const destination = response?.CodeDeliveryDetails?.Destination
  if (destination) {
    return `A new confirmation email was sent to ${destination}.`
  }

  return "A new confirmation email was sent."
}
