import { useState } from "react"
import { Badge, Box, Button, HStack, Text, VStack } from "@chakra-ui/react"
import { motion, useAnimationControls } from "framer-motion"
import { BookOpen, Check, Cog, Hand, Heart, Plus, Users } from "lucide-react"

const dayOrder = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const categoryColorByName = {
  health: "green",
  learning: "blue",
  productivity: "purple",
  social: "orange",
  selfcare: "cyan",
}

const MotionDiv = motion.div

function getCategoryColorPalette(category) {
  if (!category) {
    return "gray"
  }

  const normalized = String(category).toLowerCase().replaceAll(" ", "")
  return categoryColorByName[normalized] || "gray"
}

function renderCategoryIcon(category, size = 16) {
  const normalized = String(category || "").toLowerCase().replaceAll(" ", "")

  if (normalized === "health") {
    return <Heart size={size} />
  }

  if (normalized === "learning") {
    return <BookOpen size={size} />
  }

  if (normalized === "selfcare") {
    return <Hand size={size} />
  }

  if (normalized === "social") {
    return <Users size={size} />
  }

  return <Cog size={size} />
}

export default function HabitCard({ habit }) {
  const [isMarked, setIsMarked] = useState(false)
  const shakeControls = useAnimationControls()
  const categoryColor = getCategoryColorPalette(habit.category)
  const cardBackground = isMarked ? `${categoryColor}.400` : `${categoryColor}.600`
  const cardBorder = isMarked ? `${categoryColor}.600` : `${categoryColor}.800`

  const sortedActiveDays = (habit.activeDays || []).slice().sort((a, b) => {
    return dayOrder.indexOf(a) - dayOrder.indexOf(b)
  })

  function runCompleteShake() {
    shakeControls.start({
      x: [0, -8, 8, -6, 6, 0],
      rotate: [0, -1.2, 1.2, -0.9, 0.9, 0],
      transition: {
        duration: 0.38,
        ease: "easeInOut",
      },
    })
  }

  return (
    <MotionDiv animate={shakeControls} style={{ width: "100%" }}>
      <Box
        borderWidth="1px"
        borderRadius="30px"
        p={4}
        minH="250px"
        display="flex"
        alignItems="stretch"
        borderColor={cardBorder}
        bg={cardBackground}
        color="white"
        transition="background-color 0.2s ease, border-color 0.2s ease"
      >
        <HStack align="center" justify="space-between" w="100%" h="100%" gap={4}>
          <VStack align="stretch" gap={3} flex="1" minW={0} h="100%">
            <Badge
              bg={isMarked ? "whiteAlpha.300" : "whiteAlpha.200"}
              color="white"
              borderWidth="1px"
              borderColor="whiteAlpha.400"
              alignSelf="flex-start"
            >
              {habit.category || "Uncategorized"}
            </Badge>

            <HStack align="center" gap={2}>
              {renderCategoryIcon(habit.category)}
              <Text fontSize="lg" fontWeight="semibold">
                {habit.name}
              </Text>
            </HStack>

            <Text color="whiteAlpha.900" fontSize="sm">
              {habit.description}
            </Text>

            <HStack gap={2} flexWrap="wrap" mt="auto">
              {sortedActiveDays.map((day) => (
                <Badge
                  key={`${habit.id}-${day}`}
                  bg={isMarked ? "whiteAlpha.300" : "whiteAlpha.200"}
                  color="white"
                  borderWidth="1px"
                  borderColor="whiteAlpha.400"
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
            variant="solid"
            bg={isMarked ? "whiteAlpha.950" : "whiteAlpha.300"}
            color={isMarked ? `${categoryColor}.700` : "white"}
            borderWidth="1px"
            borderColor="whiteAlpha.500"
            _hover={{
              bg: isMarked ? "white" : "whiteAlpha.400",
            }}
            aria-label={isMarked ? "Habit completed" : "Mark habit complete"}
            onClick={() =>
              setIsMarked((prev) => {
                const next = !prev
                if (next) {
                  runCompleteShake()
                }
                return next
              })
            }
          >
            {isMarked ? <Check size={16} /> : <Plus size={16} />}
          </Button>
        </HStack>
      </Box>
    </MotionDiv>
  )
}


