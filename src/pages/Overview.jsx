import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import HabitList from "../components/habits/HabitList"
import TaskList from "../components/tasks/TaskList"
import useTasks from "../hooks/useTasks"
import { sampleHabits } from "../data/sampleHabits"

export default function Overview() {
  const { tasks, isLoading, toggleTask, removeTask, reorderTask } = useTasks()

  return (
    <Box maxW="1200px" mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={8}>
        <Heading>Overview</Heading>

        <VStack align="stretch" gap={3}>
          <Text color="fg.muted" fontSize="sm">
            Task cards
          </Text>
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            toggle={toggleTask}
            remove={removeTask}
            reorder={reorderTask}
          />
        </VStack>

        <VStack align="stretch" gap={3}>
          <Text color="fg.muted" fontSize="sm">
            Habit cards
          </Text>
          <HabitList habits={sampleHabits} />
        </VStack>
      </VStack>
    </Box>
  )
}
