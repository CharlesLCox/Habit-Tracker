import { useEffect, useState } from "react"
import { createTask, deleteTask, getTasks } from "../services/api"

export default function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks()
        setTasks(data)
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  const addTask = async (taskInput) => {
    try {
      const newTask = await createTask(taskInput)
      setTasks((prev) => [newTask, ...prev])
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

  const reorderTask = (draggedTaskId, targetTaskId) => {
    if (!draggedTaskId || !targetTaskId || draggedTaskId === targetTaskId) {
      return
    }

    setTasks((prev) => {
      const draggedIndex = prev.findIndex((task) => task.taskId === draggedTaskId)
      const targetIndex = prev.findIndex((task) => task.taskId === targetTaskId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev
      }

      const next = [...prev]
      const [movedTask] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, movedTask)
      return next
    })
  }

  return { tasks, isLoading, addTask, toggleTask, removeTask, reorderTask }
}
