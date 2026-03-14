import { Box, Button, Flex, Heading } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { logout } from "../../services/auth"

export default function Navbar() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <Box borderBottomWidth="1px" px="6" py="4">
      <Flex align="center" justify="space-between">
        <Heading size="md">Task Tracker</Heading>

        <Button onClick={handleLogout}>
          Sign out
        </Button>
      </Flex>
    </Box>
  )
}