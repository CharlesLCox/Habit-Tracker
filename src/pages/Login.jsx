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
    if (location.pathname === "/confirm-registration") {
      setMode("confirm")
    }
  }, [location.pathname])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const linkedUsername = params.get("user_name") || params.get("username")
    const linkedCode = params.get("confirmation_code") || params.get("code")

    if (!linkedUsername || !linkedCode) {
      return
    }

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
        setError(
          err?.name
            ? `${err.name}: ${err.message}`
            : "Unable to confirm account from link"
        )
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
        if (!username.trim() || !email.trim() || !password.trim()) {
          throw new Error("Username, email, and password are required")
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }

        const response = await createAccount({ username, password, email })
        const destination = response?.CodeDeliveryDetails?.Destination

        setSuccessMessage(
          response?.UserConfirmed
            ? "Account created. You can sign in now."
            : destination
              ? `Account created. Check your email for a confirmation code sent to ${destination}.`
              : "Account created. Please confirm your account before signing in."
        )
        setMode(response?.UserConfirmed ? "signin" : "confirm")
        setPassword("")
        setConfirmPassword("")
        return
      }

      if (mode === "confirm") {
        if (!username.trim() || !confirmationCode.trim()) {
          throw new Error("Username and confirmation code are required")
        }

        await confirmAccount({ username, code: confirmationCode })
        setSuccessMessage("Account confirmed. You can sign in now.")
        setMode("signin")
        setConfirmationCode("")
        return
      }

      if (!username.trim() || !password.trim()) {
        throw new Error("Username and password are required")
      }

      await login(username, password)
      navigate("/")
    } catch (err) {
      console.error("Auth error:", err)
      setError(err?.name ? `${err.name}: ${err.message}` : "Authentication failed")
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
      const destination = response?.CodeDeliveryDetails?.Destination
      setSuccessMessage(
        destination
          ? `A new confirmation email was sent to ${destination}.`
          : "A new confirmation email was sent."
      )
    } catch (err) {
      console.error("Resend code error:", err)
      setError(err?.name ? `${err.name}: ${err.message}` : "Unable to resend code")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Box maxW="420px" mx="auto" mt="80px" p="6" borderWidth="1px" rounded="lg">
      <Heading size="lg" mb="6">
        {mode === "signin"
          ? "Sign in"
          : mode === "signup"
            ? "Create account"
            : "Confirm account"}
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

          {successMessage ? <Text color="green.600">{successMessage}</Text> : null}
          {error ? <Text color="red.500">{error}</Text> : null}
          {linkConfirmLoading ? (
            <Text color="blue.600">Confirming your account from the email link...</Text>
          ) : null}

          <Button type="submit" loading={loading}>
            {mode === "signin"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Confirm account"}
          </Button>

          {mode === "confirm" ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              loading={resendLoading}
            >
              Resend confirmation email
            </Button>
          ) : null}

          {mode === "signin" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("signup")}
              >
                Don&apos;t have an account? Create account
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("confirm")}
              >
                Have a confirmation code? Confirm account
              </Button>
            </>
          ) : null}

          {mode === "signup" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("signin")}
              >
                Already have an account? Sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("confirm")}
              >
                Already have a code? Confirm account
              </Button>
            </>
          ) : null}

          {mode === "confirm" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("signin")}
              >
                Back to sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("signup")}
              >
                Need an account? Create account
              </Button>
            </>
          ) : null}
        </Stack>
      </form>
    </Box>
  )
}
