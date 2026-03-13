import { Box, Heading } from "@chakra-ui/react"
import TaskForm from "../components/tasks/TaskForm"
import TaskList from "../components/tasks/TaskList"

export default function Dashboard() {
  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <Heading mb={6}>Task Tracker Test</Heading>
      <TaskForm />
      <TaskList />
    </Box>
  )
}