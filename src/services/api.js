import { getAuth } from "./auth"

const API_URL = import.meta.env.VITE_API_URL

export async function getTasks() {
  const auth = getAuth()

  const res = await fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${auth?.idToken ?? ""}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status}`)
  }

  return res.json()
}

export async function createTask(taskInput) {
  const auth = getAuth()
  const payload =
    typeof taskInput === "string" ? { title: taskInput } : { ...taskInput }

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth?.idToken ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Failed to create task: ${res.status}`)
  }

  return res.json()
}

export async function deleteTask(taskId) {
  const auth = getAuth()

  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${auth?.idToken ?? ""}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to delete task: ${res.status}`)
  }

  return res.json()
}
