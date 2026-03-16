import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import TaskList from "../../tasks/TaskList"
import PrimaryButton from "../../ui/PrimaryButton"
import SurfacePanel from "../../ui/SurfacePanel"

export default function OverviewTasksSection({
  isLoading,
  tasksDueToday,
  toggleTask,
  removeTask,
  reorderTask,
  onCreateTask,
}) {
  return (
    <SurfacePanel>
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
          <Box borderWidth="1px" borderRadius="24px" p={{ base: 5, md: 6 }} bg="bg.subtle">
            <VStack align="stretch" gap={3}>
              <Heading size="sm">No tasks due today</Heading>
              <Text color="fg.muted" fontSize="sm">
                You are all clear for today. Create a new task to plan what is next.
              </Text>
              <PrimaryButton alignSelf="flex-start" onClick={onCreateTask}>
                Create task for today
              </PrimaryButton>
            </VStack>
          </Box>
        )}
      </VStack>
    </SurfacePanel>
  )
}
