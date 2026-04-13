"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy, ChevronDown, ChevronUp, BookOpen, Lightbulb, ThumbsUp, ThumbsDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage, BiblicalReference, WebSource } from "@/types"
import { updateMessageFeedback } from "@/app/actions/messages"

function useCopy(getText: () => string) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(getText())
    } catch {
      // Fallback for older mobile browsers
      const el = document.createElement("textarea")
      el.value = getText()
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
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
        <CopyBtn getText={refsAsText} className="mr-1" />
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
        <CopyBtn getText={() => text} className="mr-1" />
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

function processContentWithCitations(content: string, webSources: WebSource[]): string {
  if (!webSources || !webSources.length) return content
  return content.replace(/\[(\d+)\]/g, (match, num) => {
    const idx = parseInt(num) - 1
    if (idx >= 0 && idx < webSources.length) {
      return `[${num}](${webSources[idx].url})`
    }
    return match
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function citationLinkRenderer({ href, children }: any) {
  const text = String(children)
  const isCitation = /^\d+$/.test(text) && href
  if (isCitation) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
        <sup className="inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-semibold rounded-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
          {text}
        </sup>
      </a>
    )
  }
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
}

function WebSources({ sources }: { sources: WebSource[] }) {
  const [open, setOpen] = useState(false)
  if (!sources.length) return null

  return (
    <div className="mt-2 border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Globe className="h-3 w-3" />
        <span>{sources.length} {sources.length === 1 ? "fonte web" : "fontes web"}</span>
        {open ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>
      {open && (
        <div className="divide-y">
          {sources.map((source, i) => (
            <div key={i} className="px-3 py-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">[{i + 1}]</span>
                <div className="min-w-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline line-clamp-1 block"
                  >
                    {source.title || source.url}
                  </a>
                  {source.snippet && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{source.snippet}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FeedbackButtons({ messageId, initialFeedback }: { messageId: string; initialFeedback?: "like" | "dislike" | null }) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(initialFeedback ?? null)

  async function handleFeedback(value: "like" | "dislike") {
    const next = feedback === value ? null : value
    setFeedback(next)
    await updateMessageFeedback(messageId, next)
  }

  return (
    <div className="flex items-center gap-0.5 mt-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", feedback === "like" && "text-green-500")}
        onClick={() => handleFeedback("like")}
        title="Gostei"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", feedback === "dislike" && "text-red-500")}
        onClick={() => handleFeedback("dislike")}
        title="Não gostei"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
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

  const webSources = message.web_sources ?? []
  const processedContent = processContentWithCitations(message.content, webSources)

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-1">
        <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 relative">
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: citationLinkRenderer }}>
              {processedContent}
            </ReactMarkdown>
          </div>
          <div className="absolute -bottom-3 right-0">
            <CopyBtn getText={() => message.content} />
          </div>
        </div>
        {message.biblical_references && message.biblical_references.length > 0 && (
          <BiblicalReferences refs={message.biblical_references} />
        )}
        {message.interpretation && (
          <Interpretation text={message.interpretation} />
        )}
        {webSources.length > 0 && (
          <WebSources sources={webSources} />
        )}
        {message.message_id && (
          <FeedbackButtons messageId={message.message_id} initialFeedback={message.user_feedback} />
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
