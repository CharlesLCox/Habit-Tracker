import { useState } from "react"
import { Input, Button, HStack } from "@chakra-ui/react"

export default function TaskForm({ onAdd }) {
  const [task, setTask] = useState("")

  const handleSubmit = () => {
    if (!task) return
    onAdd(task)
    setTask("")
  }

  return (
    <HStack mb={4}>
      <Input
        placeholder="New task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <Button colorScheme="blue" onClick={handleSubmit}>
        Add
      </Button>
    </HStack>
  )
}