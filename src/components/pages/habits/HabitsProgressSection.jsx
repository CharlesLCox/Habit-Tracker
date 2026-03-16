import { Box, ProgressCircle, Text, VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import SurfacePanel from "../../ui/SurfacePanel"

export default function HabitsProgressSection({
  selectedDate,
  completionPercent,
  completedHabitsCount,
  totalHabitsCount,
  isFullyCompleted,
}) {
  return (
    <SurfacePanel p={{ base: 5, md: 6 }}>
      <VStack align="center" gap={3}>
        <Text color="fg.muted" fontSize="sm">
          Completion for {dayjs(selectedDate).format("MMM D, YYYY")}
        </Text>

        <ProgressCircle.Root value={completionPercent} colorPalette="green">
          <ProgressCircle.Circle
            css={{
              "--size": "220px",
              "--thickness": "16px",
            }}
          >
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" lineHeight="1">
              {completionPercent}%
            </Text>
          </Box>
        </ProgressCircle.Root>

        <Text fontSize="sm" color="fg.muted">
          {completedHabitsCount}/{totalHabitsCount} habits complete
        </Text>

        {isFullyCompleted ? (
          <Text color="green.600" fontWeight="semibold">
            All habits are done, good job!
          </Text>
        ) : null}
      </VStack>
    </SurfacePanel>
  )
}
