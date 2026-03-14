import { Box, HStack, Checkbox, Button } from "@chakra-ui/react"

export default function TaskCard({ task, toggle, remove }) {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" mb={2}>
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
