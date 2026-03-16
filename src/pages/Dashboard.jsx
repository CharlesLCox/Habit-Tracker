import { Separator, VStack } from "@chakra-ui/react"
import { useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import CompletedTasksSection from "../components/pages/dashboard/CompletedTasksSection"
import IncompleteTasksSection from "../components/pages/dashboard/IncompleteTasksSection"
import PageHeader from "../components/ui/PageHeader"
import PageShell from "../components/ui/PageShell"
import TaskForm from "../components/tasks/TaskForm"
import useTasks from "../hooks/useTasks"
import {
  getCompletedTasksWithinDays,
  getIncompleteTasks,
} from "../utils/dashboardUtils"

export default function Dashboard() {
  const navigate = useNavigate()
  const taskFormRef = useRef(null)
  const { tasks, isLoading, addTask, toggleTask, removeTask, reorderTask } = useTasks()
  const incompleteTasks = useMemo(() => getIncompleteTasks(tasks), [tasks])
  const completedTasksLast30Days = useMemo(
    () => getCompletedTasksWithinDays(tasks, 30),
    [tasks]
  )

  return (
    <PageShell>
      <PageHeader
        title="My Tasks"
        subtitle="Plan what is next, complete what matters, and keep your recent wins visible."
        mb={6}
      />
      <TaskForm ref={taskFormRef} onAdd={addTask} />

      <VStack align="stretch" gap={8} mt={6}>
        <IncompleteTasksSection
          isLoading={isLoading}
          incompleteTasks={incompleteTasks}
          toggleTask={toggleTask}
          removeTask={removeTask}
          reorderTask={reorderTask}
          onCreateTask={() => {
            taskFormRef.current?.openForm()
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }}
          onGoOverview={() => navigate("/overview")}
        />

        <Separator borderColor="border.emphasized" />

        <CompletedTasksSection
          isLoading={isLoading}
          completedTasksLast30Days={completedTasksLast30Days}
          toggleTask={toggleTask}
          removeTask={removeTask}
        />
      </VStack>
    </PageShell>
  )
}
