import { Box, Heading } from "@chakra-ui/react"
import TaskForm from "../components/tasks/TaskForm"
import TaskList from "../components/tasks/TaskList"
import useTasks from "../hooks/useTasks"


export default function Dashboard() {
    const { tasks, addTask, toggleTask } = useTasks()
  
    return (
      <Box maxW="600px" mx="auto" mt={10}>
        <Heading mb={6}>Task Tracker</Heading>
  
        <TaskForm onAdd={addTask} />
  
        <TaskList tasks={tasks} toggle={toggleTask} />
      </Box>
    )
  }