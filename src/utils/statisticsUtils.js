import dayjs from "dayjs"

function toDateKey(value) {
  const parsed = dayjs(value)
  if (!parsed.isValid()) {
    return null
  }

  return parsed.format("YYYY-MM-DD")
}

function buildCountMap(dateKeys) {
  return dateKeys.reduce((map, dateKey) => {
    if (!dateKey) {
      return map
    }

    map.set(dateKey, (map.get(dateKey) || 0) + 1)
    return map
  }, new Map())
}

function calculateCurrentStreak(dateSet, startDateKey) {
  let streak = 0
  let cursor = dayjs(startDateKey)

  while (dateSet.has(cursor.format("YYYY-MM-DD"))) {
    streak += 1
    cursor = cursor.subtract(1, "day")
  }

  return streak
}

export function buildStatisticsAnalytics(tasks = [], habits = []) {
  const today = dayjs().startOf("day")
  const todayKey = today.format("YYYY-MM-DD")
  const todayWeekday = today.format("dddd")

  const completedTasks = tasks.filter((task) => task.completed === true)
  const taskCompletionDateKeys = completedTasks
    .map((task) => toDateKey(task.completedAt))
    .filter(Boolean)
  const habitCompletionDateKeys = habits
    .flatMap((habit) => (Array.isArray(habit.completedDates) ? habit.completedDates : []))
    .map((dateKey) => toDateKey(dateKey))
    .filter(Boolean)

  const completedTaskCount = completedTasks.length
  const totalTaskCount = tasks.length
  const taskCompletionRate =
    totalTaskCount === 0 ? 0 : Math.round((completedTaskCount / totalTaskCount) * 100)

  const completedHabitsToday = habits.filter((habit) => {
    return Array.isArray(habit.completedDates) && habit.completedDates.includes(todayKey)
  }).length
  const activeHabitsToday = habits.filter((habit) => {
    return Array.isArray(habit.activeDays) && habit.activeDays.includes(todayWeekday)
  }).length
  const habitTodayRate =
    activeHabitsToday === 0 ? 0 : Math.round((completedHabitsToday / activeHabitsToday) * 100)

  const taskCompletedWithDueDate = completedTasks.filter((task) => {
    return toDateKey(task.dueDate) && toDateKey(task.completedAt)
  })
  const onTimeCompletedTaskCount = taskCompletedWithDueDate.filter((task) => {
    return dayjs(task.completedAt).valueOf() <= dayjs(task.dueDate).valueOf()
  }).length
  const onTimeRate =
    taskCompletedWithDueDate.length === 0
      ? 0
      : Math.round((onTimeCompletedTaskCount / taskCompletedWithDueDate.length) * 100)

  const taskStreak = calculateCurrentStreak(new Set(taskCompletionDateKeys), todayKey)
  const productiveDateSet = new Set([...taskCompletionDateKeys, ...habitCompletionDateKeys])
  const productiveStreak = calculateCurrentStreak(productiveDateSet, todayKey)

  const taskCountByDate = buildCountMap(taskCompletionDateKeys)
  const habitCountByDate = buildCountMap(habitCompletionDateKeys)
  const dailySeries = Array.from({ length: 14 }, (_, index) => {
    const date = today.subtract(13 - index, "day")
    const key = date.format("YYYY-MM-DD")

    return {
      key,
      label: date.format("ddd"),
      taskCount: taskCountByDate.get(key) || 0,
      habitCount: habitCountByDate.get(key) || 0,
    }
  })
  const maxDailyCount = Math.max(
    1,
    ...dailySeries.map((entry) => Math.max(entry.taskCount, entry.habitCount))
  )

  const weeklyCountMap = new Map()
  ;[...taskCompletionDateKeys, ...habitCompletionDateKeys].forEach((dateKey) => {
    const weekKey = dayjs(dateKey).startOf("week").format("YYYY-MM-DD")
    weeklyCountMap.set(weekKey, (weeklyCountMap.get(weekKey) || 0) + 1)
  })

  const weeklySeries = Array.from({ length: 8 }, (_, index) => {
    const weekStart = today.startOf("week").subtract(7 - index, "week")
    const weekKey = weekStart.format("YYYY-MM-DD")

    return {
      key: weekKey,
      label: weekStart.format("MMM D"),
      count: weeklyCountMap.get(weekKey) || 0,
    }
  })
  const maxWeeklyCount = Math.max(1, ...weeklySeries.map((entry) => entry.count))

  const categoryOrder = ["Health", "Learning", "Productivity", "Social", "Selfcare"]
  const categoryCountMap = new Map(categoryOrder.map((category) => [category, 0]))
  completedTasks.forEach((task) => {
    const category = task.category || "Productivity"
    categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1)
  })
  habits.forEach((habit) => {
    const category = habit.category || "Selfcare"
    const completedCount = Array.isArray(habit.completedDates)
      ? habit.completedDates.length
      : 0
    categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + completedCount)
  })

  const categorySeries = Array.from(categoryCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
  const maxCategoryCount = Math.max(1, ...categorySeries.map((entry) => entry.count))

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weekdayCounts = Array.from({ length: 7 }, () => 0)
  habitCompletionDateKeys.forEach((dateKey) => {
    const weekdayIndex = dayjs(dateKey).day()
    weekdayCounts[weekdayIndex] += 1
  })
  const weekdaySeries = weekdayLabels.map((label, index) => ({
    label,
    count: weekdayCounts[index],
  }))
  const maxWeekdayCount = Math.max(1, ...weekdaySeries.map((entry) => entry.count))

  return {
    completedTaskCount,
    totalTaskCount,
    taskCompletionRate,
    completedHabitsToday,
    activeHabitsToday,
    habitTodayRate,
    onTimeRate,
    taskStreak,
    productiveStreak,
    dailySeries,
    maxDailyCount,
    weeklySeries,
    maxWeeklyCount,
    categorySeries,
    maxCategoryCount,
    weekdaySeries,
    maxWeekdayCount,
    hasAnyData: totalTaskCount > 0 || habits.length > 0,
  }
}
