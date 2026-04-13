"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, BookOpen } from "lucide-react"
import { SessionSidebar } from "@/components/shared/SessionSidebar"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { UserMenu } from "@/components/shared/UserMenu"
import type { Session } from "@/types"

interface ChatShellProps {
  sessions: Session[]
  email: string
  username?: string | null
  children: React.ReactNode
}

export function ChatShell({ sessions, email, username, children }: ChatShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer, slides in/out */}
      <div
        className="fixed inset-y-0 left-0 z-30 transition-transform duration-200"
        style={{
          display: "flex",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SessionSidebar
          sessions={sessions}
          email={email}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden" }}
      >
        {/* Top bar */}
        <div
          className="shrink-0 border-b px-4 py-2"
          style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}
        >
          <button
            className="p-1 rounded-md hover:bg-muted transition-colors justify-self-start"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="font-semibold text-sm">Bíblia Copilot</span>
          </Link>

          <div className="flex items-center gap-2 justify-self-end">
            <UserMenu email={email} username={username} />
            <ThemeToggle />
          </div>
        </div>

        {/* Page content */}
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
