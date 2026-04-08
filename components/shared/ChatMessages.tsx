"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { MessageBubble, TypingIndicator } from "@/components/shared/MessageBubble"
import { ChatInput } from "@/components/shared/ChatInput"
import { initSession } from "@/app/actions/sessions"
import { sendChat } from "@/lib/api"
import type { ChatMessage } from "@/types"

interface ChatMessagesProps {
  sessionId: string | null
  initialMessages: ChatMessage[]
}

export function ChatMessages({ sessionId: initialSessionId, initialMessages }: ChatMessagesProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  const handleSend = useCallback(
    async (text: string) => {
      setError(null)

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setThinking(true)

      try {
        let currentSessionId = sessionId
        let isNewSession = false
        if (!currentSessionId) {
          const { session_id } = await initSession()
          currentSessionId = session_id
          setSessionId(session_id)
          isNewSession = true
          // Show correct URL immediately while waiting for AI
          window.history.replaceState(null, "", `/chat/${session_id}`)
        }

        const response = await sendChat(currentSessionId, text)

        if (response.error) {
          setError(response.error)
          setThinking(false)
          return
        }

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.message,
          biblical_references: response.biblical_references ?? undefined,
          interpretation: response.interpretation ?? undefined,
          timestamp: new Date().toISOString(),
        }

        setMessages([...updatedMessages, aiMsg])
        setThinking(false)

        // Refresh sidebar with new/updated session
        window.dispatchEvent(new CustomEvent("sessions-updated"))

        if (isNewSession) {
          // Sync Next.js router with the actual URL so Link navigation works correctly.
          // conversation_history is already in Supabase (backend wrote it),
          // so the page will load with the correct messages.
          router.replace(`/chat/${currentSessionId}`)
        }
      } catch (err) {
        setThinking(false)
        setError(
          err instanceof Error ? err.message : "Erro ao enviar mensagem. Tente novamente."
        )
      }
    },
    [sessionId, messages]
  )

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
    >
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !thinking && (
            <div className="text-center py-16 space-y-1.5">
              <p className="text-sm font-medium">Pergunte qualquer coisa sobre as Escrituras</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Exemplos: "O que a Bíblia diz sobre ansiedade?", "Me explique João 3:16", "Quais personagens femininas são mencionadas na Bíblia?"
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {thinking && <TypingIndicator />}

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 text-destructive px-3 py-2.5 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput onSend={handleSend} disabled={thinking} />
    </div>
  )
}
