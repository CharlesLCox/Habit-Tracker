import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Box,
  Button,
  Dialog,
  Grid,
  HStack,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react"
import dayjs from "dayjs"
import { motion, useAnimationControls } from "framer-motion"
import {
  BookOpen,
  Check,
  Cog,
  Hand,
  Heart,
  Menu as MenuIcon,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"

const MotionDiv = motion.div
const SUCCESS_BURST_PARTICLES = Array.from({ length: 32 }, (_, index) => {
  const angle = index * 18
  const radians = (angle * Math.PI) / 180
  const outwardX = Math.cos(radians)
  const outwardY = Math.sin(radians)
  const edgeDistance = 62 + (index % 3) * 3

  return {
    angle,
    outwardX,
    outwardY,
    startX: 50 + outwardX * edgeDistance,
    startY: 50 + outwardY * edgeDistance,
  }
})
const SUCCESS_BURST_COLORS = [
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#f97316",
]

const categoryStyleByName = {
  health: { label: "Health", palette: "green", rgb: [34, 197, 94] },
  learning: { label: "Learning", palette: "blue", rgb: [59, 130, 246] },
  productivity: { label: "Productivity", palette: "purple", rgb: [168, 85, 247] },
  social: { label: "Social", palette: "orange", rgb: [249, 115, 22] },
  selfcare: { label: "Selfcare", palette: "cyan", rgb: [6, 182, 212] },
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function toRgbString(rgbChannels) {
  return `rgb(${rgbChannels[0]}, ${rgbChannels[1]}, ${rgbChannels[2]})`
}

function darkenColor(rgbChannels, amount = 0.12) {
  return rgbChannels.map((channel) => {
    return Math.round(channel * (1 - amount))
  })
}

function desaturateColor(rgbChannels, amount = 0) {
  const gray = Math.round(
    rgbChannels[0] * 0.299 + rgbChannels[1] * 0.587 + rgbChannels[2] * 0.114
  )

  return rgbChannels.map((channel) => {
    return Math.round(channel * (1 - amount) + gray * amount)
  })
}

function normalizeCategoryKey(category) {
  return String(category || "")
    .toLowerCase()
    .replace(/\s+/g, "")
}

function getCategoryStyle(category) {
  const key = normalizeCategoryKey(category)
  return categoryStyleByName[key] || categoryStyleByName.productivity
}

function renderCategoryIcon(category, size = 20) {
  const key = normalizeCategoryKey(category)

  if (key === "health") {
    return <Heart size={size} />
  }

  if (key === "learning") {
    return <BookOpen size={size} />
  }

  if (key === "selfcare") {
    return <Hand size={size} />
  }

  if (key === "social") {
    return <Users size={size} />
  }

  return <Cog size={size} />
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

function getProgressOverlayRgb(categoryRgb, ratio) {
  if (ratio == null) {
    return null
  }

  const desaturationAmount = clamp(1 - ratio, 0, 1) * 0.78
  const desaturated = desaturateColor(categoryRgb, desaturationAmount)
  return darkenColor(desaturated, 0.1)
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

  if (ratio <= 0.3) {
    return {
      intervalMs: 10000,
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [successBurstTick, setSuccessBurstTick] = useState(0)

  const isCompleted = task.completed === true
  const categoryStyle = getCategoryStyle(task.category)
  const timeLeftRatio = getTimeLeftRatio(task, nowMs)
  const progressBarRgb = getProgressOverlayRgb(categoryStyle.rgb, timeLeftRatio)
  const progressBarColor = progressBarRgb ? toRgbString(progressBarRgb) : null
  const progressFillWidth =
    timeLeftRatio == null ? "0%" : `${Math.round(clamp(timeLeftRatio, 0, 1) * 10000) / 100}%`
  const hasProgressOverlay = !!progressBarColor && !isDragOver && !isCompleted

  const shakeConfig = useMemo(
    () => (isCompleted ? null : getShakeConfig(timeLeftRatio)),
    [isCompleted, timeLeftRatio]
  )
  const shakeControls = useAnimationControls()
  const countdownText = formatTimeLeft(task.dueDate, nowMs)
  const timeStatusText = isCompleted ? "Done!" : countdownText || "No due date"
  const dueDateLabel = formatDueDateLabel(task.dueDate)

  const cardBackgroundColor = isCompleted
    ? `${categoryStyle.palette}.600`
    : `${categoryStyle.palette}.800`
  const cardBorderColor = isCompleted
    ? `${categoryStyle.palette}.800`
    : `${categoryStyle.palette}`
  const metaTagBg = isCompleted ? "whiteAlpha.300" : "whiteAlpha.200"

  function runSuccessBurst() {
    setSuccessBurstTick((previousTick) => previousTick + 1)
  }

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
        borderColor={isDragOver ? "blue.400" : cardBorderColor}
        bg={isDragOver ? "blue.50" : cardBackgroundColor}
        color="white"
        boxShadow="0 6px 18px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.1)"
        transition="background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
        _hover={{
          boxShadow: "0 14px 34px rgba(15, 23, 42, 0.2), 0 4px 10px rgba(15, 23, 42, 0.12)",
          transform: "translateY(-3px)",
        }}
        w="100%"
      >
        {hasProgressOverlay ? (
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

        <Menu.Root positioning={{ placement: "bottom-end" }}>
          <Menu.Trigger asChild>
            <Button
              size="xs"
              variant="outline"
              aria-label="Open task actions"
              borderColor="whiteAlpha.700"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              position="absolute"
              top="4"
              right="4"
              zIndex={2}
            >
              <MenuIcon size={16} color="currentColor" />
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="150px">
                <Menu.Item value={`edit-${task.taskId}`} disabled>
                  <HStack gap={2}>
                    <Pencil size={14} />
                    <Text>Edit (coming soon)</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item
                  value={`delete-${task.taskId}`}
                  color="red.500"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <HStack gap={2}>
                    <Trash2 size={14} />
                    <Text>Delete</Text>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <Dialog.Root
          open={isDeleteDialogOpen}
          onOpenChange={(details) => setIsDeleteDialogOpen(details.open)}
        >
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
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      remove(task.taskId)
                      setIsDeleteDialogOpen(false)
                    }}
                  >
                    Confirm delete
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        <Button
          w="70px"
          h="70px"
          minW="70px"
          position="absolute"
          right="4"
          top="50%"
          transform="translateY(-50%)"
          borderRadius="full"
          variant="solid"
          bg={isCompleted ? "whiteAlpha.950" : "whiteAlpha.300"}
          color={isCompleted ? `${categoryStyle.palette}.700` : "white"}
          borderWidth="1px"
          borderColor="whiteAlpha.500"
          _hover={{
            bg: isCompleted ? "white" : "whiteAlpha.400",
          }}
          aria-label={isCompleted ? "Task completed" : "Mark task complete"}
          zIndex={2}
          disabled={isCompleted}
          onClick={() => {
            if (isCompleted) {
              return
            }

            runSuccessBurst()
            toggle(task.taskId, true)
          }}
        >
          {isCompleted ? <Check size={16} /> : <Plus size={16} />}
        </Button>

        <Box
          as="span"
          draggable={draggable}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          cursor={draggable ? "grab" : "default"}
          _active={draggable ? { cursor: "grabbing" } : undefined}
          userSelect="none"
          title={draggable ? "Drag to reorder" : undefined}
          color="whiteAlpha.800"
          fontWeight="bold"
          px={1}
          position="absolute"
          left="4"
          bottom="3"
          zIndex={2}
        >
          ::
        </Box>

        <Box
          position="relative"
          zIndex={1}
          w="100%"
          minH="218px"
          pr={{ base: "84px", md: "92px" }}
          pb={10}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <HStack align="center" gap={2} minW={0}>
            {renderCategoryIcon(task.category)}
            <Text
              textAlign="left"
              fontWeight="semibold"
              fontSize={{ base: "xl", md: "2xl" }}
              textDecoration={isCompleted ? "line-through" : "none"}
              lineClamp="1"
              minW={0}
            >
              {task.title}
            </Text>
          </HStack>

          <Text color="whiteAlpha.900" fontSize="sm">
            {task.description || `${categoryStyle.label} related task`}
          </Text>

          <HStack gap={2} flexWrap="wrap" minW={0}>
            <Badge bg={metaTagBg} color="white" borderWidth="1px" borderColor="whiteAlpha.400">
              {categoryStyle.label}
            </Badge>
            <Badge bg={metaTagBg} color="white" borderWidth="1px" borderColor="whiteAlpha.400">
              {(task.priority || "medium").toUpperCase()}
            </Badge>
            {dueDateLabel ? (
              <Badge
                bg={metaTagBg}
                color="white"
                borderWidth="1px"
                borderColor="whiteAlpha.400"
              >
                Due {dueDateLabel}
              </Badge>
            ) : null}
          </HStack>

          <Box flex="1" />
        </Box>

        <Text
          position="absolute"
          left="50%"
          bottom="3"
          transform="translateX(-50%)"
          fontSize="lg"
          fontWeight="semibold"
          fontVariantNumeric="tabular-nums"
          minW="12ch"
          color="white"
          textAlign="center"
          whiteSpace="nowrap"
          pointerEvents="none"
          zIndex={2}
        >
          {timeStatusText}
        </Text>
      </Box>
    </MotionDiv>
  )
}
