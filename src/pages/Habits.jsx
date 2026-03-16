import { useState } from "react"
import { VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import HabitsCardsSection from "../components/pages/habits/HabitsCardsSection"
import HabitsProgressSection from "../components/pages/habits/HabitsProgressSection"
import HabitsTimelineSection from "../components/pages/habits/HabitsTimelineSection"
import PageHeader from "../components/ui/PageHeader"
import PageShell from "../components/ui/PageShell"
import useHabits from "../hooks/useHabits"
import {
  buildHabitTimelineDays,
  filterHabitsForWeekday,
  getHabitCompletionStatsForDate,
} from "../utils/habitsUtils"

export default function Habits() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const { habits, isLoading, addHabit, completeHabitForDate } = useHabits()
  const selectedWeekday = dayjs(selectedDate).format("dddd")
  const filteredHabits = filterHabitsForWeekday(habits, selectedWeekday)
  const { completedHabitsCount, totalHabitsCount, completionPercent, isFullyCompleted } =
    getHabitCompletionStatsForDate(filteredHabits, selectedDate)
  const days = buildHabitTimelineDays()

  return (
    <PageShell>
      <VStack align="stretch" gap={6}>
        <PageHeader
          title="Habits"
          subtitle="Build consistency day by day and track completion on your selected date."
        />
        <HabitsProgressSection
          selectedDate={selectedDate}
          completionPercent={completionPercent}
          completedHabitsCount={completedHabitsCount}
          totalHabitsCount={totalHabitsCount}
          isFullyCompleted={isFullyCompleted}
        />
        <HabitsTimelineSection
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <HabitsCardsSection
          filteredHabits={filteredHabits}
          isLoading={isLoading}
          selectedDate={selectedDate}
          completeHabitForDate={completeHabitForDate}
          addHabit={addHabit}
        />
      </VStack>
    </PageShell>
  )
}
