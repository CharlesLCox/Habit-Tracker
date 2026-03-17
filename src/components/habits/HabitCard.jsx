import { useState } from "react"
import { Badge, Box, Button, HStack, Text, VStack } from "@chakra-ui/react"
import dayjs from "dayjs"
import { motion, useAnimationControls } from "framer-motion"
import { BookOpen, Check, Cog, Flame, Hand, Heart, Plus, Users } from "lucide-react"
import {
  runCompleteShake,
  SUCCESS_BURST_COLORS,
  SUCCESS_BURST_PARTICLES,
} from "../ui/completionEffects"

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

function renderCategoryIcon(category, size = 20) {
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

function resolveDateKey(selectedDate) {
  const parsed = dayjs(selectedDate)
  if (parsed.isValid()) {
    return parsed.format("YYYY-MM-DD")
  }

  return dayjs().format("YYYY-MM-DD")
}

function getHabitStreak(activeDays, completedDates) {
  const scheduledDays = Array.isArray(activeDays)
    ? activeDays.filter((day) => dayOrder.includes(day))
    : []

  if (scheduledDays.length === 0) {
    return 0
  }

  const completedDateSet = new Set(
    (Array.isArray(completedDates) ? completedDates : [])
      .map((dateValue) => resolveDateKey(dateValue))
      .filter(Boolean)
  )

  let cursor = dayjs().startOf("day")

  let lookback = 0
  while (!scheduledDays.includes(cursor.format("dddd")) && lookback < 7) {
    cursor = cursor.subtract(1, "day")
    lookback += 1
  }

  let streak = 0
  let iterations = 0
  while (iterations < 3660) {
    const weekday = cursor.format("dddd")

    if (scheduledDays.includes(weekday)) {
      const dateKey = cursor.format("YYYY-MM-DD")
      if (completedDateSet.has(dateKey)) {
        streak += 1
      } else {
        break
      }
    }

    cursor = cursor.subtract(1, "day")
    iterations += 1
  }

  return streak
}

export default function HabitCard({ habit, selectedDate, onComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successBurstTick, setSuccessBurstTick] = useState(0)
  const shakeControls = useAnimationControls()
  const habitKey = habit.habitId || habit.id || habit.title || habit.name
  const dateKey = resolveDateKey(selectedDate)
  const selectedWeekday = dayjs(dateKey).format("dddd")
  const categoryColor = getCategoryColorPalette(habit.category)
  const sortedActiveDays = (habit.activeDays || []).slice().sort((a, b) => {
    return dayOrder.indexOf(a) - dayOrder.indexOf(b)
  })
  const completedDates = Array.isArray(habit.completedDates)
    ? habit.completedDates
    : []
  const isFutureSelectedDate = dayjs(dateKey).isAfter(dayjs(), "day")
  const isCompletedForDate = completedDates.includes(dateKey)
  const isActiveOnSelectedDay = sortedActiveDays.includes(selectedWeekday)
  const streakCount = getHabitStreak(sortedActiveDays, completedDates)
  const isMarked = isCompletedForDate
  const cardBackground = isMarked ? `${categoryColor}.600` : `${categoryColor}.800`
  const cardBorder = isMarked ? `${categoryColor}.800` : `${categoryColor}`

  function runSuccessBurst() {
    setSuccessBurstTick((previousTick) => previousTick + 1)
  }

  async function handleComplete() {
    if (
      isCompletedForDate ||
      !isActiveOnSelectedDay ||
      isFutureSelectedDate ||
      isSubmitting
    ) {
      return
    }

    setIsSubmitting(true)

    try {
      const didComplete = onComplete
        ? await onComplete(habit.habitId || habit.id, dateKey)
        : true

      if (didComplete) {
        runSuccessBurst()
        runCompleteShake(shakeControls)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MotionDiv animate={shakeControls} style={{ width: "100%", position: "relative" }}>
      {successBurstTick > 0 ? (
        <Box
          position="absolute"
          inset="-45px"
          pointerEvents="none"
          zIndex={4}
          overflow="visible"
        >
          {SUCCESS_BURST_PARTICLES.map((particle, index) => {
            const lineHeight = 16 + (index % 4) * 7
            const lineWidth = index % 2 === 0 ? 3 : 4
            const travel = 46 + (index % 5) * 14
            const lineColor = SUCCESS_BURST_COLORS[index % SUCCESS_BURST_COLORS.length]

            return (
              <MotionDiv
                key={`${successBurstTick}-${particle.angle}`}
                style={{
                  position: "absolute",
                  left: `${particle.startX}%`,
                  top: `${particle.startY}%`,
                  width: `${lineWidth}px`,
                  height: `${lineHeight}px`,
                  marginLeft: `${-lineWidth / 2}px`,
                  marginTop: `${-lineHeight / 2}px`,
                  borderRadius: "999px",
                  background: lineColor,
                  transformOrigin: "50% 50%",
                  boxShadow: `0 0 8px ${lineColor}`,
                }}
                initial={{
                  opacity: 0,
                  scaleY: 0.15,
                  x: 0,
                  y: 0,
                  rotate: particle.angle + 90,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scaleY: [0.15, 1, 0.2],
                  x: [0, particle.outwardX * travel, particle.outwardX * (travel + 18)],
                  y: [0, particle.outwardY * travel, particle.outwardY * (travel + 18)],
                  rotate: particle.angle + 90,
                }}
                transition={{
                  duration: 0.62,
                  delay: index * 0.01,
                  ease: "easeOut",
                }}
              />
            )
          })}
        </Box>
      ) : null}

      <Box
        borderWidth="1px"
        borderRadius="30px"
        p={4}
        minH="250px"
        display="flex"
        alignItems="stretch"
        position="relative"
        overflow="hidden"
        borderColor={cardBorder}
        bg={cardBackground}
        color="white"
        boxShadow="0 6px 18px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.1)"
        transition="background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
        _hover={{
          boxShadow: "0 14px 34px rgba(15, 23, 42, 0.2), 0 4px 10px rgba(15, 23, 42, 0.12)",
          transform: "translateY(-3px)",
        }}
      >
        <Box position="absolute" top="3" right="3" zIndex={2}>
          <HStack
            gap="5px"
            px="13px"
            py="5px"
            borderRadius="full"
            bg="whiteAlpha.250"
            borderWidth="1px"
            borderColor="whiteAlpha.500"
          >
            <Flame size={18} color={isMarked ? "#fff7ed" : "#fed7aa"} />
            <Text fontSize="15px" fontWeight="bold" lineHeight="1">
              {streakCount}
            </Text>
          </HStack>
        </Box>

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
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="semibold">
                {habit.title || habit.name}
              </Text>
            </HStack>

            <Text color="whiteAlpha.900" fontSize="sm">
              {habit.description}
            </Text>

            <HStack gap={2} flexWrap="wrap" mt="auto">
              {sortedActiveDays.map((day) => (
                <Badge
                  key={`${habitKey}-${day}`}
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
            disabled={
              isCompletedForDate ||
              !isActiveOnSelectedDay ||
              isFutureSelectedDate ||
              isSubmitting
            }
            aria-label={
              isCompletedForDate
                ? "Habit completed for selected day"
                : isFutureSelectedDate
                  ? "Cannot complete habits on future dates"
                : !isActiveOnSelectedDay
                  ? `Habit not active on ${selectedWeekday}`
                  : "Mark habit complete"
            }
            onClick={handleComplete}
          >
            {isCompletedForDate ? <Check size={16} /> : <Plus size={16} />}
          </Button>

        </HStack>
      </Box>
    </MotionDiv>
  )
}
