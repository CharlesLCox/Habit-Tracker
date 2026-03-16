import {
  Box,
  EmptyState,
  Heading,
  HStack,
  ProgressCircle,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react"
import dayjs from "dayjs"
import { BarChart3, CheckCircle2, Flame, ListChecks } from "lucide-react"
import { useMemo } from "react"
import useHabits from "../hooks/useHabits"
import useTasks from "../hooks/useTasks"

const surfaceCardProps = {
  borderWidth: "1px",
  borderRadius: "2xl",
  bg: "white",
  p: { base: 6, md: 8 },
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  transition: "transform 0.24s ease, box-shadow 0.24s ease",
  _hover: {
    transform: "translateY(-2px)",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.1)",
  },
}

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

export default function Statistics() {
  const { tasks, isLoading: isTasksLoading } = useTasks()
  const { habits, isLoading: isHabitsLoading } = useHabits()
  const isLoading = isTasksLoading || isHabitsLoading

  const analytics = useMemo(() => {
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
      activeHabitsToday === 0
        ? 0
        : Math.round((completedHabitsToday / activeHabitsToday) * 100)

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
  }, [habits, tasks])

  return (
    <Box maxW="1200px" mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={6}>
        <VStack align="stretch" gap={1}>
          <Heading>Statistics</Heading>
          <Text color="fg.muted">
            Track your trends and progress over time. Detailed analytics will appear here.
          </Text>
        </VStack>

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {Array.from({ length: 6 }, (_, index) => (
              <Box key={`stats-skeleton-${index}`} {...surfaceCardProps}>
                <Skeleton h="200px" borderRadius="xl" />
              </Box>
            ))}
          </SimpleGrid>
        ) : !analytics.hasAnyData ? (
          <Box {...surfaceCardProps}>
            <EmptyState.Root size="lg">
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <BarChart3 size={56} />
                </EmptyState.Indicator>
                <VStack textAlign="center" gap={1}>
                  <EmptyState.Title>No statistics yet</EmptyState.Title>
                  <EmptyState.Description>
                    Keep completing tasks and habits to unlock trend insights.
                  </EmptyState.Description>
                </VStack>
              </EmptyState.Content>
            </EmptyState.Root>
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={4}>
              <Box {...surfaceCardProps} p={4}>
                <VStack align="stretch" gap={2}>
                  <HStack color="fg.muted" fontSize="sm">
                    <ListChecks size={16} />
                    <Text>Completed Tasks</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                    {analytics.completedTaskCount}/{analytics.totalTaskCount}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {analytics.taskCompletionRate}% completion rate
                  </Text>
                </VStack>
              </Box>

              <Box {...surfaceCardProps} p={4}>
                <VStack align="stretch" gap={2}>
                  <HStack color="fg.muted" fontSize="sm">
                    <CheckCircle2 size={16} />
                    <Text>Habits Today</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                    {analytics.completedHabitsToday}/{analytics.activeHabitsToday}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {analytics.habitTodayRate}% complete today
                  </Text>
                </VStack>
              </Box>

              <Box {...surfaceCardProps} p={4}>
                <VStack align="stretch" gap={2}>
                  <HStack color="fg.muted" fontSize="sm">
                    <Flame size={16} />
                    <Text>Task Streak</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                    {analytics.taskStreak} day{analytics.taskStreak === 1 ? "" : "s"}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    Productive streak: {analytics.productiveStreak} day
                    {analytics.productiveStreak === 1 ? "" : "s"}
                  </Text>
                </VStack>
              </Box>

              <Box {...surfaceCardProps} p={4}>
                <VStack align="stretch" gap={2}>
                  <Text color="fg.muted" fontSize="sm">
                    On-Time Completion
                  </Text>
                  <HStack justify="space-between" align="center">
                    <ProgressCircle.Root value={analytics.onTimeRate} colorPalette="green">
                      <ProgressCircle.Circle
                        css={{
                          "--size": "70px",
                          "--thickness": "8px",
                        }}
                      >
                        <ProgressCircle.Track />
                        <ProgressCircle.Range />
                      </ProgressCircle.Circle>
                      <ProgressCircle.ValueText
                        position="absolute"
                        inset={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {analytics.onTimeRate}%
                      </ProgressCircle.ValueText>
                    </ProgressCircle.Root>
                    <Text color="fg.muted" fontSize="sm" maxW="130px" textAlign="right">
                      Completed before due date
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
              <Box {...surfaceCardProps}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm">Completions in Last 14 Days</Heading>
                  <HStack align="end" justify="space-between" h="210px" gap={2}>
                    {analytics.dailySeries.map((entry) => {
                      const taskHeight = Math.max(
                        4,
                        (entry.taskCount / analytics.maxDailyCount) * 150
                      )
                      const habitHeight = Math.max(
                        4,
                        (entry.habitCount / analytics.maxDailyCount) * 150
                      )

                      return (
                        <VStack key={entry.key} gap={1} flex="1">
                          <HStack align="end" h="160px" gap={1}>
                            <Box
                              w="8px"
                              h={`${taskHeight}px`}
                              borderRadius="full"
                              bg="#00a08f"
                              opacity={entry.taskCount > 0 ? 1 : 0.2}
                              title={`${entry.label}: ${entry.taskCount} completed tasks`}
                            />
                            <Box
                              w="8px"
                              h={`${habitHeight}px`}
                              borderRadius="full"
                              bg="blue.500"
                              opacity={entry.habitCount > 0 ? 1 : 0.2}
                              title={`${entry.label}: ${entry.habitCount} completed habits`}
                            />
                          </HStack>
                          <Text fontSize="xs" color="fg.muted">
                            {entry.label}
                          </Text>
                        </VStack>
                      )
                    })}
                  </HStack>
                  <HStack gap={4} color="fg.muted" fontSize="xs">
                    <HStack gap={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg="#00a08f" />
                      <Text>Tasks</Text>
                    </HStack>
                    <HStack gap={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg="blue.500" />
                      <Text>Habits</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              <Box {...surfaceCardProps}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm">Weekly Completion Trend (8 Weeks)</Heading>
                  <VStack align="stretch" gap={3}>
                    {analytics.weeklySeries.map((entry) => {
                      const widthPercent = (entry.count / analytics.maxWeeklyCount) * 100
                      return (
                        <VStack key={entry.key} align="stretch" gap={1}>
                          <HStack justify="space-between" fontSize="xs" color="fg.muted">
                            <Text>Week of {entry.label}</Text>
                            <Text>{entry.count}</Text>
                          </HStack>
                          <Box h="10px" borderRadius="full" bg="blackAlpha.100" overflow="hidden">
                            <Box
                              h="100%"
                              w={`${Math.max(widthPercent, entry.count > 0 ? 6 : 0)}%`}
                              bg="#00a08f"
                              borderRadius="full"
                            />
                          </Box>
                        </VStack>
                      )
                    })}
                  </VStack>
                </VStack>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
              <Box {...surfaceCardProps}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm">Completion by Category</Heading>
                  <VStack align="stretch" gap={3}>
                    {analytics.categorySeries.map((entry) => {
                      const widthPercent = (entry.count / analytics.maxCategoryCount) * 100

                      return (
                        <VStack key={entry.category} align="stretch" gap={1}>
                          <HStack justify="space-between" fontSize="sm">
                            <Text>{entry.category}</Text>
                            <Text color="fg.muted">{entry.count}</Text>
                          </HStack>
                          <Box h="10px" borderRadius="full" bg="blackAlpha.100" overflow="hidden">
                            <Box
                              h="100%"
                              w={`${Math.max(widthPercent, entry.count > 0 ? 6 : 0)}%`}
                              bg="#00a08f"
                              borderRadius="full"
                            />
                          </Box>
                        </VStack>
                      )
                    })}
                  </VStack>
                </VStack>
              </Box>

              <Box {...surfaceCardProps}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm">Habit Completions by Weekday</Heading>
                  <SimpleGrid columns={7} gap={2}>
                    {analytics.weekdaySeries.map((entry) => {
                      const intensity = entry.count / analytics.maxWeekdayCount
                      const alpha = 0.18 + intensity * 0.72

                      return (
                        <VStack key={entry.label} gap={1}>
                          <Box
                            w="100%"
                            minW="40px"
                            h="70px"
                            borderRadius="lg"
                            bg={`rgba(0, 160, 143, ${alpha})`}
                            borderWidth="1px"
                            borderColor="blackAlpha.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontWeight="bold">{entry.count}</Text>
                          </Box>
                          <Text fontSize="xs" color="fg.muted">
                            {entry.label}
                          </Text>
                        </VStack>
                      )
                    })}
                  </SimpleGrid>
                </VStack>
              </Box>
            </SimpleGrid>
          </>
        )}
      </VStack>
    </Box>
  )
}
