import type { ChatApiResponse } from "@/types"

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://localhost:8000"

export async function createSession(): Promise<{ thread_id: string }> {
  const res = await fetch(`${PYTHON_API}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Failed to create session")
  return res.json()
}

export async function sendChat(
  threadId: string,
  message: string
): Promise<ChatApiResponse> {
  const res = await fetch(`${PYTHON_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, message }),
  })
  if (!res.ok) throw new Error("Chat request failed")
  return res.json()
}
