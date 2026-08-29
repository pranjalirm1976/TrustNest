'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { getOrCreateChatThread, sendChatMessage } from '@/actions/chat.actions'
import { 
  X, 
  MessageSquare, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  Lock,
  User,
  AlertCircle
} from 'lucide-react'

interface ChatWithOwnerModalProps {
  propertyId: string
  propertyName: string
  ownerName: string
  onClose: () => void
}

export default function ChatWithOwnerModal({
  propertyId,
  propertyName,
  ownerName,
  onClose,
}: ChatWithOwnerModalProps) {
  const { data: session, status: authStatus } = useSession()
  const [thread, setThread] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadThread() {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const res = await getOrCreateChatThread({ propertyId })
        if (res.success && res.thread) {
          setThread(res.thread)
          setMessages(res.thread.messages || [])
        } else {
          setErrorMsg(res.error || 'Failed to start chat thread.')
        }
      } catch (e: any) {
        setErrorMsg(e.message || 'Chat connection error.')
      } finally {
        setIsLoading(false)
      }
    }

    loadThread()
  }, [propertyId, session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !thread?.id) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Optimistic message append
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      sender: { id: session?.user?.id, name: session?.user?.name || 'You', role: 'TENANT' },
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await sendChatMessage({
        threadId: thread.id,
        content
      })
      if (res.success && res.message) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.message : m))
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm font-mono">
              {ownerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{ownerName}</h3>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  Verified Owner
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{propertyName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Notice Banner */}
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 flex items-center gap-2 text-[11px] text-indigo-900 font-medium shrink-0">
          <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
          <span>TrustNest In-App Chat: Phone &amp; WhatsApp numbers are shielded for privacy.</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
          {!session?.user ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Lock className="w-8 h-8 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800">Sign In to Chat</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Please log in to send a private message to the property owner.
              </p>
              <button
                onClick={() => signIn()}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          ) : isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
            </div>
          ) : errorMsg ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No messages yet. Send an inquiry below!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?.id === session.user.id || msg.sender?.name === 'You'
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
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
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        {session?.user && (
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about room availability, rent, or food..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
