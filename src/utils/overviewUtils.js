import dayjs from "dayjs"

export function filterTasksDueOnDate(tasks = [], dateKey) {
  return tasks.filter((task) => {
    if (!task?.dueDate) {
      return false
    }

    const dueDate = dayjs(task.dueDate)
    if (!dueDate.isValid()) {
      return false
    }

    return dueDate.isSame(dateKey, "day")
  })
}
