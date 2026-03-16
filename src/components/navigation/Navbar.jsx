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
      color: isSelected ? "#006f63" : "white",
      bg: isSelected ? "white" : "transparent",
      borderWidth: "1px",
      borderColor: isSelected ? "whiteAlpha.900" : "whiteAlpha.300",
      borderRadius: "full",
      fontWeight: "semibold",
      _hover: {
        bg: isSelected ? "whiteAlpha.900" : "whiteAlpha.200",
      },
      _active: {
        bg: isSelected ? "whiteAlpha.800" : "whiteAlpha.300",
      },
    }
  }

  return (
    <Box
      position={isSideNav ? "sticky" : "sticky"}
      top="0"
      zIndex="banner"
      borderBottomWidth={isSideNav ? "0" : "1px"}
      borderRightWidth={isSideNav ? "1px" : "0"}
      borderColor="whiteAlpha.400"
      borderRadius={isSideNav ? "0 24px 24px 0" : "0 0 20px 20px"}
      px={isSideNav ? "4" : "6"}
      py="4"
      w={isSideNav ? "260px" : "100%"}
      minH={isSideNav ? "100vh" : "auto"}
      background="linear-gradient(160deg, #00a08f 0%, #008f80 100%)"
      boxShadow="0 10px 28px rgba(0, 66, 60, 0.16)"
      backdropFilter="blur(6px)"
    >
      <Flex
        align={isSideNav ? "stretch" : "center"}
        justify={isSideNav ? "flex-start" : "space-between"}
        direction={isSideNav ? "column" : "row"}
        h="100%"
      >
        <Heading size="md" color="white" letterSpacing="tight">
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
