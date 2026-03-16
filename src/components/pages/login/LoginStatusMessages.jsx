import { Text } from "@chakra-ui/react"

export default function LoginStatusMessages({ successMessage, error, linkConfirmLoading }) {
  return (
    <>
      {successMessage ? <Text color="green.600">{successMessage}</Text> : null}
      {error ? <Text color="red.500">{error}</Text> : null}
      {linkConfirmLoading ? (
        <Text color="blue.600">Confirming your account from the email link...</Text>
      ) : null}
    </>
  )
}
