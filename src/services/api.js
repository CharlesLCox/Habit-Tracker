import { getAuth } from "./auth"

const API_URL = import.meta.env.VITE_API_URL

export async function getTasks() {
  const auth = getAuth()

  const res = await fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${auth?.accessToken ?? ""}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch tasks")
  }

  return res.json()
}