import {
  Box,
  EmptyState,
  HStack,
  ProgressCircle,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react"
import { BarChart3, CheckCircle2, Flame, ListChecks } from "lucide-react"
import { useMemo } from "react"
import PageHeader from "../components/ui/PageHeader"
import PageShell from "../components/ui/PageShell"
import SurfacePanel from "../components/ui/SurfacePanel"
import useHabits from "../hooks/useHabits"
import useTasks from "../hooks/useTasks"
import { buildStatisticsAnalytics } from "../utils/statisticsUtils"

export default function Statistics() {
  const { tasks, isLoading: isTasksLoading } = useTasks()
  const { habits, isLoading: isHabitsLoading } = useHabits()
  const isLoading = isTasksLoading || isHabitsLoading

  const analytics = useMemo(() => buildStatisticsAnalytics(tasks, habits), [tasks, habits])

  return (
    <PageShell>
      <VStack align="stretch" gap={6}>
        <PageHeader
          title="Statistics"
          subtitle="Track your trends and progress over time. Detailed analytics will appear here."
        />

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {Array.from({ length: 6 }, (_, index) => (
              <SurfacePanel key={`stats-skeleton-${index}`} p={{ base: 6, md: 8 }}>
                <Skeleton h="200px" borderRadius="xl" />
              </SurfacePanel>
            ))}
          </SimpleGrid>
        ) : !analytics.hasAnyData ? (
          <SurfacePanel p={{ base: 6, md: 8 }}>
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
          </SurfacePanel>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={4}>
              <SurfacePanel p={4}>
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
              </SurfacePanel>

              <SurfacePanel p={4}>
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
              </SurfacePanel>

              <SurfacePanel p={4}>
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
              </SurfacePanel>

              <SurfacePanel p={4}>
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
              </SurfacePanel>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
              <SurfacePanel p={{ base: 6, md: 8 }}>
                <VStack align="stretch" gap={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Completions in Last 14 Days
                  </Text>
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
              </SurfacePanel>

              <SurfacePanel p={{ base: 6, md: 8 }}>
                <VStack align="stretch" gap={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Weekly Completion Trend (8 Weeks)
                  </Text>
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
              </SurfacePanel>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
              <SurfacePanel p={{ base: 6, md: 8 }}>
                <VStack align="stretch" gap={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Completion by Category
                  </Text>
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
              </SurfacePanel>

              <SurfacePanel p={{ base: 6, md: 8 }}>
                <VStack align="stretch" gap={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Habit Completions by Weekday
                  </Text>
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
              </SurfacePanel>
            </SimpleGrid>
          </>
        )}
      </VStack>
    </PageShell>
  )
}
