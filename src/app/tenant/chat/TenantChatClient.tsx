'use client'

import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '@/actions/chat.actions'
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  User, 
  Clock, 
  Search 
} from 'lucide-react'

interface TenantChatClientProps {
  currentUser: { id: string; name?: string | null; email?: string | null }
  initialThreads: any[]
}

export default function TenantChatClient({
  currentUser,
  initialThreads
}: TenantChatClientProps) {
  const [threads, setThreads] = useState(initialThreads)
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    initialThreads[0]?.id || ''
  )
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedThread?.messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedThread?.id) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUser.id,
      sender: { id: currentUser.id, name: currentUser.name || 'You', role: 'TENANT' },
      createdAt: new Date().toISOString()
    }

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          messages: [...(t.messages || []), tempMsg]
        }
      }
      return t
    }))

    try {
      const res = await sendChatMessage({
        threadId: selectedThread.id,
        content
      })
      if (res.success && res.message) {
        setThreads(prev => prev.map(t => {
          if (t.id === selectedThread.id) {
            return {
              ...t,
              messages: (t.messages || []).map((m: any) => m.id === tempMsg.id ? res.message : m)
            }
          }
          return t
        }))
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  if (threads.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Chat Inquiries Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          When you click &quot;Chat with Owner&quot; on any PG listing or room page, your conversation will appear here!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]">
      
      {/* Left Sidebar: Threads List (4 cols) */}
      <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conversations</span>
          <h3 className="text-xs font-bold text-slate-900 mt-0.5">Property Inquiries</h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedThreadId(t.id)}
              className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                selectedThreadId === t.id ? 'bg-white shadow-sm border-l-4 border-brand-primary' : 'hover:bg-slate-100/60'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                {t.property?.name?.substring(0, 2).toUpperCase() || 'PG'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{t.property?.name}</p>
                <span className="text-[11px] text-slate-500 truncate block">Owner: {t.owner?.name}</span>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {t.messages?.[t.messages.length - 1]?.content || 'Start a conversation...'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Messages View & Input (8 cols) */}
      <div className="md:col-span-8 flex flex-col h-full bg-white">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-brand-primary" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedThread.property?.name}</h3>
                  <p className="text-[10px] text-slate-500">
                    Owner: {selectedThread.owner?.name} • Privacy Shield Enabled
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                Secure In-App
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20">
              {selectedThread.messages?.map((msg: any) => {
                const isMe = msg.senderId === currentUser.id || msg.sender?.id === currentUser.id
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                        isMe
                          ? 'bg-brand-primary text-white rounded-br-none shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to the owner..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="w-10 h-10 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Select a thread to view conversation
          </div>
        )}
      </div>

    </div>
  )
}
