export type BiblicalReference = {
  book: string
  chapter: number
  verse_start?: number | null
  verse_end?: number | null
  text?: string | null
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  biblical_references?: BiblicalReference[]
  interpretation?: string | null
  timestamp: string
}

export type Session = {
  session_id: string
  user_id: string
  num_user_messages: number
  num_ai_messages: number
  conversation_history: ChatMessage[]
  created_at: string
  updated_at: string
}

export type ChatApiResponse = {
  thread_id: string
  message: string
  biblical_references?: BiblicalReference[] | null
  interpretation?: string | null
  error?: string | null
}
