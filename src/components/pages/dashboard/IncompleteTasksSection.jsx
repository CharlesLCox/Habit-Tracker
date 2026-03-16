import { Button, ButtonGroup, EmptyState, Heading, VStack } from "@chakra-ui/react"
import { Folder } from "lucide-react"
import TaskList from "../../tasks/TaskList"
import PrimaryButton from "../../ui/PrimaryButton"
import SurfacePanel from "../../ui/SurfacePanel"

export default function IncompleteTasksSection({
  isLoading,
  incompleteTasks,
  toggleTask,
  removeTask,
  reorderTask,
  onCreateTask,
  onGoOverview,
}) {
  return (
    <SurfacePanel>
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
          <EmptyState.Root size="lg" py={12}>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <Folder size={56} />
              </EmptyState.Indicator>
              <VStack textAlign="center" gap={1}>
                <EmptyState.Title>No tasks available</EmptyState.Title>
                <EmptyState.Description>
                  Think of something you&apos;d like to do and add your first task.
                </EmptyState.Description>
              </VStack>
              <ButtonGroup>
                <PrimaryButton onClick={onCreateTask}>Create task</PrimaryButton>
                <Button variant="outline" onClick={onGoOverview}>
                  Go to overview
                </Button>
              </ButtonGroup>
            </EmptyState.Content>
          </EmptyState.Root>
        )}
      </VStack>
    </SurfacePanel>
  )
}
