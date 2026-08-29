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
  Search,
  CheckCircle2
} from 'lucide-react'

interface AdminChatClientProps {
  currentUser: { id: string; name?: string | null; email?: string | null }
  initialThreads: any[]
}

export default function AdminChatClient({
  currentUser,
  initialThreads
}: AdminChatClientProps) {
  const [threads, setThreads] = useState(initialThreads)
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    initialThreads[0]?.id || ''
  )
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
      sender: { id: currentUser.id, name: currentUser.name || 'Owner', role: 'OWNER' },
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

  const filteredThreads = threads.filter(t => {
    const q = searchQuery.toLowerCase()
    return (
      t.user?.name?.toLowerCase().includes(q) ||
      t.property?.name?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[650px]">
      
      {/* Left Sidebar: Threads (4 cols) */}
      <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/40">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inquiries</span>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {threads.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search resident or PG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredThreads.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedThreadId(t.id)}
                className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                  selectedThreadId === t.id ? 'bg-white shadow-sm border-l-4 border-brand-primary' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {t.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-900 truncate">{t.user?.name || 'Resident'}</p>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {t.messages?.[0]?.createdAt ? new Date(t.messages[t.messages.length - 1]?.createdAt || t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold truncate block">{t.property?.name}</span>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {t.messages?.[t.messages.length - 1]?.content || 'New inquiry received'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Active Message Conversation (8 cols) */}
      <div className="md:col-span-8 flex flex-col h-full bg-white">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {selectedThread.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedThread.user?.name || 'Resident'}</h3>
                  <p className="text-[10px] text-slate-500">
                    Property: <strong className="text-slate-700">{selectedThread.property?.name}</strong> • Resident ID: {selectedThread.user?.id?.substring(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  Shielded Contact
                </span>
              </div>
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
                placeholder="Reply to resident inquiry..."
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
            Select an inquiry on the left to start chatting
          </div>
        )}
      </div>

    </div>
  )
}
