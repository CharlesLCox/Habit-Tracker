import { useState } from "react"
import { Box, SimpleGrid, Skeleton } from "@chakra-ui/react"
import { LayoutGroup, motion } from "framer-motion"
import TaskCard from "./TaskCard"

const MotionDiv = motion.div

export default function TaskList({
  tasks = [],
  isLoading = false,
  toggle,
  remove,
  reorder,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverTaskId, setDragOverTaskId] = useState(null)
  const canDrag = tasks.length > 1 && typeof reorder === "function"

  function resetDragState() {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }

  return (
    <LayoutGroup>
      <SimpleGrid minChildWidth={{ base: "100%", md: "320px" }} gap={5}>
        {isLoading
          ? Array.from({ length: 6 }, (_, index) => (
              <Box
                key={`task-skeleton-${index}`}
                borderWidth="1px"
                borderRadius="30px"
                minH="250px"
                p={4}
              >
                <Skeleton h="100%" borderRadius="24px" />
              </Box>
            ))
          : null}

        {tasks.map((task, index) => (
          <MotionDiv
            key={task.taskId}
            layout
            style={{ width: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              opacity: {
                duration: 0.14,
                delay: index * 0.05,
                ease: "easeOut",
              },
              layout: {
                type: "spring",
                stiffness: 550,
                damping: 40,
              },
            }}
          >
            <TaskCard
              task={task}
              toggle={toggle}
              remove={remove}
              draggable={canDrag}
              isDragOver={dragOverTaskId === task.taskId}
              onDragStart={(event) => {
                setDraggedTaskId(task.taskId)
                if (event?.dataTransfer) {
                  event.dataTransfer.effectAllowed = "move"
                  event.dataTransfer.setData("text/plain", task.taskId)
                }
              }}
              onDragOver={(event) => {
                if (!canDrag || !draggedTaskId) {
                  return
                }

                event.preventDefault()
                if (draggedTaskId !== task.taskId) {
                  setDragOverTaskId(task.taskId)
                }
              }}
              onDrop={(event) => {
                if (!canDrag || !draggedTaskId) {
                  return
                }

                event.preventDefault()
                if (draggedTaskId !== task.taskId) {
                  reorder?.(draggedTaskId, task.taskId)
                }
                resetDragState()
              }}
              onDragEnd={resetDragState}
            />
          </MotionDiv>
        ))}
      </SimpleGrid>
    </LayoutGroup>
  )
}
