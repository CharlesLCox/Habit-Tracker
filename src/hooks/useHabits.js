import { useEffect, useState } from "react"
import { completeHabit, createHabit, getHabits } from "../services/api"

export default function useHabits() {
  const [habits, setHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHabits() {
      try {
        const data = await getHabits()
        setHabits(data)
      } catch (error) {
        console.error("Failed to load habits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHabits()
  }, [])

  const addHabit = async (habitInput) => {
    try {
      const newHabit = await createHabit(habitInput)
      setHabits((prev) => [newHabit, ...prev])
    } catch (error) {
      console.error("Failed to create habit:", error)
    }
  }

  const completeHabitForDate = async (habitId, date) => {
    if (!habitId || !date) {
      return false
    }

    try {
      const updatedHabit = await completeHabit(habitId, date)
      setHabits((prev) =>
        prev.map((habit) => (habit.habitId === habitId ? updatedHabit : habit))
      )
      return true
    } catch (error) {
      console.error("Failed to complete habit:", error)
      return false
    }
  }

  return { habits, isLoading, addHabit, completeHabitForDate }
}
