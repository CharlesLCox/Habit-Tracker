import { Box, Button, Flex, Heading } from "@chakra-ui/react"
import { useLocation, useNavigate } from "react-router-dom"
import { logout } from "../../services/auth"

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: "Tasks", path: "/tasks" },
    { label: "Habits", path: "/habits" },
    { label: "Statistics", path: "/statistics" },
    { label: "Settings", path: "/settings" },
  ]

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <Box borderBottomWidth="1px" px="6" py="4">
      <Flex align="center" justify="space-between">
        <Heading size="md">Task Tracker</Heading>

        <Flex gap="2" wrap="wrap" justify="flex-end">
          {navItems.map((item) => (
            <Button
              key={item.path}
              size="sm"
              variant={location.pathname === item.path ? "solid" : "ghost"}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}

          <Button size="sm" variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
