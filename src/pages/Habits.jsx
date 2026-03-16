import { useState } from "react"
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import HabitForm from "../components/habits/HabitForm"
import HabitList from "../components/habits/HabitList"
import useHabits from "../hooks/useHabits"

export default function Habits() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const { habits, isLoading, addHabit, completeHabitForDate } = useHabits()
  const selectedWeekday = dayjs(selectedDate).format("dddd")
  const filteredHabits = habits.filter((habit) => {
    return Array.isArray(habit.activeDays) && habit.activeDays.includes(selectedWeekday)
  })

  const days = Array.from({ length: 7 }, (_, index) => {
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

  return (
    <Box maxW="1200px" mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={6}>
        <Heading>Habits</Heading>

        <Box overflowX="auto" py={1}>
          <HStack w="fit-content" minW="100%" justify="center" gap={3}>
            {days.map((day) => {
              const isSelected = day.key === selectedDate

              return (
                <VStack
                  key={day.key}
                  as="button"
                  type="button"
                  minW={{ base: "78px", md: "96px" }}
                  px={3}
                  py={3}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={
                    isSelected ? "blue.500" : day.isToday ? "green.500" : "border"
                  }
                  bg={isSelected ? "blue.500" : "bg"}
                  color={isSelected ? "white" : "inherit"}
                  gap={0}
                  cursor="pointer"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDate(day.key)}
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {day.weekday}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" lineHeight="1.2">
                    {day.dayNumber}
                  </Text>
                  <Text fontSize="xs">{day.month}</Text>
                </VStack>
              )
            })}
          </HStack>
        </Box>

        <VStack align="stretch" gap={3}>
          <Text color="fg.muted" fontSize="sm">
            Habit cards
          </Text>
          <HabitForm onAdd={addHabit} />
          <HabitList
            habits={filteredHabits}
            isLoading={isLoading}
            selectedDate={selectedDate}
            onComplete={completeHabitForDate}
          />
        </VStack>
      </VStack>
    </Box>
  )
}
