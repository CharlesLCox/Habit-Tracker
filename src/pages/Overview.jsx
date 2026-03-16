import { VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import OverviewHabitsSection from "../components/pages/overview/OverviewHabitsSection"
import OverviewTasksSection from "../components/pages/overview/OverviewTasksSection"
import PageHeader from "../components/ui/PageHeader"
import PageShell from "../components/ui/PageShell"
import useHabits from "../hooks/useHabits"
import useTasks from "../hooks/useTasks"
import { filterTasksDueOnDate } from "../utils/overviewUtils"

export default function Overview() {
  const navigate = useNavigate()
  const { tasks, isLoading, toggleTask, removeTask, reorderTask } = useTasks()
  const { habits, isLoading: isHabitsLoading, completeHabitForDate } = useHabits()
  const todayDate = dayjs().format("YYYY-MM-DD")
  const tasksDueToday = useMemo(
    () => filterTasksDueOnDate(tasks, todayDate),
    [tasks, todayDate]
  )

  return (
    <PageShell>
      <VStack align="stretch" gap={8}>
        <PageHeader
          title="Overview"
          subtitle="A quick snapshot of what is due today and which habits are active right now."
        />
        <OverviewTasksSection
          isLoading={isLoading}
          tasksDueToday={tasksDueToday}
          toggleTask={toggleTask}
          removeTask={removeTask}
          reorderTask={reorderTask}
          onCreateTask={() => navigate("/tasks")}
        />
        <OverviewHabitsSection
          habits={habits}
          isHabitsLoading={isHabitsLoading}
          todayDate={todayDate}
          completeHabitForDate={completeHabitForDate}
        />
      </VStack>
    </PageShell>
  )
}
