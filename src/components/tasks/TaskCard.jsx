import { Box, Checkbox, Text, HStack } from "@chakra-ui/react"

export default function TaskCard({ task, toggle }) {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" mb={2}>
      <HStack>
        <Checkbox
          isChecked={task.completed}
          onChange={() => toggle(task.id)}
        />
        <Text
          textDecoration={
            task.completed ? "line-through" : "none"
          }
        >
          {task.title}
        </Text>
      </HStack>
    </Box>
  )
}