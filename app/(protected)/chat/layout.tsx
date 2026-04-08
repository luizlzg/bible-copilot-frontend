import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SessionSidebar } from "@/components/shared/SessionSidebar"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
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

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "session_id, num_user_messages, num_ai_messages, conversation_history, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      <SessionSidebar sessions={(sessions as Session[]) ?? []} email={user.email ?? ""} />
      <div
        className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden" }}
      >
        <div className="shrink-0 border-b px-4 py-2 flex items-center justify-end gap-3" style={{ flexShrink: 0 }}>
          <span className="text-xs text-muted-foreground truncate" title={user.email ?? ""}>
            {user.email}
          </span>
          <ThemeToggle />
        </div>
        <main
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
