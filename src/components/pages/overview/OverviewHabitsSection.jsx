import { Text, VStack } from "@chakra-ui/react"
import HabitList from "../../habits/HabitList"
import SurfacePanel from "../../ui/SurfacePanel"

export default function OverviewHabitsSection({
  habits,
  isHabitsLoading,
  todayDate,
  completeHabitForDate,
}) {
  return (
    <SurfacePanel>
      <VStack align="stretch" gap={3}>
        <Text color="fg.muted" fontSize="sm">
          Habit cards
        </Text>
        <HabitList
          habits={habits}
          isLoading={isHabitsLoading}
          selectedDate={todayDate}
          onComplete={completeHabitForDate}
        />
      </VStack>
    </SurfacePanel>
  )
}
