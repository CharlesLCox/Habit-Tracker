import dayjs from "dayjs"

export function buildHabitTimelineDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3
    const date = dayjs().add(offset, "day")

    return {
      key: date.format("YYYY-MM-DD"),
      weekday: date.format("ddd"),
      dayNumber: date.format("D"),
      month: date.format("MMM"),
      isToday: offset === 0,
    }
  })
}

export function filterHabitsForWeekday(habits = [], weekday) {
  return habits.filter((habit) => {
    return Array.isArray(habit.activeDays) && habit.activeDays.includes(weekday)
  })
}

export function getHabitCompletionStatsForDate(habits = [], dateKey) {
  const completedHabitsCount = habits.filter((habit) => {
    return Array.isArray(habit.completedDates) && habit.completedDates.includes(dateKey)
  }).length
  const totalHabitsCount = habits.length
  const completionPercent =
    totalHabitsCount === 0 ? 0 : Math.round((completedHabitsCount / totalHabitsCount) * 100)
  const isFullyCompleted = totalHabitsCount > 0 && completionPercent === 100

  return {
    completedHabitsCount,
    totalHabitsCount,
    completionPercent,
    isFullyCompleted,
  }
}
