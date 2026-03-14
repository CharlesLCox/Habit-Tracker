import { Box, Button, Flex, Heading } from "@chakra-ui/react"
import { useLocation, useNavigate } from "react-router-dom"
import { logout } from "../../services/auth"

export default function Navbar({ isSideNav = false }) {
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
    <Box
      borderBottomWidth={isSideNav ? "0" : "1px"}
      borderRightWidth={isSideNav ? "1px" : "0"}
      px={isSideNav ? "4" : "6"}
      py="4"
      w={isSideNav ? "260px" : "100%"}
      minH={isSideNav ? "100vh" : "auto"}
    >
      <Flex
        align={isSideNav ? "stretch" : "center"}
        justify={isSideNav ? "flex-start" : "space-between"}
        direction={isSideNav ? "column" : "row"}
        h="100%"
      >
        <Heading size="md">Task Tracker</Heading>

        {isSideNav ? (
          <Flex direction="column" gap="2" mt="6" flex="1">
            {navItems.map((item, targetIndex) => {
              const currentIndex = navItems.findIndex(
                (navItem) => navItem.path === location.pathname
              )
              const slideDirection =
                currentIndex === -1 || targetIndex >= currentIndex ? 1 : -1

              return (
                <Button
                  key={item.path}
                  size="sm"
                  justifyContent="flex-start"
                  variant={location.pathname === item.path ? "solid" : "ghost"}
                  onClick={() => {
                    if (location.pathname === item.path) {
                      return
                    }

                    navigate(item.path, {
                      state: { slideDirection },
                    })
                  }}
                >
                  {item.label}
                </Button>
              )
            })}

            <Button
              size="sm"
              variant="outline"
              mt="auto"
              justifyContent="flex-start"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </Flex>
        ) : (
          <Flex gap="2" wrap="wrap" justify="flex-end">
            {navItems.map((item, targetIndex) => {
              const currentIndex = navItems.findIndex(
                (navItem) => navItem.path === location.pathname
              )
              const slideDirection =
                currentIndex === -1 || targetIndex >= currentIndex ? 1 : -1

              return (
                <Button
                  key={item.path}
                  size="sm"
                  variant={location.pathname === item.path ? "solid" : "ghost"}
                  onClick={() => {
                    if (location.pathname === item.path) {
                      return
                    }

                    navigate(item.path, {
                      state: { slideDirection },
                    })
                  }}
                >
                  {item.label}
                </Button>
              )
            })}

            <Button size="sm" variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  )
}
