import {
  Badge,
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  NativeSelect,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"

const surfaceCardProps = {
  borderWidth: "1px",
  borderRadius: "2xl",
  p: { base: 4, md: 5 },
  bg: "white",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  transition: "transform 0.24s ease, box-shadow 0.24s ease",
  _hover: {
    transform: "translateY(-2px)",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.1)",
  },
}

export default function Settings() {
  const [settings, setSettings] = useState({
    displayName: "Task Tracker User",
    email: "you@example.com",
    timezone: "America/New_York",
    language: "English",
    theme: "System",
    accent: "Teal",
    reminderTime: "08:00",
    dueSoonAlert: "6h",
    weeklySummary: "Enabled",
    defaultPriority: "medium",
    weekStartsOn: "Monday",
    autoArchiveCompleted: "30",
  })
  const [saveMessage, setSaveMessage] = useState("")

  function updateSetting(key, value) {
    setSettings((previousSettings) => ({
      ...previousSettings,
      [key]: value,
    }))
  }

  function handleSave() {
    setSaveMessage(
      "Placeholder only: these settings are currently local UI values and not saved to the backend yet."
    )
  }

  return (
    <Box maxW="1200px" mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading mb={2}>Settings</Heading>
          <Text color="fg.muted">
            Configure your app preferences. These controls are placeholders for future backend
            settings support.
          </Text>
        </Box>

        <Box {...surfaceCardProps}>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between" align="center">
              <Heading size="md">Profile</Heading>
              <Badge colorPalette="blue" variant="subtle">
                Account
              </Badge>
            </HStack>

            <Field.Root>
              <Field.Label>Display Name</Field.Label>
              <Input
                value={settings.displayName}
                onChange={(event) => updateSetting("displayName", event.target.value)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input value={settings.email} disabled />
            </Field.Root>

            <Field.Root>
              <Field.Label>Timezone</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.timezone}
                  onChange={(event) => updateSetting("timezone", event.target.value)}
                >
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Chicago">America/Chicago</option>
                  <option value="America/Denver">America/Denver</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </VStack>
        </Box>

        <Box {...surfaceCardProps}>
          <VStack align="stretch" gap={4}>
            <Heading size="md">Appearance</Heading>

            <Field.Root>
              <Field.Label>Language</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.language}
                  onChange={(event) => updateSetting("language", event.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Theme</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.theme}
                  onChange={(event) => updateSetting("theme", event.target.value)}
                >
                  <option value="System">System</option>
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Accent Color</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.accent}
                  onChange={(event) => updateSetting("accent", event.target.value)}
                >
                  <option value="Teal">Teal</option>
                  <option value="Blue">Blue</option>
                  <option value="Green">Green</option>
                  <option value="Orange">Orange</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </VStack>
        </Box>

        <Box {...surfaceCardProps}>
          <VStack align="stretch" gap={4}>
            <Heading size="md">Notifications</Heading>

            <Field.Root>
              <Field.Label>Daily Reminder Time</Field.Label>
              <Input
                type="time"
                value={settings.reminderTime}
                onChange={(event) => updateSetting("reminderTime", event.target.value)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Due Soon Alert</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.dueSoonAlert}
                  onChange={(event) => updateSetting("dueSoonAlert", event.target.value)}
                >
                  <option value="off">Off</option>
                  <option value="1h">1 hour before</option>
                  <option value="6h">6 hours before</option>
                  <option value="24h">24 hours before</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Weekly Summary</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.weeklySummary}
                  onChange={(event) => updateSetting("weeklySummary", event.target.value)}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </VStack>
        </Box>

        <Box {...surfaceCardProps}>
          <VStack align="stretch" gap={4}>
            <Heading size="md">Task Defaults</Heading>

            <Field.Root>
              <Field.Label>Default Priority</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.defaultPriority}
                  onChange={(event) => updateSetting("defaultPriority", event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Week Starts On</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.weekStartsOn}
                  onChange={(event) => updateSetting("weekStartsOn", event.target.value)}
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Auto-Archive Completed Tasks (days)</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={settings.autoArchiveCompleted}
                  onChange={(event) =>
                    updateSetting("autoArchiveCompleted", event.target.value)
                  }
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="never">Never</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </VStack>
        </Box>

        <Box {...surfaceCardProps}>
          <VStack align="stretch" gap={4}>
            <Heading size="md">Data & Privacy</Heading>
            <Text color="fg.muted" fontSize="sm">
              Placeholder actions for export and account cleanup.
            </Text>
            <HStack wrap="wrap" gap={3}>
              <Button variant="outline">Export My Data</Button>
              <Button variant="outline">Clear Completed Tasks</Button>
              <Button variant="outline" colorPalette="red">
                Delete Account
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Separator borderColor="border.emphasized" />

        <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
          <Text color="fg.muted" fontSize="sm">
            {saveMessage || "Make any changes above, then save your placeholder settings."}
          </Text>
          <HStack gap={2}>
            <Button variant="outline" onClick={() => setSaveMessage("")}>
              Reset Notice
            </Button>
            <Button
              bg="#00a08f"
              color="white"
              _hover={{ bg: "#008c7d", transform: "translateY(-1px)" }}
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}
