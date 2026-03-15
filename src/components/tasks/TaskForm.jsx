import { useState } from "react"
import { Alert, Button, HStack, Input, VStack } from "@chakra-ui/react"

export default function TaskForm({ onAdd }) {
  const [task, setTask] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = () => {
    const trimmedTask = task.trim()

    if (!trimmedTask) {
      setErrorMessage("You did not write a task yet.")
      return
    }

    setErrorMessage("")
    onAdd(trimmedTask)
    setTask("")
  }

  return (
    <VStack align="stretch" mb={4} gap={2}>
      <HStack>
        <Input
          placeholder="New task"
          value={task}
          onChange={(e) => {
            const nextValue = e.target.value
            setTask(nextValue)
            if (nextValue.trim()) {
              setErrorMessage("")
            }
          }}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Add
        </Button>
      </HStack>

      {errorMessage ? (
        <Alert.Root status="error" variant="surface">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}
    </VStack>
  )
}
