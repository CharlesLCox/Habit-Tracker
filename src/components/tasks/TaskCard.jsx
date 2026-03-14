import { Box, HStack, Checkbox, Button } from "@chakra-ui/react"

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
      p={3}
      borderWidth="1px"
      borderRadius="md"
      mb={2}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      borderColor={isDragOver ? "blue.400" : undefined}
      bg={isDragOver ? "blue.50" : undefined}
      cursor={draggable ? "grab" : "default"}
      _active={draggable ? { cursor: "grabbing" } : undefined}
    >
      <HStack justify="space-between">
        <Checkbox.Root
          checked={task.completed}
          onCheckedChange={(details) => toggle(task.taskId, details.checked)}
        >
          <Checkbox.Control />
          <Checkbox.Label
            textDecoration={task.completed ? "line-through" : "none"}
          >
            {task.title}
          </Checkbox.Label>
        </Checkbox.Root>

        <Button
          size="xs"
          colorScheme="red"
          variant="outline"
          onClick={() => remove(task.taskId)}
        >
          Delete
        </Button>
      </HStack>
    </Box>
  )
}
