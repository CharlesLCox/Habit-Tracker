import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  Grid,
  HStack,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react"
import dayjs from "dayjs"
import { motion, useAnimationControls } from "framer-motion"
import { Trash2 } from "lucide-react"

const MotionDiv = motion.div
const GREEN_RGB = [34, 197, 94]
const ORANGE_RGB = [249, 115, 22]
const RED_RGB = [239, 68, 68]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function interpolateColor(start, end, t) {
  return start.map((startChannel, index) => {
    const endChannel = end[index]
    return Math.round(startChannel + (endChannel - startChannel) * t)
  })
}

function toRgbString(rgbChannels) {
  return `rgb(${rgbChannels[0]}, ${rgbChannels[1]}, ${rgbChannels[2]})`
}

function darkenColor(rgbChannels, amount = 0.18) {
  return rgbChannels.map((channel) => {
    return Math.round(channel * (1 - amount))
  })
}

function getTimeLeftRatio(task, nowMs) {
  if (!task?.dueDate || nowMs == null) {
    return null
  }

  const due = dayjs(task.dueDate)
  if (!due.isValid()) {
    return null
  }

  const remainingMs = due.valueOf() - nowMs
  if (remainingMs <= 0) {
    return 0
  }

  const created = dayjs(task.createdAt)
  if (!created.isValid()) {
    return null
  }

  const totalMs = due.valueOf() - created.valueOf()
  if (totalMs <= 0) {
    return null
  }

  return clamp(remainingMs / totalMs, 0, 1)
}

function getProgressBackgroundRgb(ratio) {
  if (ratio == null) {
    return null
  }

  if (ratio >= 0.3) {
    const t = (1 - ratio) / 0.7
    return interpolateColor(GREEN_RGB, ORANGE_RGB, clamp(t, 0, 1))
  }

  const t = (0.3 - ratio) / 0.3
  return interpolateColor(ORANGE_RGB, RED_RGB, clamp(t, 0, 1))
}

function formatTimeLeft(dueDate, nowMs) {
  if (!dueDate || nowMs == null) {
    return null
  }

  const due = dayjs(dueDate)
  if (!due.isValid()) {
    return null
  }

  const remainingMs = due.valueOf() - nowMs
  if (remainingMs <= 0) {
    return "Past due"
  }

  const dayMs = 24 * 60 * 60 * 1000
  const hourMs = 60 * 60 * 1000
  const minuteMs = 60 * 1000

  if (remainingMs >= dayMs) {
    const days = Math.floor(remainingMs / dayMs)
    const hours = Math.floor((remainingMs % dayMs) / hourMs)
    return `${days}d ${hours}h left`
  }

  if (remainingMs >= hourMs) {
    const hours = Math.floor(remainingMs / hourMs)
    const minutes = Math.floor((remainingMs % hourMs) / minuteMs)
    return `${hours}h ${minutes}m left`
  }

  const minutes = Math.floor(remainingMs / minuteMs)
  const seconds = Math.floor((remainingMs % minuteMs) / 1000)
  return `${minutes}m ${seconds}s left`
}

function formatDueDateLabel(dueDate) {
  if (!dueDate) {
    return null
  }

  const parsed = dayjs(dueDate)
  if (!parsed.isValid()) {
    return dueDate
  }

  return parsed.format("MMM D, h:mm A")
}

function getShakeConfig(ratio) {
  if (ratio == null || ratio <= 0) {
    return null
  }

  if (ratio <= 0.15) {
    return {
      intervalMs: 5000,
      amplitude: 12,
      rotate: 1.6,
      duration: 0.55,
    }
  }

  if (ratio <= 0.5) {
    return {
      intervalMs: 100000,
      amplitude: 4,
      rotate: 1,
      duration: 0.42,
    }
  }

  return null
}

