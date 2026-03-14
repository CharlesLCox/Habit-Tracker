import { useState } from "react"
import TaskCard from "./TaskCard"

export default function TaskList({ tasks = [], toggle, remove, reorder }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverTaskId, setDragOverTaskId] = useState(null)
  const canDrag = tasks.length > 1

  function resetDragState() {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskCard
          key={task.taskId}
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
      ))}
    </>
  )
}
