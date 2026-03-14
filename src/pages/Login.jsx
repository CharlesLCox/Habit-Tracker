import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { login } from "../services/auth"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/")
    } catch (err) {
        console.error("Login error:", err)
        setError(err?.name ? `${err.name}: ${err.message}` : "Unable to sign in")
      } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="420px" mx="auto" mt="80px" p="6" borderWidth="1px" rounded="lg">
      <Heading size="lg" mb="6">
        Sign in
      </Heading>

      <form onSubmit={handleSubmit}>
        <Stack gap="4">
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </Field.Root>

          {error ? <Text color="red.500">{error}</Text> : null}

          <Button type="submit" loading={loading}>
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  )
}