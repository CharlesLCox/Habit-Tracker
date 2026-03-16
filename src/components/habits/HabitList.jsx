import { Box, SimpleGrid, Skeleton, Text } from "@chakra-ui/react"
import HabitCard from "./HabitCard"

export default function HabitList({
  habits = [],
  isLoading = false,
  selectedDate,
  onComplete,
}) {
  if (isLoading) {
    return (
      <SimpleGrid minChildWidth={{ base: "100%", md: "320px" }} gap={5}>
        {Array.from({ length: 6 }, (_, index) => (
          <Box
            key={`habit-skeleton-${index}`}
            borderWidth="1px"
            borderRadius="30px"
            minH="250px"
            p={4}
          >
            <Skeleton h="100%" borderRadius="24px" />
          </Box>
        ))}
      </SimpleGrid>
    )
  }

  if (!habits.length) {
    return <Text color="fg.muted">No habits yet.</Text>
  }

  return (
    <SimpleGrid minChildWidth={{ base: "100%", md: "320px" }} gap={5}>
      {habits.map((habit) => (
        <HabitCard
          key={habit.habitId || habit.id}
          habit={habit}
          selectedDate={selectedDate}
          onComplete={onComplete}
        />
      ))}
    </SimpleGrid>
  )
}