export default function TaskCard({
  task,
  toggle,
  remove,
  draggable = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const [nowMs, setNowMs] = useState(null)
  const timeLeftRatio = getTimeLeftRatio(task, nowMs)
  const progressBgRgb = getProgressBackgroundRgb(timeLeftRatio)
  const progressBarRgb = progressBgRgb ? darkenColor(progressBgRgb, 0.18) : null
  const progressBgColor = progressBgRgb ? toRgbString(progressBgRgb) : null
  const progressBarColor = progressBarRgb ? toRgbString(progressBarRgb) : null
  const progressFillWidth =
    timeLeftRatio == null ? "0%" : `${Math.round(clamp(timeLeftRatio, 0, 1) * 10000) / 100}%`
  const hasProgressBackground = !!progressBgColor && !isDragOver
  const shakeConfig = useMemo(() => getShakeConfig(timeLeftRatio), [timeLeftRatio])
  const shakeControls = useAnimationControls()
  const countdownText = formatTimeLeft(task.dueDate, nowMs)
  const dueDateLabel = formatDueDateLabel(task.dueDate)

  useEffect(() => {
    const kickOff = setTimeout(() => {
      setNowMs(Date.now())
    }, 0)

    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      clearTimeout(kickOff)
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!shakeConfig) {
      shakeControls.stop()
      return undefined
    }

    const runShake = () => {
      shakeControls.start({
        x: [
          0,
          -shakeConfig.amplitude,
          shakeConfig.amplitude,
          -shakeConfig.amplitude * 0.8,
          shakeConfig.amplitude * 0.8,
          0,
        ],
        rotate: [
          0,
          -shakeConfig.rotate,
          shakeConfig.rotate,
          -shakeConfig.rotate * 0.7,
          shakeConfig.rotate * 0.7,
          0,
        ],
        transition: {
          duration: shakeConfig.duration,
          ease: "easeInOut",
        },
      })
    }

    runShake()
    const intervalId = setInterval(runShake, shakeConfig.intervalMs)

    return () => clearInterval(intervalId)
  }, [shakeConfig, shakeControls])

  return (
    <MotionDiv animate={shakeControls} style={{ width: "100%" }}>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="30px"
        minH="250px"
        display="flex"
        alignItems="stretch"
        position="relative"
        overflow="hidden"
        onDragOver={onDragOver}
        onDrop={onDrop}
        borderColor={isDragOver ? "blue.400" : undefined}
        bg={isDragOver ? "blue.50" : progressBgColor || undefined}
        color={hasProgressBackground ? "white" : undefined}
        transition="background-color 1s linear"
        w="100%"
      >
        {hasProgressBackground ? (
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w={progressFillWidth}
            bg={progressBarColor}
            transition="width 1s linear, background-color 1s linear"
            pointerEvents="none"
            zIndex={0}
          />
        ) : null}

        <Grid
          templateRows="auto 1fr auto"
          alignItems="stretch"
          w="100%"
          h="100%"
          gap={2}
          position="relative"
          zIndex={1}
        >
          <Grid templateColumns="auto 1fr auto" alignItems="center" gap={2}>
            <HStack gap={2}>
              <Checkbox.Root
                checked={task.completed === true}
                onCheckedChange={(details) =>
                  toggle(task.taskId, details.checked === true)
                }
                aria-label={`Mark ${task.title} as complete`}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Root>

              <Box
                as="span"
                draggable={draggable}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                cursor={draggable ? "grab" : "default"}
                _active={draggable ? { cursor: "grabbing" } : undefined}
                userSelect="none"
                title={draggable ? "Drag to reorder" : undefined}
                color="gray.500"
                fontWeight="bold"
                px={1}
              >
                ::
              </Box>
            </HStack>

            <Text
              textAlign="center"
              fontWeight="semibold"
              fontSize={{ base: "lg", md: "xl" }}
              textDecoration={task.completed ? "line-through" : "none"}
              lineClamp="1"
            >
              {task.title}
            </Text>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                  aria-label="Delete task"
                >
                  <Trash2 size={16} color="currentColor" />
                </Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Delete task?</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      <Dialog.Description>
                        Are you sure you want to delete "{task.title}"?
                      </Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </Dialog.ActionTrigger>
                      <Dialog.ActionTrigger asChild>
                        <Button
                          colorScheme="red"
                          onClick={() => remove(task.taskId)}
                        >
                          Confirm delete
                        </Button>
                      </Dialog.ActionTrigger>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </Grid>

          <Box display="flex" justifyContent="center" alignItems="center">
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              color={
                hasProgressBackground
                  ? "white"
                  : countdownText === "Past due"
                    ? "red.500"
                    : "green.500"
              }
              textAlign="center"
            >
              {countdownText || "No due date"}
            </Text>
          </Box>

          <HStack gap={2} flexWrap="wrap" alignSelf="flex-end" justifySelf="flex-start">
            <Badge colorPalette="blue" variant="subtle">
              {(task.priority || "medium").toUpperCase()}
            </Badge>
            {dueDateLabel ? (
              <Badge colorPalette="purple" variant="subtle">
                Due {dueDateLabel}
              </Badge>
            ) : null}
          </HStack>
        </Grid>
      </Box>
    </MotionDiv>
  )
}
