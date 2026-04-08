import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatMessages } from "@/components/shared/ChatMessages"
import type { ChatMessage } from "@/types"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: session } = await supabase
    .from("sessions")
    .select("session_id, conversation_history")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .single()

  if (!session) notFound()

  const initialMessages: ChatMessage[] =
    (session.conversation_history as ChatMessage[]) ?? []

  return (
    <ChatMessages
      sessionId={sessionId}
      initialMessages={initialMessages}
    />
  )
}
