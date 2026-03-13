import TaskCard from "./TaskCard"

export default function TaskList({ tasks = [], toggle }) {
    return (
      <>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} toggle={toggle} />
        ))}
      </>
    )
  }