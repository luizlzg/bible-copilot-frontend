"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy, ChevronDown, ChevronUp, BookOpen, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage, BiblicalReference } from "@/types"

function useCopy(getText: () => string) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(getText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return { copied, copy }
}

function CopyBtn({ getText, className }: { getText: () => string; className?: string }) {
  const { copied, copy } = useCopy(getText)
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 shrink-0", className)}
      onClick={copy}
      title="Copiar"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

function BiblicalReferences({ refs }: { refs: BiblicalReference[] }) {
  const [open, setOpen] = useState(false)
  if (refs.length === 0) return null

  function refsAsText() {
    return refs
      .map((ref) => {
        const range =
          ref.verse_start != null
            ? ref.verse_end != null && ref.verse_end !== ref.verse_start
              ? `${ref.verse_start}–${ref.verse_end}`
              : `${ref.verse_start}`
            : null
        const label = range ? `${ref.book} ${ref.chapter}:${range}` : `${ref.book} ${ref.chapter}`
        return ref.text ? `${label}\n${ref.text}` : label
      })
      .join("\n\n")
  }

  return (
    <div className="mt-2 border rounded-md overflow-hidden">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          <span>{refs.length} {refs.length === 1 ? "referência bíblica" : "referências bíblicas"}</span>
          {open ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
        </button>
        <CopyBtn getText={refsAsText} className="mr-1 opacity-60 hover:opacity-100" />
      </div>
      {open && (
        <div className="divide-y">
          {refs.map((ref, i) => {
            const range =
              ref.verse_start != null
                ? ref.verse_end != null && ref.verse_end !== ref.verse_start
                  ? `${ref.verse_start}–${ref.verse_end}`
                  : `${ref.verse_start}`
                : null
            const label = range ? `${ref.book} ${ref.chapter}:${range}` : `${ref.book} ${ref.chapter}`
            return (
              <div key={i} className="px-3 py-2 space-y-1">
                <p className="text-xs font-medium">{label}</p>
                {ref.text && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {ref.text.replace(/(\*\*\d+\*\*)/g, "\n\n$1")}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Interpretation({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2 border rounded-md overflow-hidden">
      <div className="flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Lightbulb className="h-3 w-3" />
          <span>Interpretação</span>
          {open ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
        </button>
        <CopyBtn getText={() => text} className="mr-1 opacity-60 hover:opacity-100" />
      </div>
      {open && (
        <div className="px-3 py-2.5">
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2.5">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start group">
      <div className="max-w-[80%] space-y-1">
        <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 relative">
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="absolute -bottom-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyBtn getText={() => message.content} />
          </div>
        </div>
        {message.biblical_references && message.biblical_references.length > 0 && (
          <BiblicalReferences refs={message.biblical_references} />
        )}
        {message.interpretation && (
          <Interpretation text={message.interpretation} />
        )}
      </div>
    </div>
  )
}

export function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        <span className="inline-block w-0.5 h-3.5 bg-muted-foreground/60 animate-pulse align-middle ml-0.5" />
      </div>
    </div>
  )
}

export function TypingIndicator({ activity }: { activity?: string | null }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          {activity && (
            <span className="text-xs text-muted-foreground">{activity}</span>
          )}
        </div>
      </div>
    </div>
  )
}
