'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, Wallet, TrendingUp, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Portfolio Data Formatter ───────────────────────────────────────────────
function formatPortfolioContent(content: string): React.ReactNode {
  // Split by lines and apply formatting
  const lines = content.split('\n')
  return lines.map((line, i) => {
    // Bold patterns: **text**
    const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Currency patterns: $X,XXX or USD
    const colorFormatted = boldFormatted.replace(/(\$[\d,.]+(?:K|M|B)?(?:\s*USD)?)/g, '<span class="text-primary font-semibold">$1</span>')
    // Percentage patterns: X.X%
    const pctFormatted = colorFormatted.replace(/(\d+\.?\d*%)/g, '<span class="text-primary font-semibold">$1</span>')

    if (pctFormatted.includes('<strong>') || pctFormatted.includes('<span')) {
      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: pctFormatted }} />
      )
    }
    return <span key={i} className="block">{line || '\u00A0'}</span>
  })
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Send greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content:
          "¡Hola! 👋 Soy el asistente de GALAXY. Estoy aquí para ayudarte con preguntas sobre la plataforma 3GSP, inversiones, activos, pagos y más. ¿En qué puedo ayudarte?",
        timestamp: new Date(),
      }
      setMessages([greeting])
    }
  }, [isOpen, messages.length])

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      })

      if (!res.ok) {
        throw new Error('Chat request failed')
      }

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Lo siento, no pude procesar tu mensaje.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Lo siento, hubo un error de conexión. Por favor intenta de nuevo en un momento.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleChat = () => setIsOpen((prev) => !prev)

  const quickActions = [
    { label: 'Mi Portafolio', command: '/portafolio', icon: <Wallet className="size-3.5" /> },
    { label: 'Recomendar', command: '/recomendar', icon: <TrendingUp className="size-3.5" /> },
    { label: 'Mercado', command: '/mercado', icon: <ShoppingBag className="size-3.5" /> },
  ]

  // Check if message content looks like portfolio data
  const isPortfolioLike = (content: string) => {
    return content.includes('**') || /\$[\d,.]+/.test(content) || /\d+\.?\d*%/.test(content)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={cn(
            'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center',
            'rounded-full bg-primary text-primary-foreground shadow-lg',
            'transition-all duration-300 hover:scale-110 hover:shadow-xl',
            'cursor-pointer'
          )}
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex flex-col',
            'w-[calc(100vw-3rem)] sm:w-[380px] h-[520px] max-h-[80vh]',
            'rounded-2xl border border-border/50 bg-background shadow-2xl',
            'animate-in slide-in-from-bottom-4 fade-in-0 duration-300',
            'overflow-hidden'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">GALAXY AI</p>
                <p className="text-[11px] text-white/70 font-light">
                  {isLoading ? 'Escribiendo...' : 'En línea'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:bg-white/15 hover:text-white cursor-pointer"
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'flex items-start gap-2 max-w-[85%]',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
                      msg.role === 'assistant'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="h-3.5 w-3.5" />
                    ) : (
                      'U'
                    )}
                  </div>
                  {/* Bubble */}
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    {msg.role === 'assistant' && isPortfolioLike(msg.content)
                      ? formatPortfolioContent(msg.content)
                      : msg.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-3 pb-1">
            <div className="flex gap-1.5">
              {quickActions.map((action) => (
                <Button
                  key={action.command}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'flex-1 h-8 gap-1.5 text-xs rounded-lg border-border/40',
                    'bg-muted/50 hover:bg-muted cursor-pointer',
                    'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => sendMessage(action.command)}
                  disabled={isLoading}
                >
                  {action.icon}
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border/50 p-3 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 h-10 text-sm rounded-xl border-border/50 focus-visible:ring-primary/30"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 rounded-xl shrink-0 bg-primary hover:bg-primary/90 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center font-light">
              Escribe <span className="font-medium text-muted-foreground/80">/ayuda</span> para ver comandos
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5 text-center font-light">
              GALAXY AI may produce inaccurate information
            </p>
          </div>
        </div>
      )}
    </>
  )
}
