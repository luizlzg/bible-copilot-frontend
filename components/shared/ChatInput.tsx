"use client"

import { useState, useRef, useEffect } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px"
  }, [value])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const msg = value.trim()
    if (!msg || loading || disabled) return

    setValue("")
    setLoading(true)
    try {
      await onSend(msg)
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t bg-background px-4 py-3"
      style={{ flexShrink: 0 }}
    >
      <div className="flex items-end gap-2 max-w-2xl mx-auto rounded-lg border bg-muted/30 px-3 py-2 focus-within:ring-1 focus-within:ring-ring transition-shadow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre as Escrituras…"
          rows={1}
          disabled={loading || disabled}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground min-h-[22px] max-h-[140px]",
            (loading || disabled) && "opacity-50"
          )}
        />
        <Button
          type="submit"
          size="icon"
          className="h-7 w-7 shrink-0"
          disabled={!value.trim() || loading || disabled}
        >
          <SendHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1.5">
        Enter para enviar · Shift+Enter para nova linha
      </p>
    </form>
  )
}
