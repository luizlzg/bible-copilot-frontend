"use client"

import { useState, useRef, useEffect } from "react"
import { User, LogOut } from "lucide-react"
import { signOut } from "@/app/actions/auth"

export function UserMenu({ email, username }: { email: string; username?: string | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="p-1 rounded-md hover:bg-muted transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="Conta"
      >
        <User className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-md z-50 min-w-max">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            {username && <div className="font-medium text-foreground">{username}</div>}
            <div>{email}</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
