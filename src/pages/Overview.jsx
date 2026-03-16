import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import HabitList from "../components/habits/HabitList"
import TaskList from "../components/tasks/TaskList"
import useHabits from "../hooks/useHabits"
import useTasks from "../hooks/useTasks"

export default function Overview() {
  const navigate = useNavigate()
  const { tasks, isLoading, toggleTask, removeTask, reorderTask } = useTasks()
  const { habits, isLoading: isHabitsLoading, completeHabitForDate } = useHabits()
  const todayDate = dayjs().format("YYYY-MM-DD")
  const tasksDueToday = useMemo(() => {
    return tasks.filter((task) => {
      if (!task?.dueDate) {
        return false
      }

      const dueDate = dayjs(task.dueDate)
      if (!dueDate.isValid()) {
        return false
      }

      return dueDate.isSame(todayDate, "day")
    })
  }, [tasks, todayDate])

  return (
    <Box maxW="1200px" mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={8}>
        <Heading>Overview</Heading>

        <VStack align="stretch" gap={3}>
          <Text color="fg.muted" fontSize="sm">
            Task cards
          </Text>
          {isLoading || tasksDueToday.length > 0 ? (
            <TaskList
              tasks={tasksDueToday}
              isLoading={isLoading}
              toggle={toggleTask}
              remove={removeTask}
              reorder={reorderTask}
            />
          ) : (
            <Box
              borderWidth="1px"
              borderRadius="24px"
              p={{ base: 5, md: 6 }}
              bg="bg.subtle"
            >
              <VStack align="stretch" gap={3}>
                <Heading size="sm">No tasks due today</Heading>
                <Text color="fg.muted" fontSize="sm">
                  You are all clear for today. Create a new task to plan what is next.
                </Text>
                <Button
                  alignSelf="flex-start"
                  bg="#00a08f"
                  color="white"
                  _hover={{ bg: "#008c7d" }}
                  onClick={() => navigate("/tasks")}
                >
                  Create task for today
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>

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
      </VStack>
    </Box>
  )
}
