import { useState } from "react"
import { v4 as uuid } from "uuid"

export default function useTasks() {
  const [tasks, setTasks] = useState([])

  const addTask = (title) => {
    const newTask = {
      id: uuid(),
      title,
      completed: false
    }

    setTasks([...tasks, newTask])
  }

  const toggleTask = (id, checked) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: checked }
          : task
      )
    )
  }

  return { tasks, addTask, toggleTask }
}