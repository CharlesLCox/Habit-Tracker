import { Button } from "@chakra-ui/react"

export default function LoginModeActions({
  mode,
  switchMode,
  handleResendCode,
  resendLoading,
}) {
  return (
    <>
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
          <Button type="button" variant="ghost" onClick={() => switchMode("signup")}>
            Don&apos;t have an account? Create account
          </Button>
          <Button type="button" variant="ghost" onClick={() => switchMode("confirm")}>
            Have a confirmation code? Confirm account
          </Button>
        </>
      ) : null}

      {mode === "signup" ? (
        <>
          <Button type="button" variant="ghost" onClick={() => switchMode("signin")}>
            Already have an account? Sign in
          </Button>
          <Button type="button" variant="ghost" onClick={() => switchMode("confirm")}>
            Already have a code? Confirm account
          </Button>
        </>
      ) : null}

      {mode === "confirm" ? (
        <>
          <Button type="button" variant="ghost" onClick={() => switchMode("signin")}>
            Back to sign in
          </Button>
          <Button type="button" variant="ghost" onClick={() => switchMode("signup")}>
            Need an account? Create account
          </Button>
        </>
      ) : null}
    </>
  )
}
