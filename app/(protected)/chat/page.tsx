import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatMessages } from "@/components/shared/ChatMessages"

export default async function ChatIndexPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Show empty chat — session created lazily on first message
  return <ChatMessages sessionId={null} initialMessages={[]} />
}
