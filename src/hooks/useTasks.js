import { useEffect, useState } from "react"
import { createTask, deleteTask, getTasks } from "../services/api"

export default function useTasks() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks()
        setTasks(data)
      } catch (error) {
        console.error("Failed to load tasks:", error)
      }
    }

    loadTasks()
  }, [])

  const addTask = async (title) => {
    try {
      const newTask = await createTask(title)
      setTasks((prev) => [...prev, newTask])
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const removeTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((task) => task.taskId !== taskId))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const toggleTask = (taskId, checked) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.taskId === taskId ? { ...task, completed: checked } : task
      )
    )
  }

  return { tasks, addTask, toggleTask, removeTask }
}