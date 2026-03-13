import { Box, HStack, Checkbox } from "@chakra-ui/react"

export default function TaskCard({ task, toggle }) {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" mb={2}>
      <HStack>
    <Checkbox.Root
              checked={task.completed}
              onCheckedChange={(details) => toggle(task.id, details.checked)}
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
    </Box>
  )
}