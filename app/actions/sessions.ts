"use server"

import { createClient } from "@/lib/supabase/server"
import { createSession as createPythonSession } from "@/lib/api"
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

