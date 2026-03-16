import { useState } from "react"
import { Box, Heading, HStack, ProgressCircle, Text, VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import HabitForm from "../components/habits/HabitForm"
import HabitList from "../components/habits/HabitList"
import useHabits from "../hooks/useHabits"

const surfaceCardProps = {
  borderWidth: "1px",
  borderRadius: "2xl",
  bg: "white",
  p: { base: 4, md: 5 },
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  transition: "transform 0.24s ease, box-shadow 0.24s ease",
  _hover: {
    transform: "translateY(-2px)",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.1)",
  },
}

export default function Habits() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const { habits, isLoading, addHabit, completeHabitForDate } = useHabits()
  const selectedWeekday = dayjs(selectedDate).format("dddd")
  const filteredHabits = habits.filter((habit) => {
    return Array.isArray(habit.activeDays) && habit.activeDays.includes(selectedWeekday)
  })
  const completedHabitsCount = filteredHabits.filter((habit) => {
    return Array.isArray(habit.completedDates) && habit.completedDates.includes(selectedDate)
  }).length
  const totalHabitsCount = filteredHabits.length
  const completionPercent =
    totalHabitsCount === 0 ? 0 : Math.round((completedHabitsCount / totalHabitsCount) * 100)
  const isFullyCompleted = totalHabitsCount > 0 && completionPercent === 100

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
        <VStack align="stretch" gap={1}>
          <Heading>Habits</Heading>
          <Text color="fg.muted">
            Build consistency day by day and track completion on your selected date.
          </Text>
        </VStack>

        <Box {...surfaceCardProps} p={{ base: 5, md: 6 }}>
          <VStack align="center" gap={3}>
            <Text color="fg.muted" fontSize="sm">
              Completion for {dayjs(selectedDate).format("MMM D, YYYY")}
            </Text>

            <ProgressCircle.Root value={completionPercent} colorPalette="green">
              <ProgressCircle.Circle
                css={{
                  "--size": "220px",
                  "--thickness": "16px",
                }}
              >
                <ProgressCircle.Track />
                <ProgressCircle.Range />
              </ProgressCircle.Circle>
              <Box
                position="absolute"
                inset={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" lineHeight="1">
                  {completionPercent}%
                </Text>
              </Box>
            </ProgressCircle.Root>

            <Text fontSize="sm" color="fg.muted">
              {completedHabitsCount}/{totalHabitsCount} habits complete
            </Text>

            {isFullyCompleted ? (
              <Text color="green.600" fontWeight="semibold">
                All habits are done, good job!
              </Text>
            ) : null}
          </VStack>
        </Box>

        <Box {...surfaceCardProps}>
          <Box overflowX="auto" py={1}>
            <HStack w="fit-content" minW="100%" justify="center" gap={3}>
              {days.map((day) => {
                const isSelected = day.key === selectedDate

                return (
                  <VStack
                    key={day.key}
                    as="button"
                    type="button"
                    boxSize={{ base: "86px", md: "102px" }}
                    flexShrink={0}
                    justify="center"
                    borderWidth="1px"
                    borderRadius="full"
                    borderColor={
                      isSelected ? "blue.500" : day.isToday ? "green.500" : "border"
                    }
                    bg={isSelected ? "blue.500" : "bg"}
                    color={isSelected ? "white" : "inherit"}
                    boxShadow={isSelected ? "0 10px 20px rgba(59, 130, 246, 0.28)" : "none"}
                    gap={0}
                    cursor="pointer"
                    aria-pressed={isSelected}
                    transition="transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: isSelected
                        ? "0 12px 24px rgba(59, 130, 246, 0.32)"
                        : "0 8px 18px rgba(15, 23, 42, 0.12)",
                    }}
                    _active={{ transform: "translateY(0)" }}
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
        </Box>

        <Box {...surfaceCardProps}>
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
        </Box>
      </VStack>
    </Box>
  )
}
