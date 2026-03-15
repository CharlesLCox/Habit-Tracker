import { Box, HStack, Checkbox, Button, Dialog, Icon, Portal } from "@chakra-ui/react"

export default function TaskCard({
  task,
  toggle,
  remove,
  draggable = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="30px"
      minH="250px"
      display="flex"
      alignItems="center"
      onDragOver={onDragOver}
      onDrop={onDrop}
      borderColor={isDragOver ? "blue.400" : undefined}
      bg={isDragOver ? "blue.50" : undefined}
      w="100%"
    >
      <HStack justify="space-between" w="100%">
        <HStack gap={3}>
          <Box
            as="span"
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            cursor={draggable ? "grab" : "default"}
            _active={draggable ? { cursor: "grabbing" } : undefined}
            userSelect="none"
            title={draggable ? "Drag to reorder" : undefined}
            color="gray.500"
            fontWeight="bold"
            px={1}
          >
            ::
          </Box>

          <Checkbox.Root
            checked={task.completed === true}
            onCheckedChange={(details) =>
              toggle(task.taskId, details.checked === true)
            }
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label
              textDecoration={task.completed ? "line-through" : "none"}
            >
              {task.title}
            </Checkbox.Label>
          </Checkbox.Root>
        </HStack>

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button
              size="xs"
              colorScheme="red"
              variant="outline"
              aria-label="Delete task"
            >
              <Icon viewBox="0 0 24 24" boxSize={4} color="red.500">
                <path
                  fill="currentColor"
                  d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9zm2 2h2v0h-2zm-3 2h8v12H8V7zm2 2a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1zm4 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1z"
                />
              </Icon>
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete task?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Dialog.Description>
                    Are you sure you want to delete "{task.title}"?
                  </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Dialog.ActionTrigger asChild>
                    <Button
                      colorScheme="red"
                      onClick={() => remove(task.taskId)}
                    >
                      Confirm delete
                    </Button>
                  </Dialog.ActionTrigger>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </HStack>
    </Box>
  )
}
