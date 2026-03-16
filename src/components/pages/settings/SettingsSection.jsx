import { Badge, HStack, Heading, VStack } from "@chakra-ui/react"
import SurfacePanel from "../../ui/SurfacePanel"

export default function SettingsSection({ title, badge, children }) {
  return (
    <SurfacePanel>
      <VStack align="stretch" gap={4}>
        {title ? (
          <HStack justify="space-between" align="center">
            <Heading size="md">{title}</Heading>
            {badge ? (
              <Badge colorPalette="blue" variant="subtle">
                {badge}
              </Badge>
            ) : null}
          </HStack>
        ) : null}
        {children}
      </VStack>
    </SurfacePanel>
  )
}
