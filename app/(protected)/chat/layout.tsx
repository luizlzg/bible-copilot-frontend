import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatShell } from "@/components/shared/ChatShell"
import type { Session } from "@/types"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: sessions }, { data: userInfo }] = await Promise.all([
    supabase
      .from("sessions")
      .select(
        "session_id, num_user_messages, num_ai_messages, conversation_history, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("user_information")
      .select("username")
      .eq("user_id", user.id)
      .single(),
  ])

  return (
    <ChatShell sessions={(sessions as Session[]) ?? []} email={user.email ?? ""} username={userInfo?.username}>
      {children}
    </ChatShell>
  )
}
