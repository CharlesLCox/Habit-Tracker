import dayjs from "dayjs"

export function getIncompleteTasks(tasks = []) {
  return tasks.filter((task) => task.completed !== true)
}

export function getCompletedTasksWithinDays(tasks = [], days = 30) {
  const cutoffDate = dayjs().subtract(days, "day")

  return tasks
    .filter((task) => {
      if (task.completed !== true || !task.completedAt) {
        return false
      }

      const completedAt = dayjs(task.completedAt)
      if (!completedAt.isValid()) {
        return false
      }

      return completedAt.isAfter(cutoffDate) || completedAt.isSame(cutoffDate)
    })
    .sort((a, b) => {
      return dayjs(b.completedAt).valueOf() - dayjs(a.completedAt).valueOf()
    })
}
