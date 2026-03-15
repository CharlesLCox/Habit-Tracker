import { SimpleGrid, Text } from "@chakra-ui/react"
import HabitCard from "./HabitCard"

export default function HabitList({ habits = [] }) {
  if (!habits.length) {
    return <Text color="fg.muted">No habits yet.</Text>
  }

  return (
    <SimpleGrid minChildWidth={{ base: "100%", md: "320px" }} gap={5}>
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </SimpleGrid>
  )
}
