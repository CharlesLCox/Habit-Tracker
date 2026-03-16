import { Heading, Text, VStack } from "@chakra-ui/react"
import TaskList from "../../tasks/TaskList"
import SurfacePanel from "../../ui/SurfacePanel"

export default function CompletedTasksSection({
  isLoading,
  completedTasksLast30Days,
  toggleTask,
  removeTask,
}) {
  return (
    <SurfacePanel>
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
    </SurfacePanel>
  )
}
