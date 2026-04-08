import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const { data } = await supabase
    .from("sessions")
    .select("session_id, num_user_messages, num_ai_messages, conversation_history, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return NextResponse.json(data ?? [])
}
