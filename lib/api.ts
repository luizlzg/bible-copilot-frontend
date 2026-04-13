import type { ChatApiResponse } from "@/types"

const PYTHON_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function createSession(): Promise<{ thread_id: string }> {
  const res = await fetch(`${PYTHON_API}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Failed to create session")
  return res.json()
}

export type ChatStreamEvent =
  | { type: "tool_start"; tool: string; input: Record<string, unknown> }
  | { type: "token"; token: string }
  | { type: "done"; data: ChatApiResponse }
  | { type: "error"; error: string }

export function getDeviceInfo(): Record<string, string> {
  const ua = navigator.userAgent
  return {
    type: /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop",
    ua,
    screen: `${screen.width}x${screen.height}`,
    lang: navigator.language ?? "",
    platform: navigator.platform ?? "",
  }
}

export async function* streamChat(
  threadId: string,
  message: string,
  deviceInfo: Record<string, string>
): AsyncGenerator<ChatStreamEvent> {
  const res = await fetch(`${PYTHON_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, message, device_info: deviceInfo }),
  })

  if (!res.ok) throw new Error("Chat request failed")
  if (!res.body) throw new Error("No response body")

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    let eventType = ""
    let dataLine = ""

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith("data: ")) {
        dataLine = line.slice(6).trim()
      } else if (line === "" && eventType) {
        try {
          const data = dataLine ? JSON.parse(dataLine) : {}
          if (eventType === "tool_start") {
            yield { type: "tool_start", tool: data.tool ?? "", input: data.input ?? {} }
          } else if (eventType === "token") {
            yield { type: "token", token: data.token ?? "" }
          } else if (eventType === "done") {
            yield { type: "done", data }
          } else if (eventType === "error") {
            yield { type: "error", error: data.error ?? "Erro desconhecido." }
          }
        } catch {
          // ignore malformed SSE lines
        }
        eventType = ""
        dataLine = ""
      }
    }
  }
}
