import TaskCard from "./TaskCard"

export default function TaskList({ tasks = [], toggle, remove }) {
  return (
    <>
      {tasks.map((task) => (
        <TaskCard
          key={task.taskId}
          task={task}
          toggle={toggle}
          remove={remove}
        />
      ))}
    </>
  )
}