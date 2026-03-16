import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  confirmAccount,
  createAccount,
  login,
  resendConfirmationCode,
} from "../services/auth"
import LoginModeActions from "../components/pages/login/LoginModeActions"
import LoginStatusMessages from "../components/pages/login/LoginStatusMessages"
import {
  formatAuthError,
  getAuthModeTitle,
  getAuthSubmitLabel,
  getConfirmValidationError,
  getLinkConfirmationPayload,
  getResendSuccessMessage,
  getSigninValidationError,
  getSignupSuccessMessage,
  getSignupValidationError,
  shouldOpenConfirmModeFromPath,
} from "../utils/loginUtils"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState("signin")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [linkConfirmLoading, setLinkConfirmLoading] = useState(false)

  function switchMode(nextMode) {
    setMode(nextMode)
    setError("")
    setSuccessMessage("")
    setPassword("")
    setConfirmPassword("")
    setConfirmationCode("")
  }

  useEffect(() => {
    if (shouldOpenConfirmModeFromPath(location.pathname)) {
      setMode("confirm")
    }
  }, [location.pathname])

  useEffect(() => {
    const confirmationPayload = getLinkConfirmationPayload(location.search)

    if (!confirmationPayload) {
      return
    }
    const { username: linkedUsername, code: linkedCode } = confirmationPayload

    let isCancelled = false

    async function autoConfirmFromLink() {
      setError("")
      setSuccessMessage("")
      setMode("confirm")
      setUsername(linkedUsername)
      setConfirmationCode(linkedCode)
      setLinkConfirmLoading(true)

      try {
        await confirmAccount({ username: linkedUsername, code: linkedCode })
        if (isCancelled) {
          return
        }

        setSuccessMessage("Your account has been confirmed. You can sign in now.")
        setMode("signin")
        setConfirmationCode("")
        window.history.replaceState({}, "", location.pathname)
      } catch (err) {
        if (isCancelled) {
          return
        }

        console.error("Link confirmation error:", err)
        setError(formatAuthError(err, "Unable to confirm account from link"))
      } finally {
        if (!isCancelled) {
          setLinkConfirmLoading(false)
        }
      }
    }

    autoConfirmFromLink()

    return () => {
      isCancelled = true
    }
  }, [location.pathname, location.search])

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (mode === "signup") {
        const signupValidationError = getSignupValidationError({
          username,
          email,
          password,
          confirmPassword,
        })
        if (signupValidationError) {
          throw new Error(signupValidationError)
        }

        const response = await createAccount({ username, password, email })
        setSuccessMessage(getSignupSuccessMessage(response))
        setMode(response?.UserConfirmed ? "signin" : "confirm")
        setPassword("")
        setConfirmPassword("")
        return
      }

      if (mode === "confirm") {
        const confirmValidationError = getConfirmValidationError({
          username,
          confirmationCode,
        })
        if (confirmValidationError) {
          throw new Error(confirmValidationError)
        }

        await confirmAccount({ username, code: confirmationCode })
        setSuccessMessage("Account confirmed. You can sign in now.")
        setMode("signin")
        setConfirmationCode("")
        return
      }

      const signinValidationError = getSigninValidationError({ username, password })
      if (signinValidationError) {
        throw new Error(signinValidationError)
      }

      await login(username, password)
      navigate("/overview")
    } catch (err) {
      console.error("Auth error:", err)
      setError(formatAuthError(err, "Authentication failed"))
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode() {
    setError("")
    setSuccessMessage("")
    setResendLoading(true)

    try {
      if (!username.trim()) {
        throw new Error("Enter your username before resending the confirmation email")
      }

      const response = await resendConfirmationCode(username)
      setSuccessMessage(getResendSuccessMessage(response))
    } catch (err) {
      console.error("Resend code error:", err)
      setError(formatAuthError(err, "Unable to resend code"))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Box maxW="420px" mx="auto" mt="80px" p="6" borderWidth="1px" rounded="lg">
      <Heading size="lg" mb="6">
        {getAuthModeTitle(mode)}
      </Heading>

      <form onSubmit={handleSubmit}>
        <Stack gap="4">
          <Field.Root>
            <Field.Label>Username</Field.Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </Field.Root>

          {mode === "signup" ? (
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </Field.Root>
          ) : null}

          {mode !== "confirm" ? (
            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </Field.Root>
          ) : null}

          {mode === "signup" ? (
            <Field.Root>
              <Field.Label>Confirm Password</Field.Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </Field.Root>
          ) : null}

          {mode === "confirm" ? (
            <Field.Root>
              <Field.Label>Confirmation Code</Field.Label>
              <Input
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter the code from your email"
              />
            </Field.Root>
          ) : null}

          <LoginStatusMessages
            successMessage={successMessage}
            error={error}
            linkConfirmLoading={linkConfirmLoading}
          />

          <Button type="submit" loading={loading}>
            {getAuthSubmitLabel(mode)}
          </Button>

          <LoginModeActions
            mode={mode}
            switchMode={switchMode}
            handleResendCode={handleResendCode}
            resendLoading={resendLoading}
          />
        </Stack>
      </form>
    </Box>
  )
}
