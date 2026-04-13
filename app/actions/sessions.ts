"use server"

import { createClient } from "@/lib/supabase/server"
import { createSession as createPythonSession } from "@/lib/api"
import type { ChatMessage } from "@/types"

export async function initSession(): Promise<{ session_id: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { thread_id } = await createPythonSession()

  await supabase.from("sessions").insert({
    session_id: thread_id,
    user_id: user.id,
  })

  return { session_id: thread_id }
}

export async function getLatestAssistantMessage(sessionId: string): Promise<ChatMessage | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("sessions")
    .select("conversation_history")
    .eq("session_id", sessionId)
    .single()

  const history = (data?.conversation_history ?? []) as ChatMessage[]
  const last = history[history.length - 1]
  if (last?.role === "assistant") return last
  return null
}

