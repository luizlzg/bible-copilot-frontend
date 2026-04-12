"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AlertCircle } from "lucide-react"
import { MessageBubble, StreamingBubble, TypingIndicator } from "@/components/shared/MessageBubble"
import { ChatInput } from "@/components/shared/ChatInput"
import { initSession } from "@/app/actions/sessions"
import { streamChat, getDeviceType } from "@/lib/api"
import type { ChatMessage } from "@/types"

interface ChatMessagesProps {
  sessionId: string | null
  initialMessages: ChatMessage[]
}

function getToolLabel(tool: string, input: Record<string, unknown>): string | null {
  switch (tool) {
    case "read_bible_file": {
      const path = (input.path as string) ?? ""
      const match = path.match(/([^/]+)\.md$/)
      if (match) {
        const slug = match[1]
        return `Lendo ${slug.charAt(0).toUpperCase() + slug.slice(1)}...`
      }
      return "Lendo livro..."
    }
    case "search_bible_text":
      return "Pesquisando nas Escrituras..."
    case "kg_cypher_query":
      return "Explorando o conhecimento bíblico..."
    case "list_conversation_history":
    case "grep_conversation_history":
    case "read_conversation_history":
      return "Consultando histórico da conversa..."
    case "BibleResponse":
      return "Preparando resposta..."
    default:
      return null
  }
}

export function ChatMessages({ sessionId: initialSessionId, initialMessages }: ChatMessagesProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [thinking, setThinking] = useState(false)
  const [toolActivity, setToolActivity] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  useEffect(() => {
    if (streamingContent) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" })
    }
  }, [streamingContent])

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
      setToolActivity(null)
      setStreamingContent("")

      try {
        let currentSessionId = sessionId
        let isNewSession = false
        if (!currentSessionId) {
          const { session_id } = await initSession()
          currentSessionId = session_id
          setSessionId(session_id)
          isNewSession = true
          window.history.replaceState(null, "", `/chat/${session_id}`)
        }

        const deviceType = getDeviceType()
        for await (const event of streamChat(currentSessionId, text, deviceType)) {
          if (event.type === "tool_start") {
            const label = getToolLabel(event.tool, event.input)
            if (label !== null) setToolActivity(label)
          } else if (event.type === "token") {
            setStreamingContent((prev) => prev + event.token)
          } else if (event.type === "done") {
            const response = event.data
            if (response.error) {
              setError(response.error)
            } else {
              const aiMsg: ChatMessage = {
                id: crypto.randomUUID(),
                message_id: response.message_id ?? undefined,
                role: "assistant",
                content: response.message,
                biblical_references: response.biblical_references ?? undefined,
                interpretation: response.interpretation ?? undefined,
                timestamp: new Date().toISOString(),
              }
              setMessages([...updatedMessages, aiMsg])
              window.dispatchEvent(new CustomEvent("sessions-updated"))
            }
            setThinking(false)
            setToolActivity(null)
            setStreamingContent("")
          } else if (event.type === "error") {
            setError(event.error)
            setThinking(false)
            setToolActivity(null)
            setStreamingContent("")
          }
        }
      } catch (err) {
        setThinking(false)
        setToolActivity(null)
        setStreamingContent("")
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

          {thinking && (
            streamingContent
              ? <StreamingBubble content={streamingContent} />
              : <TypingIndicator activity={toolActivity} />
          )}

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
