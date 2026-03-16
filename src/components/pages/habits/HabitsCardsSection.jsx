import { Text, VStack } from "@chakra-ui/react"
import HabitForm from "../../habits/HabitForm"
import HabitList from "../../habits/HabitList"
import SurfacePanel from "../../ui/SurfacePanel"

export default function HabitsCardsSection({
  filteredHabits,
  isLoading,
  selectedDate,
  completeHabitForDate,
  addHabit,
}) {
  return (
    <SurfacePanel>
      <VStack align="stretch" gap={3}>
        <Text color="fg.muted" fontSize="sm">
          Habit cards
        </Text>
        <HabitForm onAdd={addHabit} />
        <HabitList
          habits={filteredHabits}
          isLoading={isLoading}
          selectedDate={selectedDate}
          onComplete={completeHabitForDate}
        />
      </VStack>
    </SurfacePanel>
  )
}
