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
      onDragOver={onDragOver}
      onDrop={onDrop}
      borderColor={isDragOver ? "blue.400" : undefined}
      bg={isDragOver ? "blue.50" : undefined}
    >
      <HStack justify="space-between">
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
