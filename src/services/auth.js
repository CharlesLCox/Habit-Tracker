import {
  ConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider"

const client = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_COGNITO_REGION,
})

export async function login(username, password) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username.trim(),
      PASSWORD: password,
    },
  })

  const response = await client.send(command)
  const result = response.AuthenticationResult

  if (!result?.AccessToken) {
    throw new Error("Login failed")
  }

  const authData = {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
    expiresIn: result.ExpiresIn,
    tokenType: result.TokenType,
  }

  localStorage.setItem("auth", JSON.stringify(authData))
  return authData
}

export async function createAccount({ username, password, email }) {
  const normalizedUsername = username.trim()

  const command = new SignUpCommand({
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    Username: normalizedUsername,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email.trim() },
      { Name: "preferred_username", Value: normalizedUsername },
    ],
  })

  return client.send(command)
}

export async function confirmAccount({ username, code }) {
  const command = new ConfirmSignUpCommand({
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    Username: username.trim(),
    ConfirmationCode: code.trim(),
  })

  return client.send(command)
}

export async function resendConfirmationCode(username) {
  const command = new ResendConfirmationCodeCommand({
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    Username: username.trim(),
  })

  return client.send(command)
}

export function logout() {
  localStorage.removeItem("auth")
}

export function getAuth() {
  const raw = localStorage.getItem("auth")
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
  const auth = getAuth()
  return !!auth?.accessToken
}

function parseJwtPayload(token) {
  if (!token) {
    return null
  }

  try {
    const encodedPayload = token.split(".")[1]
    if (!encodedPayload) {
      return null
    }

    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function getProfileName() {
  const auth = getAuth()
  const claims = parseJwtPayload(auth?.idToken)

  return (
    claims?.preferred_username ||
    claims?.name ||
    claims?.["cognito:username"] ||
    claims?.email ||
    "Profile"
  )
}

export function isAdminUser() {
  const auth = getAuth()
  const claims = parseJwtPayload(auth?.idToken)
  const groups = claims?.["cognito:groups"]

  if (Array.isArray(groups)) {
    return groups.some(
      (group) => typeof group === "string" && group.toLowerCase() === "admins"
    )
  }

  if (typeof groups === "string") {
    return groups.toLowerCase() === "admins"
  }

  return false
}

export function getUserRoleLabel() {
  return isAdminUser() ? "Administrator" : "Standard User"
}
