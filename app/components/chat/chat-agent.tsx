"use client"

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import axios from 'axios'

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatState {
  messages: Message[]
  chatId?: string
}

export function ChatAgent() {
  const [chatState, setChatState] = useState<ChatState>({ messages: [] })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatState.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input }
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))
    setInput('')
    setIsLoading(true)

    try {
      const { data } = await api.post('/chat', {
        message: input,
        chatId: chatState.chatId
      })

      setChatState(prev => ({
        chatId: data.chatId,
        messages: [...prev.messages, { role: 'assistant', content: data.message }]
      }))
    } catch (error) {
      console.error('Error:', error)
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, { 
          role: 'assistant', 
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' 
        }]
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Update the messages rendering
  const messages = chatState.messages

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700 z-50"
        size="icon"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <MessageCircle className="h-5 w-5 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[320px] rounded-xl bg-white shadow-2xl border-0 z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 bg-green-600 p-3 text-white">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">ChayFood Assistant</span>
            </div>

            {/* Messages Area */}
            <ScrollArea className="h-[380px] bg-gray-50 p-3">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
                </div>
              )}
              
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "mb-4 flex items-start gap-3",
                      message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Bot className="h-8 w-8 rounded-full bg-green-100 p-1.5 text-green-600" />
                    ) : (
                      <User className="h-8 w-8 rounded-full bg-blue-100 p-1.5 text-blue-600" />
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[75%] shadow-sm",
                        message.role === 'assistant' 
                          ? "bg-white border border-gray-100" 
                          : "bg-green-600 text-white"
                      )}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <Bot className="h-8 w-8 rounded-full bg-green-100 p-1.5 text-green-600" />
                    <div className="flex gap-1 rounded-2xl bg-white border border-gray-100 px-4 py-2.5 shadow-sm">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t bg-white p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border-gray-200 text-sm"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="rounded-lg bg-green-600 hover:bg-green-700 h-9 w-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}