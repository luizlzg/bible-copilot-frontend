"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Session } from "@/types"

function formatSessionLabel(session: Session): string {
  const history = session.conversation_history
  if (history && history.length > 0) {
    const firstUserMsg = history.find((m) => m.role === "user")
    if (firstUserMsg) {
      return firstUserMsg.content.length > 38
        ? firstUserMsg.content.slice(0, 38) + "…"
        : firstUserMsg.content
    }
  }
  const date = new Date(session.created_at)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SessionSidebar({ sessions: initialSessions, email, onClose }: { sessions: Session[]; email: string; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>(initialSessions)

  useEffect(() => {
    async function refreshSessions() {
      const res = await fetch("/api/sessions")
      if (!res.ok) return
      const data: Session[] = await res.json()
      setSessions(data)
    }

    window.addEventListener("sessions-updated", refreshSessions)
    return () => window.removeEventListener("sessions-updated", refreshSessions)
  }, [])

  return (
    <aside
      className="w-56 shrink-0 border-r flex flex-col bg-background"
      style={{ width: "14rem", flexShrink: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}
    >
      <div className="shrink-0 px-2 py-2 pt-3" style={{ flexShrink: 0 }}>
        <Button
          variant={pathname === "/chat" ? "secondary" : "outline"}
          size="sm"
          className="w-full gap-1.5 h-8 text-xs"
          onClick={() => {
            onClose?.()
            window.dispatchEvent(new CustomEvent("new-conversation"))
            router.push("/chat")
          }}
        >
          <Plus className="h-3 w-3" />
          Nova conversa
        </Button>
      </div>

      <Separator />

      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
      >
        <div className="p-1.5 space-y-0.5">
          {sessions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 px-3">
              Nenhuma conversa ainda.
            </p>
          )}
          {sessions.map((session) => {
            const isActive = pathname === `/chat/${session.session_id}`
            return (
              <Link
                key={session.session_id}
                href={`/chat/${session.session_id}`}
                onClick={onClose}
                className={cn(
                  "flex items-start gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted",
                  isActive && "bg-muted font-medium"
                )}
              >
                <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="truncate leading-relaxed">
                  {formatSessionLabel(session)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

    </aside>
  )
}
