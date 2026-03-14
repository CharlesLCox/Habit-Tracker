import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
  } from "@aws-sdk/client-cognito-identity-provider"
  
  const client = new CognitoIdentityProviderClient({
    region: import.meta.env.VITE_COGNITO_REGION,
  })
  
  export async function login(username, password) {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
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