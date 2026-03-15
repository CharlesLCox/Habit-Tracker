import { useState } from "react"
import { Badge, Box, Button, HStack, Text, VStack } from "@chakra-ui/react"
import { Check, Plus } from "lucide-react"

const dayOrder = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export default function HabitCard({ habit }) {
  const [isMarked, setIsMarked] = useState(false)

  const sortedActiveDays = (habit.activeDays || []).slice().sort((a, b) => {
    return dayOrder.indexOf(a) - dayOrder.indexOf(b)
  })

  return (
    <Box
      borderWidth="1px"
      borderRadius="30px"
      p={4}
      minH="250px"
      display="flex"
      alignItems="stretch"
      borderColor={isMarked ? "green.600" : undefined}
      bg={isMarked ? "green.500" : undefined}
      color={isMarked ? "white" : undefined}
      transition="background-color 0.2s ease, border-color 0.2s ease"
    >
      <HStack align="center" justify="space-between" w="100%" h="100%" gap={4}>
        <VStack align="stretch" gap={3} flex="1" minW={0} h="100%">
          <Text fontSize="lg" fontWeight="semibold">
            {habit.name}
          </Text>

          <Text color={isMarked ? "whiteAlpha.900" : "fg.muted"} fontSize="sm">
            {habit.description}
          </Text>

          <HStack gap={2} flexWrap="wrap" mt="auto">
            {sortedActiveDays.map((day) => (
              <Badge
                key={`${habit.id}-${day}`}
                colorPalette={isMarked ? "green" : "teal"}
                variant={isMarked ? "solid" : "subtle"}
              >
                {day}
              </Badge>
            ))}
          </HStack>
        </VStack>

        <Button
          w="70px"
          h="70px"
          minW="70px"
          borderRadius="full"
          variant={isMarked ? "solid" : "outline"}
          colorPalette={isMarked ? "green" : "gray"}
          aria-label={isMarked ? "Habit completed" : "Mark habit complete"}
          onClick={() => setIsMarked((prev) => !prev)}
        >
          {isMarked ? <Check size={16} /> : <Plus size={16} />}
        </Button>
      </HStack>
    </Box>
  )
}
