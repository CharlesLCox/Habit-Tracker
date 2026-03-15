import { useEffect, useState } from "react"
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  HStack,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react"
import dayjs from "dayjs"
import { Trash2 } from "lucide-react"

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
  const countdownText = formatTimeLeft(task.dueDate, nowMs)

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

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="30px"
      minH="250px"
      display="flex"
      alignItems="center"
      onDragOver={onDragOver}
      onDrop={onDrop}
      borderColor={isDragOver ? "blue.400" : undefined}
      bg={isDragOver ? "blue.50" : undefined}
      w="100%"
    >
      <HStack justify="space-between" w="100%" align="flex-start">
        <HStack gap={3} align="flex-start" flex="1" minW={0}>
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

          <VStack align="stretch" gap={2} flex="1" minW={0}>
            <Checkbox.Root
              checked={task.completed === true}
              onCheckedChange={(details) =>
                toggle(task.taskId, details.checked === true)
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label
                textDecoration={task.completed ? "line-through" : "none"}
                fontWeight="medium"
              >
                {task.title}
              </Checkbox.Label>
            </Checkbox.Root>

            {task.description ? (
              <Text color="fg.muted" fontSize="sm" lineClamp="3">
                {task.description}
              </Text>
            ) : null}

            <HStack gap={2} flexWrap="wrap">
              <Badge colorPalette="blue" variant="subtle">
                {(task.priority || "medium").toUpperCase()}
              </Badge>
              {task.dueDate ? (
                <Badge colorPalette="purple" variant="subtle">
                  Due {task.dueDate}
                </Badge>
              ) : null}
            </HStack>
          </VStack>
        </HStack>

        <VStack align="flex-end" gap={2}>
          {countdownText ? (
            <Badge colorPalette={countdownText === "Past due" ? "red" : "green"} variant="subtle">
              {countdownText}
            </Badge>
          ) : null}

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
        </VStack>
      </HStack>
    </Box>
  )
}
