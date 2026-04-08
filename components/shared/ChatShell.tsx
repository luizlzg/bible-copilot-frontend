"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, BookOpen } from "lucide-react"
import { SessionSidebar } from "@/components/shared/SessionSidebar"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import type { Session } from "@/types"

interface ChatShellProps {
  sessions: Session[]
  email: string
  children: React.ReactNode
}

export function ChatShell({ sessions, email, children }: ChatShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      {/* Backdrop (all screen sizes) */}
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

      {/* Main content — always full width */}
      <div
        className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden" }}
      >
        {/* Top bar */}
        <div
          className="shrink-0 border-b px-4 py-2 flex items-center"
          style={{ flexShrink: 0, position: "relative" }}
        >
          <button
            className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="font-semibold text-sm">Bible Copilot</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={email}>
              {email}
            </span>
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
