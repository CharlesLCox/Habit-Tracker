import { Avatar, Button, HStack, Menu, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { getProfileName, logout } from "../../services/auth"

export default function ProfileMenu() {
  const navigate = useNavigate()
  const profileName = getProfileName()
  const profileInitial = profileName?.charAt(0)?.toUpperCase() || "U"

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="sm" px="2">
          <HStack gap="2">
            <Avatar.Root size="2xs">
              <Avatar.Fallback>{profileInitial}</Avatar.Fallback>
            </Avatar.Root>
            <Text fontSize="sm">{profileName}</Text>
          </HStack>
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content minW="200px">
          <Menu.Item value="profile" disabled>
            Profile (coming soon)
          </Menu.Item>
          <Menu.Item value="logout" onClick={handleLogout}>
            Log out
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}
