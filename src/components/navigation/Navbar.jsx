import { Box, Button, Flex, Heading } from "@chakra-ui/react"
import { useLocation, useNavigate } from "react-router-dom"
import ProfileMenu from "./ProfileMenu"

export default function Navbar({ isSideNav = false }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: "Overview", path: "/overview" },
    { label: "Tasks", path: "/tasks" },
    { label: "Habits", path: "/habits" },
    { label: "Statistics", path: "/statistics" },
    { label: "Settings", path: "/settings" },
  ]

  function getNavButtonStyles(isSelected) {
    return {
      color: "white",
      bg: isSelected ? "whiteAlpha.300" : "transparent",
      borderWidth: "1px",
      borderColor: isSelected ? "whiteAlpha.500" : "transparent",
      _hover: {
        bg: isSelected ? "whiteAlpha.400" : "whiteAlpha.200",
      },
      _active: {
        bg: isSelected ? "whiteAlpha.500" : "whiteAlpha.300",
      },
    }
  }

  return (
    <Box
      borderBottomWidth={isSideNav ? "0" : "1px"}
      borderRightWidth={isSideNav ? "1px" : "0"}
      borderRadius={isSideNav ? "0 24px 24px 0" : undefined}
      px={isSideNav ? "4" : "6"}
      py="4"
      w={isSideNav ? "260px" : "100%"}
      minH={isSideNav ? "100vh" : "auto"}
      backgroundColor={"#00a08f"}
    >
      <Flex
        align={isSideNav ? "stretch" : "center"}
        justify={isSideNav ? "flex-start" : "space-between"}
        direction={isSideNav ? "column" : "row"}
        h="100%"
      >
        <Heading size="md" color="white">
          Task Tracker
        </Heading>

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
                  variant="ghost"
                  {...getNavButtonStyles(location.pathname === item.path)}
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
          </Flex>
        ) : (
          <Flex gap="2" wrap="wrap" justify="flex-end" align="center">
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
                  variant="ghost"
                  {...getNavButtonStyles(location.pathname === item.path)}
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

            <ProfileMenu />
          </Flex>
        )}
      </Flex>
    </Box>
  )
}
