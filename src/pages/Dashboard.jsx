import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import { useMemo } from "react"
import TaskForm from "../components/tasks/TaskForm"
import TaskList from "../components/tasks/TaskList"
import useTasks from "../hooks/useTasks"

export default function Dashboard() {
  const { tasks, isLoading, addTask, toggleTask, removeTask, reorderTask } = useTasks()
  const completedCutoff = useMemo(() => dayjs().subtract(30, "day"), [])

  const incompleteTasks = useMemo(() => {
    return tasks.filter((task) => task.completed !== true)
  }, [tasks])

  const completedTasksLast30Days = useMemo(() => {
    return tasks
      .filter((task) => {
        if (task.completed !== true || !task.completedAt) {
          return false
        }

        const completedAt = dayjs(task.completedAt)
        if (!completedAt.isValid()) {
          return false
        }

        return completedAt.isAfter(completedCutoff) || completedAt.isSame(completedCutoff)
      })
      .sort((a, b) => {
        return dayjs(b.completedAt).valueOf() - dayjs(a.completedAt).valueOf()
      })
  }, [completedCutoff, tasks])

  return (
    <Box maxW="1200px" mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      <Heading mb={6}>My Tasks</Heading>
      <TaskForm onAdd={addTask} />

      <VStack align="stretch" gap={8} mt={6}>
        <VStack align="stretch" gap={3}>
          <Heading size="md">Incomplete</Heading>
          {isLoading || incompleteTasks.length > 0 ? (
            <TaskList
              tasks={incompleteTasks}
              isLoading={isLoading}
              toggle={toggleTask}
              remove={removeTask}
              reorder={reorderTask}
            />
          ) : (
            <Text color="fg.muted" fontSize="sm">
              No incomplete tasks.
            </Text>
          )}
        </VStack>

        <VStack align="stretch" gap={3}>
          <Heading size="md">Completed In Last 30 Days</Heading>
          {isLoading || completedTasksLast30Days.length > 0 ? (
            <TaskList
              tasks={completedTasksLast30Days}
              isLoading={isLoading}
              toggle={toggleTask}
              remove={removeTask}
            />
          ) : (
            <Text color="fg.muted" fontSize="sm">
              No tasks completed in the last 30 days.
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  )
}
